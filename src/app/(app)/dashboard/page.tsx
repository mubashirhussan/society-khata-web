'use client'

import Link from 'next/link'
import {
  Building2,
  ShoppingCart,
  TrendingUp,
  Wallet,
  Receipt,
  Plus,
  UserPlus,
  FileText,
} from 'lucide-react'
import { useGetDashboardStatsQuery } from '@/features/dashboardApi'
import { formatPKR } from '@/lib/utils'
import { PERMS } from '@/lib/permissions'
import { usePermissions, useRequirePermission } from '@/hooks/usePermissions'

export default function DashboardPage() {
  useRequirePermission(PERMS.dashboardView)
  const { user, can } = usePermissions()
  const { data: stats, isLoading: loading } = useGetDashboardStatsQuery()

  const s = stats ?? {
    totalPlots: 0,
    totalShops: 0,
    totalSales: 0,
    totalReceived: 0,
    totalExpenses: 0,
    totalProperties: 0,
    totalPropertyValue: 0,
    totalOutstanding: 0,
  }

  const statCards = [
    { label: 'Total Plots', urdu: 'کل پلاٹ', value: s.totalPlots, icon: Building2, color: 'primary' },
    { label: 'Total Shops', urdu: 'کل دکان', value: s.totalShops, icon: ShoppingCart, color: 'accent' },
    { label: 'Total Sales', urdu: 'کل فروخت', value: s.totalSales, icon: TrendingUp, color: 'success' },
    { label: 'Total Received', urdu: 'کل وصولی', value: formatPKR(s.totalReceived), icon: Wallet, color: 'success' },
    { label: 'Total Expenses', urdu: 'کل اخراجات', value: formatPKR(s.totalExpenses), icon: Receipt, color: 'error' },
    { label: 'Total Outstanding', urdu: 'کل باقی', value: formatPKR(s.totalOutstanding), icon: FileText, color: 'warning' },
  ]

  const colorMap: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600',
    accent: 'bg-accent-50 text-accent-600',
    success: 'bg-success-50 text-success-600',
    error: 'bg-error-50 text-error-600',
    warning: 'bg-warning-50 text-warning-600',
  }

  const quickActions = [
    ...(can(PERMS.paymentsCreate)
      ? [{ label: 'Receive Payment', urdu: 'رقم وصول کریں', icon: Wallet, href: '/payments', color: 'bg-success-600 hover:bg-success-700' }]
      : []),
    ...(can(PERMS.expensesCreate)
      ? [{ label: 'Add Expense', urdu: 'خرچہ شامل کریں', icon: Receipt, href: '/expenses', color: 'bg-error-600 hover:bg-error-700' }]
      : []),
    ...(can(PERMS.propertiesCreate)
      ? [
          { label: 'Add Property', urdu: 'پلاٹ و گاہک شامل کریں', icon: Plus, href: '/properties', color: 'bg-primary-600 hover:bg-primary-700' },
          { label: 'New Client', urdu: 'نیا گاہک', icon: UserPlus, href: '/clients', color: 'bg-accent-600 hover:bg-accent-700' },
        ]
      : can(PERMS.propertiesView)
        ? [{ label: 'View Properties', urdu: 'جائیداد دیکھیں', icon: Building2, href: '/properties', color: 'bg-primary-600 hover:bg-primary-700' }]
        : []),
    ...(can(PERMS.reportsView)
      ? [{ label: 'Reports', urdu: 'رپورٹ', icon: FileText, href: '/reports', color: 'bg-accent-600 hover:bg-accent-700' }]
      : []),
  ]

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Dashboard <span className="font-urdu text-lg text-slate-500">ڈیش بورڈ</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Overview of {user?.tenantName || 'society'} accounts
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[card.color]}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500 font-medium">{card.label}</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">{loading ? '...' : card.value}</p>
            <p className="font-urdu text-xs text-slate-400 mt-0.5">{card.urdu}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Quick Actions <span className="font-urdu text-slate-400">فوری اقدامات</span>
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`${action.color} text-white rounded-xl p-4 flex flex-col items-start gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]`}
            >
              <action.icon className="w-5 h-5" />
              <div className="text-left">
                <p className="text-sm font-semibold">{action.label}</p>
                <p className="font-urdu text-xs opacity-80">{action.urdu}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">
          Sales Summary <span className="font-urdu text-slate-400">فروخت خلاصہ</span>
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-sm text-slate-600">
              Total Properties <span className="font-urdu text-xs text-slate-400">کل جائیداد</span>
            </span>
            <span className="text-sm font-bold text-slate-800">{s.totalProperties}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-sm text-slate-600">
              Total Property Value <span className="font-urdu text-xs text-slate-400">کل جائیداد قیمت</span>
            </span>
            <span className="text-sm font-bold text-slate-800">Rs {formatPKR(s.totalPropertyValue)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-sm text-slate-600">
              Total Received <span className="font-urdu text-xs text-slate-400">کل وصولی</span>
            </span>
            <span className="text-sm font-bold text-success-600">Rs {formatPKR(s.totalReceived)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-sm text-slate-600">
              Total Outstanding <span className="font-urdu text-xs text-slate-400">کل باقی</span>
            </span>
            <span className="text-sm font-bold text-warning-600">Rs {formatPKR(s.totalOutstanding)}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-600">
              Total Expenses <span className="font-urdu text-xs text-slate-400">کل اخراجات</span>
            </span>
            <span className="text-sm font-bold text-error-600">Rs {formatPKR(s.totalExpenses)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
