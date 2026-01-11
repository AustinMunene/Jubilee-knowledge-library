-- Update request workflow schema
-- Run this in your Supabase SQL Editor
-- This adds request_id to borrow_records, cancelled status, constraints, and notifications table

-- Step 1: Add 'cancelled' status to request_status enum
do $$
begin
  if not exists (
    select 1 from pg_enum 
    where enumlabel = 'cancelled' 
    and enumtypid = (select oid from pg_type where typname = 'request_status')
  ) then
    alter type request_status add value 'cancelled';
  end if;
end $$;

-- Step 2: Add columns to requests table
alter table requests add column if not exists approved_at timestamptz;
alter table requests add column if not exists rejected_at timestamptz;
alter table requests add column if not exists cancelled_at timestamptz;
alter table requests add column if not exists approved_by uuid references profiles(id);
alter table requests add column if not exists rejected_by uuid references profiles(id);
alter table requests add column if not exists rejection_reason text;

-- Step 3: Add request_id to borrow_records table
alter table borrow_records add column if not exists request_id uuid references requests(id) on delete set null;

-- Step 4: Add constraint to ensure available_copies is between 0 and total_copies
alter table books drop constraint if exists books_available_copies_check;
alter table books add constraint books_available_copies_check 
  check (available_copies >= 0 and available_copies <= total_copies);

-- Step 5: Create notifications table for email queue
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  type text not null, -- 'request_created', 'request_approved', 'request_rejected', 'return_recorded', 'overdue_reminder'
  title text not null,
  message text,
  read boolean default false,
  created_at timestamptz default now(),
  metadata jsonb -- Store additional data like request_id, book_id, etc.
);

-- Step 6: Enable RLS on notifications
alter table notifications enable row level security;

-- Step 7: Create RLS policies for notifications
drop policy if exists "notifications_select_own" on notifications;
drop policy if exists "notifications_insert_service" on notifications;
drop policy if exists "notifications_update_own" on notifications;

create policy "notifications_select_own" on notifications
  for select
  using (auth.uid() = user_id);

create policy "notifications_insert_service" on notifications
  for insert
  with check (true); -- Allow inserts from any authenticated user (for now)

create policy "notifications_update_own" on notifications
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Step 8: Create atomic function to approve request
create or replace function approve_book_request(
  p_request_id uuid,
  p_approved_by uuid,
  p_due_days int default 14
)
returns uuid as $$
declare
  v_request requests%rowtype;
  v_borrow_id uuid;
  v_due_at timestamptz;
begin
  -- Get the request
  select * into v_request
  from requests
  where id = p_request_id
  for update; -- Lock the row
  
  -- Validate request exists and is pending
  if not found then
    raise exception 'Request not found';
  end if;
  
  if v_request.status != 'pending' then
    raise exception 'Request is not pending';
  end if;
  
  -- Check book availability
  if not exists (
    select 1 from books 
    where id = v_request.book_id 
    and available_copies > 0
  ) then
    raise exception 'Book is not available';
  end if;
  
  -- Calculate due date
  v_due_at := now() + (p_due_days || ' days')::interval;
  
  -- Update request status
  update requests
  set status = 'approved',
      approved_at = now(),
      approved_by = p_approved_by
  where id = p_request_id;
  
  -- Create borrow record
  insert into borrow_records (
    user_id,
    book_id,
    request_id,
    issued_at,
    due_at,
    status
  )
  values (
    v_request.user_id,
    v_request.book_id,
    p_request_id,
    now(),
    v_due_at,
    'active'
  )
  returning id into v_borrow_id;
  
  -- Decrement available copies
  update books
  set available_copies = available_copies - 1
  where id = v_request.book_id
  and available_copies > 0;
  
  if not found then
    raise exception 'Failed to decrement available copies';
  end if;
  
  -- Create notification
  insert into notifications (user_id, type, title, message, metadata)
  values (
    v_request.user_id,
    'request_approved',
    'Book Request Approved',
    'Your request for the book has been approved.',
    jsonb_build_object('request_id', p_request_id, 'book_id', v_request.book_id, 'borrow_id', v_borrow_id)
  );
  
  return v_borrow_id;
end;
$$ language plpgsql security definer;

-- Step 9: Create function to reject request
create or replace function reject_book_request(
  p_request_id uuid,
  p_rejected_by uuid,
  p_reason text default null
)
returns void as $$
declare
  v_request requests%rowtype;
begin
  -- Get the request
  select * into v_request
  from requests
  where id = p_request_id
  for update; -- Lock the row
  
  -- Validate request exists and is pending
  if not found then
    raise exception 'Request not found';
  end if;
  
  if v_request.status != 'pending' then
    raise exception 'Request is not pending';
  end if;
  
  -- Update request status
  update requests
  set status = 'rejected',
      rejected_at = now(),
      rejected_by = p_rejected_by,
      rejection_reason = p_reason
  where id = p_request_id;
  
  -- Create notification
  insert into notifications (user_id, type, title, message, metadata)
  values (
    v_request.user_id,
    'request_rejected',
    'Book Request Rejected',
    coalesce(p_reason, 'Your request for the book has been rejected.'),
    jsonb_build_object('request_id', p_request_id, 'book_id', v_request.book_id)
  );
end;
$$ language plpgsql security definer;

-- Step 10: Create function to return borrow
create or replace function return_book_borrow(
  p_borrow_id uuid,
  p_returned_by uuid
)
returns void as $$
declare
  v_borrow borrow_records%rowtype;
begin
  -- Get the borrow record
  select * into v_borrow
  from borrow_records
  where id = p_borrow_id
  for update;
  
  -- Validate borrow exists and is active
  if not found then
    raise exception 'Borrow record not found';
  end if;
  
  if v_borrow.status != 'active' and v_borrow.status != 'overdue' then
    raise exception 'Borrow record is not active';
  end if;
  
  -- Update borrow record
  update borrow_records
  set status = 'returned',
      returned_at = now()
  where id = p_borrow_id;
  
  -- Increment available copies
  update books
  set available_copies = least(available_copies + 1, total_copies)
  where id = v_borrow.book_id;
  
  -- Create notification
  insert into notifications (user_id, type, title, message, metadata)
  values (
    v_borrow.user_id,
    'return_recorded',
    'Book Return Recorded',
    'Your book return has been recorded.',
    jsonb_build_object('borrow_id', p_borrow_id, 'book_id', v_borrow.book_id)
  );
end;
$$ language plpgsql security definer;

-- Step 11: Grant execute permissions
grant execute on function approve_book_request(uuid, uuid, int) to authenticated;
grant execute on function reject_book_request(uuid, uuid, text) to authenticated;
grant execute on function return_book_borrow(uuid, uuid) to authenticated;

-- Note: These functions use SECURITY DEFINER, so they run with postgres privileges
-- This allows them to bypass RLS when needed

