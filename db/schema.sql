-- Supabase schema for Jubilee Knowledge Library

-- users (managed by Supabase auth, but keep profile table)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  username text unique,
  email text,
  role text default 'user',
  department text,
  profile_photo_url text,
  created_at timestamptz default now()
);

-- books
create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  category text,
  isbn text,
  cover_url text,
  description text,
  total_copies int not null default 1,
  available_copies int not null default 1,
  created_at timestamptz default now()
);

-- requests
do $$
begin
  if not exists (select 1 from pg_type where typname = 'request_status') then
    create type request_status as enum ('pending','approved','rejected');
  end if;
end$$;

create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  book_id uuid references books(id) on delete cascade,
  status request_status default 'pending',
  requested_at timestamptz default now()
);

-- borrow_records
do $$
begin
  if not exists (select 1 from pg_type where typname = 'borrow_status') then
    create type borrow_status as enum ('active','overdue','returned');
  end if;
end$$;

create table if not exists borrow_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  book_id uuid references books(id) on delete cascade,
  issued_at timestamptz default now(),
  due_at timestamptz,
  returned_at timestamptz,
  status borrow_status default 'active'
);

-- admin_approval_requests: track requests for admin role
do $$
begin
  if not exists (select 1 from pg_type where typname = 'approval_status') then
    create type approval_status as enum ('pending','approved','rejected');
  end if;
end$$;

create table if not exists admin_approval_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  requested_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references profiles(id),
  status approval_status default 'pending',
  unique(user_id)
);

-- reviews: user reviews for books
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  unique(book_id, user_id)
);

-- Row Level Security examples
-- Enable RLS on tables
alter table profiles enable row level security;
alter table requests enable row level security;
alter table borrow_records enable row level security;
alter table books enable row level security;
alter table admin_approval_requests enable row level security;
alter table reviews enable row level security;

-- Policies
-- Profiles: users can read their own profile; admins can read all
drop policy if exists "profiles_select_owner_or_admin" on profiles;
drop policy if exists "profiles_insert_self" on profiles;
drop policy if exists "profiles_update_self_or_admin" on profiles;
create policy "profiles_select_owner_or_admin" on profiles
  for select
  using (
    (auth.uid() = id) OR 
    is_admin()
  );

create policy "profiles_insert_self" on profiles
  for insert
  with check (auth.uid() = id);

create policy "profiles_update_self_or_admin" on profiles
  for update
  using (
    (auth.uid() = id) OR 
    is_admin()
  )
  with check (
    (auth.uid() = id) OR 
    is_admin()
  );

-- Requests: users can insert their own, view own; admins can view/approve
drop policy if exists "requests_insert_owner" on requests;
drop policy if exists "requests_select_owner_or_admin" on requests;
drop policy if exists "requests_update_admin" on requests;
create policy "requests_insert_owner" on requests
  for insert
  with check (auth.uid() = user_id);

create policy "requests_select_owner_or_admin" on requests
  for select
  using (
    (auth.uid() = user_id) OR 
    is_admin()
  );

create policy "requests_update_admin" on requests
  for update
  using (is_admin())
  with check (is_admin());

-- Borrow records: users see their own; admins see all
drop policy if exists "borrow_select_owner_or_admin" on borrow_records;
drop policy if exists "borrow_insert_by_admin_or_owner" on borrow_records;
create policy "borrow_select_owner_or_admin" on borrow_records
  for select
  using (
    (auth.uid() = user_id) OR 
    is_admin()
  );

create policy "borrow_insert_by_admin_or_owner" on borrow_records
  for insert
  with check (
    (auth.uid() = user_id) OR 
    is_admin()
  );

-- Books: public read, but restrict writes to admins
drop policy if exists "books_select_public" on books;
drop policy if exists "books_admin_insert" on books;
drop policy if exists "books_admin_update" on books;
drop policy if exists "books_admin_delete" on books;
create policy "books_select_public" on books
  for select
  using (true);

create policy "books_admin_insert" on books
  for insert
  to authenticated
  with check (is_admin());

create policy "books_admin_update" on books
  for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "books_admin_delete" on books
  for delete
  to authenticated
  using (is_admin());

-- Admin approval requests: users can create their own, admins can view and update all
drop policy if exists "admin_approval_insert_self" on admin_approval_requests;
drop policy if exists "admin_approval_select_self_or_admin" on admin_approval_requests;
drop policy if exists "admin_approval_update_admin" on admin_approval_requests;
create policy "admin_approval_insert_self" on admin_approval_requests
  for insert
  with check (auth.uid() = user_id);

create policy "admin_approval_select_self_or_admin" on admin_approval_requests
  for select
  using (
    (auth.uid() = user_id) OR 
    is_admin()
  );

create policy "admin_approval_update_admin" on admin_approval_requests
  for update
  using (is_admin())
  with check (is_admin());

-- Reviews: users can read all, create/update their own; admins can do everything
drop policy if exists "reviews_select_all" on reviews;
drop policy if exists "reviews_insert_own" on reviews;
drop policy if exists "reviews_update_own" on reviews;
drop policy if exists "reviews_delete_own_or_admin" on reviews;

create policy "reviews_select_all" on reviews
  for select
  using (true);

create policy "reviews_insert_own" on reviews
  for insert
  with check (auth.uid() = user_id);

create policy "reviews_update_own" on reviews
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "reviews_delete_own_or_admin" on reviews
  for delete
  using (
    (auth.uid() = user_id) OR 
    is_admin()
  );

-- Sample seed data (admin user should be created via Supabase auth console)
insert into books (title, author, category, isbn, total_copies, available_copies)
values
('Sample Book Title', 'Jane Doe', 'General', 'ISBN-0000', 3, 3)
on conflict do nothing;

-- Helper function to check if current user is admin (bypasses RLS to avoid recursion)
create or replace function is_admin()
returns boolean as $$
declare
  user_role text;
begin
  -- Temporarily disable RLS for this query to avoid infinite recursion
  set local row_security = off;
  
  select role into user_role
  from profiles
  where id = auth.uid();
  
  -- Re-enable RLS
  set local row_security = on;
  
  return coalesce(user_role, 'user') = 'admin';
end;
$$ language plpgsql security definer;

-- Helper RPCs to safely adjust available_copies
create or replace function decrement_book_available(p_book_id uuid)
returns void as $$
begin
  update books set available_copies = available_copies - 1 where id = p_book_id and available_copies > 0;
  if not found then
    raise exception 'no available copies';
  end if;
end;
$$ language plpgsql security definer;

create or replace function increment_book_available(p_book_id uuid)
returns void as $$
begin
  update books set available_copies = available_copies + 1 where id = p_book_id;
end;
$$ language plpgsql security definer;

-- Job: mark overdue borrow_records
create or replace function mark_overdue_borrows()
returns int as $$
declare
  updated int := 0;
begin
  update borrow_records set status = 'overdue'
  where status = 'active' and due_at < now();
  GET DIAGNOSTICS updated = ROW_COUNT;
  return updated;
end;
$$ language plpgsql security definer;

-- Function to handle admin approval
create or replace function approve_admin_request(p_request_id uuid, p_reviewed_by uuid)
returns void as $$
declare
  v_user_id uuid;
begin
  -- Get the user_id from the request
  select user_id into v_user_id from admin_approval_requests where id = p_request_id;
  
  if v_user_id is null then
    raise exception 'request not found';
  end if;
  
  -- Update the request status
  update admin_approval_requests
  set status = 'approved', reviewed_at = now(), reviewed_by = p_reviewed_by
  where id = p_request_id;
  
  -- Update the user's role
  update profiles set role = 'admin' where id = v_user_id;
end;
$$ language plpgsql security definer;

-- Function to handle admin rejection
create or replace function reject_admin_request(p_request_id uuid, p_reviewed_by uuid)
returns void as $$
begin
  update admin_approval_requests
  set status = 'rejected', reviewed_at = now(), reviewed_by = p_reviewed_by
  where id = p_request_id;
end;
$$ language plpgsql security definer;