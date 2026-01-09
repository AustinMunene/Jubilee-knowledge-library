-- Fix infinite recursion in profiles RLS policies
-- Run this in your Supabase SQL Editor

-- Drop and recreate the is_admin function with RLS bypass
drop function if exists is_admin();

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
  
  -- Re-enable RLS (though it's local scope, so this is just for clarity)
  set local row_security = on;
  
  return coalesce(user_role, 'user') = 'admin';
end;
$$ language plpgsql security definer;

-- Verify the function works
-- You can test with: SELECT is_admin();

