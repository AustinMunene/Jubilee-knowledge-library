import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Search, Bell, User, LogOut } from 'lucide-react'
import { useAuth } from '../../app/providers/AuthProvider'

interface HeaderProps {
  onSidebarToggle: () => void
}

export default function Header({ onSidebarToggle }: HeaderProps) {
  const { user, signOut } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm px-6 flex items-center justify-between">
      {/* Left: Menu toggle + Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onSidebarToggle}
          className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 focus-within:text-white focus-within:border-indigo-500 transition-colors max-w-xs">
          <Search className="w-4 h-4" />
          <input
            type="text"
            placeholder="Search books, authors..."
            className="bg-transparent outline-none text-sm w-full placeholder-slate-500"
          />
        </div>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {user?.profile_photo_url ? (
              <img
                src={user.profile_photo_url}
                alt={user.name || user.username || 'User'}
                className="w-8 h-8 rounded-lg object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="hidden sm:block text-sm text-slate-300">
              <p className="font-medium">{user?.name || user?.username || user?.email?.split('@')[0] || 'User'}</p>
            </div>
          </button>

          {/* Profile menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
              <div className="p-3 border-b border-slate-700">
                <p className="text-sm font-medium text-white">{user?.name || user?.username || 'User'}</p>
                {user?.email && (
                  <p className="text-xs text-slate-400 mt-1">{user.email}</p>
                )}
                <p className="text-xs text-slate-400 mt-1 capitalize">{user?.role || 'user'}</p>
              </div>
              <Link
                to="/app/settings"
                onClick={() => setProfileOpen(false)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <User className="w-4 h-4" />
                Settings
              </Link>
              <button
                onClick={() => {
                  signOut()
                  setProfileOpen(false)
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
