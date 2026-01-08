import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import AuthLayout from './layouts/AuthLayout'
import ProtectedRoute from './app/routes/ProtectedRoute'
import { useAuth } from './app/providers/AuthProvider'

// Pages
import LoginPage from './features/auth/LoginPage'
import Home from './features/home/Home'
import BooksPage from './features/books/BooksPage'
import BookDetailPage from './features/books/BookDetailPage'
import UserDashboard from './features/dashboard/UserDashboard'
import AdminDashboard from './features/dashboard/AdminDashboard'
import RequestsPage from './features/requests/RequestsPage'
import AdminRequestsPage from './features/requests/AdminRequestsPage'
import AdminBooksPage from './features/books/AdminBooksPage'
import AdminApprovalPage from './features/admin/AdminApprovalPage'
import SettingsPage from './features/profile/SettingsPage'

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/app" replace />
          ) : (
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          )
        }
      />

      {/* Protected Routes with Layout */}
      <Route
        element={<ProtectedRoute><AppLayout><Home /></AppLayout></ProtectedRoute>}
        path="/app"
      />

      <Route
        element={<ProtectedRoute><AppLayout><BooksPage /></AppLayout></ProtectedRoute>}
        path="/app/library"
      />

      <Route
        element={<ProtectedRoute><AppLayout><BookDetailPage /></AppLayout></ProtectedRoute>}
        path="/app/books/:id"
      />

      <Route
        element={<ProtectedRoute><AppLayout><UserDashboard /></AppLayout></ProtectedRoute>}
        path="/app/dashboard"
      />

      <Route
        element={<ProtectedRoute><AppLayout><UserDashboard /></AppLayout></ProtectedRoute>}
        path="/app/my-borrows"
      />

      <Route
        element={<ProtectedRoute><AppLayout><RequestsPage /></AppLayout></ProtectedRoute>}
        path="/app/requests"
      />

      <Route
        element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>}
        path="/app/admin"
      />

      <Route
        element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminRequestsPage /></AppLayout></ProtectedRoute>}
        path="/app/admin/requests"
      />

      <Route
        element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminBooksPage /></AppLayout></ProtectedRoute>}
        path="/app/admin/books"
      />

      <Route
        element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminApprovalPage /></AppLayout></ProtectedRoute>}
        path="/app/admin/approvals"
      />

      {/* Settings */}
      <Route
        element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>}
        path="/app/settings"
      />

      {/* Redirect root */}
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}
