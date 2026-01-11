-- Alternative fix: Simplify profiles select policy to avoid is_admin() call for own profile
-- This is a safer approach that checks auth.uid() = id first, avoiding is_admin() when possible

-- Drop existing policy
drop policy if exists "profiles_select_owner_or_admin" on profiles;

-- Recreate with better logic ordering (check own profile first)
create policy "profiles_select_owner_or_admin" on profiles
  for select
  using (
    -- Check if user is querying their own profile first (fast path)
    (auth.uid() = id) OR 
    -- Only call is_admin() if not querying own profile
    (auth.uid() IS NOT NULL AND is_admin())
  );

-- The is_admin() function should still work, but this reduces calls to it
