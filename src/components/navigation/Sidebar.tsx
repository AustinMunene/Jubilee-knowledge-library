import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, BookOpen, FileText, BookMarked, Settings, LogOut, Menu, BarChart3 } from 'lucide-react'
import { useAuth } from '../../app/providers/AuthProvider'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/app/dashboard' },
  { icon: BookOpen, label: 'Library', href: '/app/library' },
  { icon: FileText, label: 'Requests', href: '/app/requests' },
  { icon: BookMarked, label: 'Borrowed Books', href: '/app/my-borrows' },
]

const ADMIN_NAV_ITEMS = [
  { icon: BarChart3, label: 'Admin', href: '/app/admin' },
]

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/')

  const isAdmin = user?.role === 'admin'
  const navItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS

  return (
    <>
      {/* Sidebar */}
      <aside className={`w-sidebar bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ${isOpen ? '' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-red-600" />
            <span>Jubilee</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Knowledge Library</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-red-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Settings & Logout */}
        <div className="border-t border-slate-800 p-4 space-y-2">
          <Link
            to="/app/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive('/app/settings')
                ? 'bg-red-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  )
}
