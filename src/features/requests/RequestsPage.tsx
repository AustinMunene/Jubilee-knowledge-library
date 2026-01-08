import React from 'react'
import { useUserRequests } from '../../hooks/useRequests'
import { useAuth } from '../../app/providers/AuthProvider'

export default function RequestsPage() {
  const { user } = useAuth()
  const { data: requests, isLoading } = useUserRequests()

  if (!user) return <div>Please sign in to view your requests.</div>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">My Requests</h2>
      {isLoading && <div>Loading...</div>}
      <div className="space-y-3">
        {requests?.map((r: any) => (
          <div key={r.id} className="bg-white p-3 rounded shadow">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">Request for book ID: {r.book_id}</div>
                <div className="text-sm text-gray-500">Status: {r.status}</div>
              </div>
              <div className="text-sm text-gray-500">{new Date(r.requested_at).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
