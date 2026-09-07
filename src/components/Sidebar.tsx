'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
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
  UserRound,
  Shield,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { logout, setUser } from '@/store/authSlice'
import { api } from '@/store/api'
import { hasPermission, NAV_PERMISSIONS, PERMS } from '@/lib/permissions'
import { useGetTenantLogoQuery, useUploadTenantLogoMutation } from '@/features/authApi'
import Modal from '@/components/Modal'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', urdu: 'ڈیش بورڈ', icon: LayoutDashboard },
  { href: '/properties', label: 'Properties', urdu: 'جائیداد', icon: Building2 },
  { href: '/clients', label: 'Clients', urdu: 'گاہک', icon: UserRound },
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const canManageLogo = hasPermission(user?.permissions, PERMS.usersManage)
  const logoInputRef = useRef<HTMLInputElement | null>(null)
  const [uploadTenantLogo, { isLoading: uploadingLogo }] = useUploadTenantLogoMutation()
  const { data: logoBlob } = useGetTenantLogoQuery(undefined, { skip: !user?.hasLogo })
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!logoBlob) {
      setLogoUrl(null)
      return
    }
    const url = URL.createObjectURL(logoBlob)
    setLogoUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [logoBlob])

  const visibleNav = navItems.filter((item) => {
    const perm = NAV_PERMISSIONS[item.href]
    return perm ? hasPermission(user?.permissions, perm) : true
  })

  const handleLogout = () => {
    dispatch(logout())
    dispatch(api.util.resetApiState())
    setShowLogoutConfirm(false)
    router.replace('/login')
  }

  const handleLogoUpload = async (file: File | null) => {
    if (!file || !canManageLogo) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Please choose an image smaller than 5 MB.')
      return
    }
    try {
      const updatedUser = await uploadTenantLogo(file).unwrap()
      dispatch(setUser(updatedUser))
    } catch {
      alert('Failed to upload logo.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-primary-900 text-white flex flex-col transition-transform duration-300 no-print ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-primary-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => canManageLogo && logoInputRef.current?.click()}
              className={`w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ${
                canManageLogo ? 'hover:ring-2 hover:ring-primary-400 cursor-pointer' : ''
              }`}
              title={canManageLogo ? 'Change society logo' : undefined}
              disabled={uploadingLogo}
            >
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={user?.tenantName || 'Society logo'}
                  width={40}
                  height={40}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-5 h-5 text-white" />
              )}
            </button>
            <div className="min-w-0">
              <h1 className="font-bold text-base truncate">
                {user?.tenantName || 'Society Khata'}
              </h1>
              <p className="text-xs text-primary-300">Society Khata</p>
            </div>
          </div>
          {canManageLogo && (
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                void handleLogoUpload(event.target.files?.[0] ?? null)
                event.target.value = ''
              }}
            />
          )}
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
            onClick={() => setShowLogoutConfirm(true)}
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
          className="fixed inset-0 z-30 bg-black/40 lg:hidden no-print"
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
          <div className="flex items-center gap-2 min-w-0">
            {logoUrl && (
              <Image
                src={logoUrl}
                alt=""
                width={28}
                height={28}
                unoptimized
                className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <span className="font-bold text-slate-800 truncate">
              {user?.tenantName || 'Society Khata'}
            </span>
          </div>
        </header>

        <main className="p-4 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>

      {showLogoutConfirm && (
        <Modal title="Confirm Logout" onClose={() => setShowLogoutConfirm(false)} maxWidth="max-w-sm">
          <p className="text-sm text-slate-600">Are you sure you want to logout?</p>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 bg-error-600 hover:bg-error-700 text-white py-2.5 rounded-lg text-sm font-medium transition-all"
            >
              Logout
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
