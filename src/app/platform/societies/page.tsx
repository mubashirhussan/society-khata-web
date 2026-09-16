'use client'

import { Building2, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { logout } from '@/store/authSlice'
import { useGetSocietiesQuery } from '@/features/platformApi'
import { formatDate } from '@/lib/utils'

export default function PlatformSocietiesPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { data, isLoading, isError } = useGetSocietiesQuery()

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
            <Building2 className="h-5 w-5 text-white" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Platform Manager</h1>
            <p className="text-xs text-slate-500">Society Khata — all registered societies</p>
          </div>
        </div>
        <button
          onClick={() => {
            dispatch(logout())
            router.replace('/login')
          }}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 p-6">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Societies Created</p>
          <p className="mt-1 text-3xl font-bold text-primary-700">
            {isLoading ? '—' : data?.totalCount ?? 0}
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-slate-800">Societies</h2>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-400">Loading...</div>
          ) : isError ? (
            <div className="p-8 text-center text-sm text-error-600">Failed to load societies.</div>
          ) : !data || data.societies.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">No societies have been created yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600">
                    <th className="px-4 py-3 text-left font-semibold">Sr #</th>
                    <th className="px-4 py-3 text-left font-semibold">Society Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold">Users</th>
                    <th className="px-4 py-3 text-left font-semibold">Created On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.societies.map((society, index) => (
                    <tr key={society.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{society.name}</td>
                      <td className="px-4 py-3 text-slate-600">{society.phone ?? '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{society.userCount}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(society.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
