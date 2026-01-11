-- Fix 500 Internal Server Error on profiles table
-- This script fixes the is_admin() function that's causing issues with profiles RLS policies
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the existing is_admin function if it exists
drop function if exists is_admin() cascade;

-- Step 2: Recreate is_admin() with proper error handling and RLS bypass
create or replace function is_admin()
returns boolean as $$
declare
  user_role text;
  user_id uuid;
begin
  -- Get the authenticated user ID
  user_id := auth.uid();
  
  -- If no user is authenticated, return false (not admin)
  if user_id is null then
    return false;
  end if;
  
  -- Disable RLS for this function's query to prevent recursion
  -- This is critical: without this, the function would trigger RLS policies
  -- which call is_admin() again, causing infinite recursion
  -- SET LOCAL row_security = off only affects the current transaction
  set local row_security = off;
  
  -- Query the profiles table directly (bypassing RLS)
  select role into user_role
  from profiles
  where id = user_id;
  
  -- Return true if role is 'admin', false otherwise
  -- If no profile exists (user_role is NULL), default to 'user' (not admin)
  return coalesce(user_role, 'user') = 'admin';
  
exception
  when others then
    -- If anything goes wrong (e.g., table doesn't exist, permission error, etc.)
    -- return false (not admin) to prevent breaking the query
    return false;
end;
$$ language plpgsql security definer stable;

-- Step 3: Grant execute permissions
grant execute on function is_admin() to authenticated;
grant execute on function is_admin() to anon;

-- Step 4: Test the function (optional - uncomment to test)
-- This should return true if you're an admin, false otherwise
-- SELECT is_admin();

-- Note: The function is marked as STABLE which helps PostgreSQL optimize
-- queries that call it. SECURITY DEFINER means it runs with the privileges
-- of the function owner (postgres), allowing it to bypass RLS.

