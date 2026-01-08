import React from 'react'
import { useAdminRequests, useUpdateRequestStatus } from '../../hooks/useRequests'

export default function AdminRequestsPage() {
  const { data: requests, isLoading } = useAdminRequests()
  const mutation = useUpdateRequestStatus()

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
      <div className="space-y-3">
        {requests?.map((r: any) => (
          <div key={r.id} className="bg-white p-3 rounded shadow flex items-center justify-between">
            <div>
              <div className="font-medium">User: {r.user_id}</div>
              <div className="text-sm text-gray-500">Book: {r.book_id}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => mutation.mutate({ id: r.id, status: 'approved' })} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
              <button onClick={() => mutation.mutate({ id: r.id, status: 'rejected' })} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
