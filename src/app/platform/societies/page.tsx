'use client'

import { useState, type FormEvent } from 'react'
import { Building2, LogOut, KeyRound, Trash2, Ban, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { logout } from '@/store/authSlice'
import {
  useGetSocietiesQuery,
  useSetSocietyActiveMutation,
  useResetSocietyAdminPasswordMutation,
  useDeleteSocietyMutation,
} from '@/features/platformApi'
import { formatDate, getApiError } from '@/lib/utils'
import { useConfirm } from '@/hooks/useConfirm'
import Modal, { ModalActions, Field, inputCls } from '@/components/Modal'
import { PasswordInput } from '@/components/FormInputs'
import type { SocietyOverview } from '@/lib/types'

export default function PlatformSocietiesPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { data, isLoading, isError } = useGetSocietiesQuery()
  const [setSocietyActive] = useSetSocietyActiveMutation()
  const [deleteSociety] = useDeleteSocietyMutation()
  const { confirm, ConfirmDialog } = useConfirm()
  const [resetTarget, setResetTarget] = useState<SocietyOverview | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SocietyOverview | null>(null)

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
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
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
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            society.isActive ? 'bg-success-100 text-success-700' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {society.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setResetTarget(society)}
                            disabled={!society.adminUserId}
                            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                            title={society.adminUserId ? 'Reset Admin Password' : 'No admin user found'}
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              const activating = !society.isActive
                              if (
                                await confirm(
                                  activating
                                    ? `Activate ${society.name}? Its users will be able to log in again.`
                                    : `Deactivate ${society.name}? All its users will be blocked from logging in.`,
                                  { title: activating ? 'Activate Society' : 'Deactivate Society', confirmLabel: activating ? 'Activate' : 'Deactivate' }
                                )
                              ) {
                                try {
                                  await setSocietyActive({ id: society.id, isActive: activating }).unwrap()
                                } catch (err) {
                                  alert(getApiError(err))
                                }
                              }
                            }}
                            className={`p-1.5 rounded-lg transition-all ${
                              society.isActive
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-slate-400 hover:text-success-600 hover:bg-success-50'
                            }`}
                            title={society.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {society.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(society)}
                            className="p-1.5 text-slate-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-all"
                            title="Delete Society"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {resetTarget && (
        <ResetAdminPasswordModal society={resetTarget} onClose={() => setResetTarget(null)} />
      )}
      {deleteTarget && (
        <DeleteSocietyModal society={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
      {ConfirmDialog}
    </div>
  )
}

function ResetAdminPasswordModal({ society, onClose }: { society: SocietyOverview; onClose: () => void }) {
  const [resetAdminPassword] = useResetSocietyAdminPasswordMutation()
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!newPassword) return
    setSaving(true)
    setError(null)
    try {
      await resetAdminPassword({ id: society.id, newPassword }).unwrap()
      onClose()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={`Reset Admin Password — ${society.name}`} onClose={onClose}>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault()
          handleSave()
        }}
        className="space-y-4"
      >
        {society.adminEmail && (
          <p className="text-xs text-slate-500">Admin account: {society.adminEmail}</p>
        )}
        <Field label="New Password" urdu="نیا پاس ورڈ">
          <PasswordInput
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            className={inputCls}
          />
        </Field>
        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-lg px-3 py-2">{error}</div>
        )}
        <ModalActions onSave={handleSave} saving={saving} onCancel={onClose} saveLabel="Reset Password" />
      </form>
    </Modal>
  )
}

function DeleteSocietyModal({ society, onClose }: { society: SocietyOverview; onClose: () => void }) {
  const [deleteSociety] = useDeleteSocietyMutation()
  const [confirmText, setConfirmText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const matches = confirmText.trim() === society.name

  const handleDelete = async () => {
    if (!matches) return
    setSaving(true)
    setError(null)
    try {
      await deleteSociety(society.id).unwrap()
      onClose()
    } catch (err) {
      setError(getApiError(err))
      setSaving(false)
    }
  }

  return (
    <Modal title={`Delete ${society.name}`} onClose={onClose} maxWidth="max-w-sm">
      <div className="space-y-4">
        <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-lg px-3 py-2">
          This permanently deletes the society and all its clients, properties, payments, expenses
          and users. This cannot be undone.
        </div>
        <Field label={`Type "${society.name}" to confirm`} urdu="">

          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className={inputCls}
            autoComplete="off"
          />
        </Field>
        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-lg px-3 py-2">{error}</div>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!matches || saving}
            onClick={handleDelete}
            className="flex-1 bg-error-600 hover:bg-error-700 disabled:opacity-40 disabled:hover:bg-error-600 text-white py-2.5 rounded-lg text-sm font-medium transition-all"
          >
            {saving ? 'Deleting...' : 'Delete Society'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
