import React from 'react'

export function Skeleton() {
  return <div className="animate-pulse bg-gray-200 rounded h-12 w-full" />
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded shadow p-4 space-y-3">
      <Skeleton />
      <Skeleton />
      <div className="grid grid-cols-2 gap-2">
        <Skeleton />
        <Skeleton />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
