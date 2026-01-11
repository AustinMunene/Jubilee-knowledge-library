# Quick Fix Guide: 409 Error on Book Request

## Problem
Getting 409 Conflict error when requesting a book. Error code 23503 = Foreign key constraint violation.

## Root Cause
The `user_id` doesn't exist in the `profiles` table, causing the foreign key constraint to fail when inserting into `requests`.

## Solution

### Step 1: Run Database Schema Update

Run the SQL script `db/update_request_workflow.sql` in your Supabase SQL Editor. This will:

1. Add `cancelled` status to requests
2. Add `request_id` to `borrow_records` (links borrows to requests)
3. Add constraints on `available_copies`
4. Create `notifications` table
5. Create atomic functions for approve/reject/return

### Step 2: Fix Already Applied ✅

The code has been updated to:

1. **Check profile existence** before creating request (prevents 409 error)
2. **Use atomic functions** for approve/reject/return (ensures data consistency)
3. **Link borrow_records to requests** (full lifecycle tracking)
4. **Better error handling** (user-friendly error messages)

## Files Changed

- ✅ `src/services/requests.ts` - Added profile check, atomic approve/reject functions
- ✅ `src/services/borrow.ts` - Updated to use atomic return function
- ✅ `src/hooks/useRequests.ts` - New hooks: `useApproveRequest`, `useRejectRequest`
- ✅ `src/hooks/useBorrowRecords.ts` - Updated to fetch joined data
- ✅ `src/hooks/useReturnBorrow.ts` - Updated to use new return function
- ✅ `src/features/requests/AdminRequestsPage.tsx` - Uses new approve/reject hooks
- ✅ `src/types/index.ts` - Added Request, BorrowRecord, Review, Notification types
- ✅ `db/update_request_workflow.sql` - Complete schema update

## Testing

After running the SQL script, test:

1. **Request a book** - Should work without 409 error
2. **Admin approves** - Should create borrow record, decrement copies
3. **Admin rejects** - Should update request status, notify user
4. **Admin returns** - Should increment copies, update borrow status

## Next Steps

1. Run `db/update_request_workflow.sql` in Supabase SQL Editor
2. Test the request flow
3. If profiles endpoint still has 500 error, run `db/fix_profiles_500_error.sql`

