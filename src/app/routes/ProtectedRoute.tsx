import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: 'admin' | 'user' }> = ({ children, requiredRole }) => {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    // Store the attempted location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/app" replace />
  }
  
  return <>{children}</>
}

export default ProtectedRoute
