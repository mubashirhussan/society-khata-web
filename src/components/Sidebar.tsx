'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Wallet,
  Receipt,
  FileText,
  LogOut,
  Menu,
  X,
  Users,
  Shield,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { logout } from '@/store/authSlice'
import { api } from '@/store/api'
import { hasPermission, NAV_PERMISSIONS } from '@/lib/permissions'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', urdu: 'ڈیش بورڈ', icon: LayoutDashboard },
  { href: '/properties', label: 'Properties & Clients', urdu: 'پلاٹ و گاہک', icon: Building2 },
  { href: '/payments', label: 'Payments', urdu: 'ادائیگی', icon: Wallet },
  { href: '/expenses', label: 'Expenses', urdu: 'اخراجات', icon: Receipt },
  { href: '/reports', label: 'Reports', urdu: 'رپورٹ', icon: FileText },
  { href: '/users', label: 'Users', urdu: 'صارفین', icon: Users },
  { href: '/roles', label: 'Roles', urdu: 'کردار', icon: Shield },
]

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useDispatch()
  const user = useSelector((s: RootState) => s.auth.user)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const visibleNav = navItems.filter((item) => {
    const perm = NAV_PERMISSIONS[item.href]
    return perm ? hasPermission(user?.permissions, perm) : true
  })

  const handleLogout = () => {
    dispatch(logout())
    dispatch(api.util.resetApiState())
    router.replace('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-primary-900 text-white flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-primary-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-base truncate">
                {user?.tenantName || 'Society Khata'}
              </h1>
              <p className="text-xs text-primary-300">Society Khata</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {visibleNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-primary-200 hover:bg-primary-800'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
                <span className="font-urdu text-xs mr-auto opacity-70">{item.urdu}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-primary-800">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs text-primary-300 truncate">{user?.email}</p>
            <p className="text-[10px] text-primary-400 mt-0.5">{user?.roleName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-primary-200 hover:bg-error-600 hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
            <span className="font-urdu text-xs mr-auto opacity-70">لاگ آؤٹ</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 no-print">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-slate-100 rounded-lg"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-slate-800 truncate">
            {user?.tenantName || 'Society Khata'}
          </span>
        </header>

        <main className="p-4 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  )
}
