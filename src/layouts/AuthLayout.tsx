import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // The LoginPage now handles its own layout, so this is just a passthrough
  return <>{children}</>
}
