# Fix Profiles 500 Internal Server Error

## Problem

The `/rest/v1/profiles` endpoint is returning a 500 Internal Server Error. This is typically caused by the `is_admin()` function in the Row Level Security (RLS) policies on the `profiles` table.

## Root Cause

The `profiles` table has an RLS policy that uses the `is_admin()` function to determine if a user can view other users' profiles. The `is_admin()` function itself queries the `profiles` table, which can cause recursion issues if not properly handled.

## Solution

Run the fix script in your Supabase SQL Editor:

1. **Open Supabase Dashboard** → Your Project → **SQL Editor**
2. **Copy and paste** the contents of `db/fix_profiles_500_error.sql`
3. **Run the script**
4. **Test the endpoint** - it should now work correctly

## What the Fix Does

1. **Drops and recreates** the `is_admin()` function with proper error handling
2. **Uses `SECURITY DEFINER`** - runs with postgres privileges, allowing it to bypass RLS
3. **Uses `set_config('row_security', 'off', true)`** - disables RLS for the function's queries
4. **Adds exception handling** - returns `false` if anything goes wrong (prevents breaking queries)
5. **Marks function as `STABLE`** - helps PostgreSQL optimize queries

## Verification

After running the fix, test that the endpoint works:

1. In your browser's Network tab, check that profile queries return 200 OK instead of 500
2. Try logging in - profile should load correctly
3. Navigate to settings - profile should display properly

## Alternative: If Issues Persist

If the problem persists, you can temporarily simplify the RLS policy (though this reduces security):

```sql
-- Temporarily allow users to only see their own profile
drop policy if exists "profiles_select_owner_or_admin" on profiles;

create policy "profiles_select_owner_or_admin" on profiles
  for select
  using (auth.uid() = id);
```

**Warning**: This removes admin access to view all profiles. Only use as a temporary workaround while debugging.

## Related Files

- `db/fix_profiles_500_error.sql` - Main fix script
- `db/fix_profiles_rls.sql` - Alternative fix approach
- `db/schema.sql` - Full database schema

