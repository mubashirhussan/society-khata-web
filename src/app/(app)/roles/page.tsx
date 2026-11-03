'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, KeyRound } from 'lucide-react'
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useRenameRoleMutation,
  useDeleteRoleMutation,
} from '@/features/rolesApi'
import type { Role } from '@/lib/types'
import { getApiError } from '@/lib/utils'
import { PERMS } from '@/lib/permissions'
import { useRequirePermission } from '@/hooks/usePermissions'
import Modal, { ModalActions, Field, inputCls } from '@/components/Modal'

export default function RolesPage() {
  const allowed = useRequirePermission(PERMS.rolesManage)
  const { data: roles = [], isLoading } = useGetRolesQuery(undefined, { skip: !allowed })
  const [createRole, { isLoading: creating }] = useCreateRoleMutation()
  const [renameRole, { isLoading: renaming }] = useRenameRoleMutation()
  const [deleteRole] = useDeleteRoleMutation()

  // null = closed, 'new' = create, Role = edit
  const [editing, setEditing] = useState<Role | 'new' | null>(null)
  const [name, setName] = useState('')
  const [modalError, setModalError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!allowed) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-400 text-sm">
        Redirecting...
      </div>
    )
  }

  const openModal = (target: Role | 'new') => {
    setEditing(target)
    setName(target === 'new' ? '' : target.name)
    setModalError(null)
  }

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setModalError('Role name is required.')
      return
    }
    setModalError(null)
    try {
      if (editing === 'new') {
        await createRole({ name: trimmed, permissionKeys: [] }).unwrap()
        setMessage(`Role "${trimmed}" created. Set its access from the Permissions page.`)
      } else if (editing) {
        await renameRole({ id: editing.id, name: trimmed }).unwrap()
        setMessage(`Role renamed to "${trimmed}".`)
      }
      setError(null)
      setEditing(null)
    } catch (err) {
      setModalError(getApiError(err))
    }
  }

  const handleDelete = async (role: Role) => {
    if (!window.confirm(`Delete role "${role.name}"?`)) return
    setError(null)
    setMessage(null)
    try {
      await deleteRole(role.id).unwrap()
      setMessage(`Role "${role.name}" deleted.`)
    } catch (err) {
      setError(getApiError(err))
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Roles <span className="font-urdu text-lg text-slate-500">کردار</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">Add, rename or remove roles</p>
        </div>
        <button
          onClick={() => openModal('new')}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Role
        </button>
      </div>

      {message && (
        <div className="bg-success-50 border border-success-200 text-success-700 text-sm rounded-lg px-4 py-3">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Permissions</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3 font-medium text-slate-800">{role.name}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        role.isSystem ? 'bg-slate-100 text-slate-500' : 'bg-primary-50 text-primary-600'
                      }`}
                    >
                      {role.isSystem ? 'System' : 'Custom'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{role.permissions.length}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href="/permissions"
                        title="Manage permissions"
                        className="p-2 text-slate-500 hover:text-primary-600 hover:bg-slate-50 rounded-lg"
                      >
                        <KeyRound className="w-4 h-4" />
                      </Link>
                      {!role.isSystem && (
                        <>
                          <button
                            onClick={() => openModal(role)}
                            title="Edit"
                            className="p-2 text-slate-500 hover:text-primary-600 hover:bg-slate-50 rounded-lg"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(role)}
                            title="Delete"
                            className="p-2 text-slate-500 hover:text-error-600 hover:bg-error-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {roles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                    No roles yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <Modal
          title={editing === 'new' ? 'Add Role / نیا کردار' : 'Edit Role / کردار ترمیم'}
          onClose={() => setEditing(null)}
          maxWidth="max-w-md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSave()
            }}
          >
            {modalError && (
              <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-lg px-4 py-3 mb-4">
                {modalError}
              </div>
            )}
            <Field label="Role Name" urdu="کردار کا نام">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                placeholder="e.g. Manager"
                className={inputCls}
              />
            </Field>
            <ModalActions
              onSave={handleSave}
              saving={creating || renaming}
              onCancel={() => setEditing(null)}
              saveLabel={editing === 'new' ? 'Create' : 'Save'}
            />
          </form>
        </Modal>
      )}
    </div>
  )
}
