# Request → Approval → Borrow → Return Implementation Guide

This guide explains the complete workflow implementation for the Jubilee Knowledge Library.

## Database Setup

### Step 1: Run the Schema Update

Run the SQL script `db/update_request_workflow.sql` in your Supabase SQL Editor to:

1. Add `cancelled` status to `request_status` enum
2. Add columns to `requests` table (approved_at, rejected_at, cancelled_at, approved_by, rejected_by, rejection_reason)
3. Add `request_id` to `borrow_records` table
4. Add constraint on `books.available_copies` (0 <= available_copies <= total_copies)
5. Create `notifications` table for email queue
6. Create atomic functions: `approve_book_request`, `reject_book_request`, `return_book_borrow`

### Step 2: Fix Profiles Endpoint (if needed)

If you're getting 500 errors on the profiles endpoint, run `db/fix_profiles_500_error.sql` to fix the `is_admin()` function.

## Complete Workflow

### 1. User Requests a Book

**Flow:**
- User clicks "Request" on a book card or book detail page
- `createRequest(user_id, book_id)` is called
- Service checks:
  - Profile exists (prevents 409 foreign key error)
  - Book exists and is available
  - No existing pending request for this book
- Creates request with status `pending`
- Creates notification for admins (optional)
- Shows toast: "Request submitted"

**Files:**
- `src/services/requests.ts` - `createRequest()`
- `src/hooks/useRequests.ts` - `useCreateRequest()`
- `src/features/books/components/BookGridCard.tsx` - Request button
- `src/features/books/BookDetailPage.tsx` - Request button

### 2. Admin Approves Request

**Flow:**
- Admin navigates to "Requests" page (Admin Requests)
- Sees pending requests with user info and book details
- Clicks "Approve"
- `approveRequest(requestId, approvedBy)` is called
- Atomic function `approve_book_request()`:
  - Updates request: status=approved, approved_at, approved_by
  - Creates borrow_record: links to request_id, sets due_at (+14 days)
  - Decrements book.available_copies
  - Creates notification for user
- UI updates immediately
- Shows toast: "Request approved successfully"

**Files:**
- `src/services/requests.ts` - `approveRequest()`
- `src/hooks/useRequests.ts` - `useApproveRequest()`
- `src/features/requests/AdminRequestsPage.tsx` - Approve button
- `db/update_request_workflow.sql` - `approve_book_request()` function

### 3. Admin Rejects Request

**Flow:**
- Admin clicks "Reject" on a pending request
- Optional: Enter rejection reason
- `rejectRequest(requestId, rejectedBy, reason)` is called
- Atomic function `reject_book_request()`:
  - Updates request: status=rejected, rejected_at, rejected_by, rejection_reason
  - Creates notification for user
- UI updates immediately
- Shows toast: "Request rejected"

**Files:**
- `src/services/requests.ts` - `rejectRequest()`
- `src/hooks/useRequests.ts` - `useRejectRequest()`
- `src/features/requests/AdminRequestsPage.tsx` - Reject button
- `db/update_request_workflow.sql` - `reject_book_request()` function

### 4. Admin Marks Book as Returned

**Flow:**
- Admin views active borrows (needs to be added to Admin Dashboard)
- Clicks "Return" on a borrow record
- `returnBorrow(borrowId, returnedBy)` is called
- Atomic function `return_book_borrow()`:
  - Updates borrow_record: status=returned, returned_at
  - Increments book.available_copies (ensures it doesn't exceed total_copies)
  - Creates notification for user
- UI updates immediately
- Shows toast: "Return recorded"

**Files:**
- `src/services/borrow.ts` - `returnBorrow()`
- `src/hooks/useReturnBorrow.ts` - `useReturnBorrow()`
- `db/update_request_workflow.sql` - `return_book_borrow()` function
- **TODO:** Create Admin Borrows page or add to existing admin pages

### 5. User Views Their Borrows

**Flow:**
- User navigates to "Borrowed Books" page
- Sees active, overdue, and returned borrows
- Displays: book title, author, issued date, due date, days borrowed
- Can see return status

**Files:**
- `src/services/borrow.ts` - `fetchUserBorrows()`
- `src/hooks/useBorrowRecords.ts` - `useUserBorrows()`
- `src/features/dashboard/UserDashboard.tsx` - Borrowed books section

## Key Features

### Atomic Operations

All critical operations (approve, reject, return) use PostgreSQL functions with `SECURITY DEFINER` to ensure atomicity:

- Prevents race conditions
- Ensures data consistency
- Handles errors gracefully

### Request ID Linking

`borrow_records` now has `request_id` which links back to the original request, allowing:

- Tracking the full lifecycle
- Showing request details in borrow records
- Better audit trail

### Notifications

The `notifications` table stores notifications that can be:
- Displayed in-app (future feature)
- Processed by an edge function to send emails
- Queued for batch processing

### Constraints

- `books.available_copies >= 0 AND available_copies <= total_copies`
- Prevents negative availability
- Prevents availability exceeding total copies

## Error Handling

The implementation includes robust error handling:

- **409 Conflict (Foreign Key)**: Profile doesn't exist - handled by checking profile existence first
- **Book not available**: Checked before creating request
- **Duplicate request**: Checked before inserting
- **Request not found**: Handled in approve/reject/return functions
- **Invalid status**: Only pending requests can be approved/rejected
- **Already returned**: Can't return a book that's already returned

## Testing Checklist

- [ ] User can request a book (when available)
- [ ] User cannot request same book twice (pending)
- [ ] User gets error if book not available
- [ ] Admin can see pending requests
- [ ] Admin can approve request (creates borrow, decrements copies)
- [ ] Admin can reject request (with optional reason)
- [ ] Admin can mark book as returned (increments copies)
- [ ] User can see their borrows
- [ ] Borrow records show request_id linking
- [ ] Available copies stay within constraints
- [ ] Notifications are created for all actions

## Next Steps

1. **Run the SQL script** `db/update_request_workflow.sql` in Supabase
2. **Test the workflow** end-to-end
3. **Create Admin Borrows page** (if needed) to view all borrows and mark returns
4. **Implement email notifications** using Supabase Edge Functions
5. **Add review functionality** after return

