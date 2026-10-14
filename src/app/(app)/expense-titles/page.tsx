'use client'

import { useState } from 'react'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import {
  useGetExpenseTitlesQuery,
  useCreateExpenseTitleMutation,
  useUpdateExpenseTitleMutation,
  useDeleteExpenseTitleMutation,
} from '@/features/expensesApi'
import { getApiError } from '@/lib/utils'
import { PERMS } from '@/lib/permissions'
import { usePermissions, useRequirePermission } from '@/hooks/usePermissions'
import { useConfirm } from '@/hooks/useConfirm'
import Modal from '@/components/Modal'
import type { ExpenseTitle } from '@/lib/types'

export default function ExpenseTitlesPage() {
  useRequirePermission(PERMS.expensesView)
  const { can } = usePermissions()
  const canCreate = can(PERMS.expensesCreate)
  const canEdit = can(PERMS.expensesEdit)
  const canDelete = can(PERMS.expensesDelete)
  const { data: titles = [], isLoading: loading } = useGetExpenseTitlesQuery()
  const [deleteTitle] = useDeleteExpenseTitleMutation()
  const { confirm, ConfirmDialog } = useConfirm()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<ExpenseTitle | null>(null)

  const filtered = titles.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Expense Categories <span className="font-urdu text-lg text-slate-500">اخراجات کے زمرے</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage categories used when adding expenses</p>
        </div>
        {canCreate && (
          <button
            onClick={() => {
              setEditing(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-error-600 hover:bg-error-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search... تلاش کریں"
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No categories yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-semibold">Category</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{t.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {canEdit && (
                        <button
                          onClick={() => {
                            setEditing(t)
                            setShowModal(true)
                          }}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={async () => {
                            if (await confirm(`Delete category "${t.name}"? Existing expenses will keep their records.`)) {
                              await deleteTitle(t.id)
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (canCreate || (editing && canEdit)) && (
        <TitleModal title={editing} onClose={() => setShowModal(false)} />
      )}
      {ConfirmDialog}
    </div>
  )
}

function TitleModal({ title, onClose }: { title: ExpenseTitle | null; onClose: () => void }) {
  const [createTitle] = useCreateExpenseTitleMutation()
  const [updateTitle] = useUpdateExpenseTitleMutation()
  const [name, setName] = useState(title?.name ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      if (title) await updateTitle({ id: title.id, name: name.trim() }).unwrap()
      else await createTitle({ name: name.trim() }).unwrap()
      onClose()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={title ? 'Edit Category' : 'Add Category'} onClose={onClose} maxWidth="max-w-sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Category <span className="font-urdu text-xs text-slate-400">زمرہ</span>
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="e.g. Electricity"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-lg px-3 py-2">{error}</div>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-error-600 hover:bg-error-700 text-white py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
