-- Fix profiles RLS recursion issue
-- This script ensures the is_admin() function properly bypasses RLS
-- Run this in your Supabase SQL Editor

-- First, drop the function to recreate it properly
drop function if exists is_admin() cascade;

-- Recreate is_admin() function with proper RLS bypass
-- SECURITY DEFINER runs with the privileges of the function owner (postgres)
-- SET LOCAL row_security = off bypasses RLS for this function's queries
create or replace function is_admin()
returns boolean as $$
declare
  user_role text;
  user_id uuid;
begin
  -- Get the current user ID
  user_id := auth.uid();
  
  -- If no user is authenticated, return false
  if user_id is null then
    return false;
  end if;
  
  -- Temporarily disable RLS for this function's queries
  -- This prevents infinite recursion when the function queries profiles
  set local row_security = off;
  
  -- Query the profiles table without RLS restrictions
  select role into user_role
  from profiles
  where id = user_id;
  
  -- Return true if role is 'admin', otherwise false
  return coalesce(user_role, 'user') = 'admin';
exception
  when others then
    -- If there's any error (e.g., profile doesn't exist), default to non-admin
    return false;
end;
$$ language plpgsql security definer;

-- Grant execute permission to authenticated users and anon (for testing)
grant execute on function is_admin() to authenticated, anon;

-- Test the function (optional - uncomment to test)
-- SELECT is_admin();

