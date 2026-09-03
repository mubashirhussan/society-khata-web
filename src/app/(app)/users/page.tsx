'use client'

import { useState, type FormEvent } from 'react'
import { Plus, Trash2, Users, Shield, UserCircle } from 'lucide-react'
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
} from '@/features/usersApi'
import { useGetAssignableRolesQuery } from '@/features/rolesApi'
import { formatDate, getApiError } from '@/lib/utils'
import { PERMS } from '@/lib/permissions'
import { usePermissions, useRequirePermission } from '@/hooks/usePermissions'
import Modal, { ModalActions, Field, inputCls } from '@/components/Modal'
import { PasswordInput } from '@/components/FormInputs'

export default function UsersPage() {
  const allowed = useRequirePermission(PERMS.usersView)
  const { can } = usePermissions()
  const canManage = can(PERMS.usersManage)

  const { data: users = [], isLoading: loading } = useGetUsersQuery(undefined, { skip: !allowed })
  const [deleteUser] = useDeleteUserMutation()
  const [showModal, setShowModal] = useState(false)

  if (!allowed) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-400 text-sm">
        Redirecting...
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Users <span className="font-urdu text-lg text-slate-500">صارفین</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage staff accounts for your society</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Role</th>
                  <th className="px-4 py-3 text-left font-semibold">Created</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  {canManage && <th className="px-4 py-3 text-right font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                          {u.roleName === 'Admin' ? (
                            <Shield className="w-4 h-4 text-primary-600" />
                          ) : (
                            <UserCircle className="w-4 h-4 text-primary-600" />
                          )}
                        </div>
                        <span className="font-medium text-slate-800">{u.fullName || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.roleName === 'Admin'
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-accent-100 text-accent-700'
                        }`}
                      >
                        {u.roleName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.isActive ? 'bg-success-100 text-success-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={async () => {
                              if (confirm(`Delete user ${u.email}?`)) {
                                try {
                                  await deleteUser(u.id).unwrap()
                                } catch (err) {
                                  alert(getApiError(err))
                                }
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && canManage && (
        <CreateUserModal onClose={() => setShowModal(false)} onSaved={() => setShowModal(false)} />
      )}
    </div>
  )
}

function CreateUserModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [createUser] = useCreateUserMutation()
  const { data: roles = [] } = useGetAssignableRolesQuery()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [roleId, setRoleId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultRoleId = roles.find((r) => r.name === 'Accountant')?.id ?? roles[0]?.id ?? ''
  const selectedRoleId = roleId || defaultRoleId

  const handleSave = async () => {
    if (!email.trim() || !password || !selectedRoleId) return
    setSaving(true)
    setError(null)
    try {
      await createUser({
        email: email.trim(),
        password,
        roleId: selectedRoleId,
        fullName: fullName.trim() || undefined,
      }).unwrap()
      onSaved()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Add User" onClose={onClose}>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault()
          handleSave()
        }}
        className="space-y-4"
      >
        <Field label="Full Name" urdu="نام">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Optional" className={inputCls} />
        </Field>
        <Field label="Email" urdu="ای میل">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" className={inputCls} />
        </Field>
        <Field label="Password" urdu="پاس ورڈ">
          <PasswordInput
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            className={inputCls}
          />
        </Field>
        <Field label="Role" urdu="کردار">
          <select value={selectedRoleId} onChange={(e) => setRoleId(e.target.value)} className={inputCls}>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </Field>
        <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 flex gap-2">
          <Users className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>Screen access is controlled from Roles & Permissions.</p>
        </div>
        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-lg px-3 py-2">{error}</div>
        )}
        <ModalActions onSave={handleSave} saving={saving} onCancel={onClose} saveLabel="Create User" />
      </form>
    </Modal>
  )
}
