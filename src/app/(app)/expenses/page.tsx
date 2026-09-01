'use client'

import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, X, Receipt } from 'lucide-react'
import {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from '@/features/expensesApi'
import { formatPKR, formatDate, getApiError } from '@/lib/utils'
import { PERMS } from '@/lib/permissions'
import { usePermissions, useRequirePermission } from '@/hooks/usePermissions'
import type { Expense } from '@/lib/types'

export default function ExpensesPage() {
  useRequirePermission(PERMS.expensesView)
  const { can } = usePermissions()
  const canCreate = can(PERMS.expensesCreate)
  const canEdit = can(PERMS.expensesEdit)
  const canDelete = can(PERMS.expensesDelete)
  const { data: expenses = [], isLoading: loading } = useGetExpensesQuery()
  const [deleteExpense] = useDeleteExpenseMutation()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const filtered = expenses.filter((e) => {
    const q = search.toLowerCase()
    return e.description.toLowerCase().includes(q) || (e.paidTo?.toLowerCase().includes(q) ?? false)
  })

  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0)

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Expenses <span className="font-urdu text-lg text-slate-500">اخراجات</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">Track all society expenses</p>
        </div>
        {canCreate && (
          <button
            onClick={() => {
              setEditingExpense(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-error-600 hover:bg-error-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Total Expenses <span className="font-urdu text-xs text-slate-400">کل اخراجات</span>
          </p>
          <p className="text-2xl font-bold text-error-600">Rs {formatPKR(totalExpenses)}</p>
        </div>
        <div className="w-12 h-12 bg-error-50 rounded-xl flex items-center justify-center">
          <Receipt className="w-6 h-6 text-error-600" />
        </div>
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
          <div className="p-8 text-center text-slate-400 text-sm">No expenses recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Description</th>
                  <th className="px-4 py-3 text-left font-semibold">Paid To</th>
                  <th className="px-4 py-3 text-left font-semibold">Amount</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600">{formatDate(e.expenseDate)}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{e.description}</td>
                    <td className="px-4 py-3 text-slate-600">{e.paidTo ?? '-'}</td>
                    <td className="px-4 py-3 font-bold text-error-600">Rs {formatPKR(e.amount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit && (
                          <button
                            onClick={() => {
                              setEditingExpense(e)
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
                              if (confirm(`Delete expense ${formatPKR(e.amount)}?`)) {
                                await deleteExpense(e.id)
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
          </div>
        )}
      </div>

      {showModal && (canCreate || (editingExpense && canEdit)) && (
        <ExpenseModal
          expense={editingExpense}
          onClose={() => setShowModal(false)}
          onSaved={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

function ExpenseModal({
  expense,
  onClose,
  onSaved,
}: {
  expense: Expense | null
  onClose: () => void
  onSaved: () => void
}) {
  const [createExpense] = useCreateExpenseMutation()
  const [updateExpense] = useUpdateExpenseMutation()
  const [description, setDescription] = useState(expense?.description ?? '')
  const [amount, setAmount] = useState(expense?.amount?.toString() ?? '')
  const [paidTo, setPaidTo] = useState(expense?.paidTo ?? '')
  const [expenseDate, setExpenseDate] = useState(
    expense?.expenseDate ?? new Date().toISOString().slice(0, 10)
  )
  const [notes, setNotes] = useState(expense?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!description.trim() || !amount) return
    setSaving(true)
    setError(null)
    const body = {
      description: description.trim(),
      amount: parseFloat(amount),
      paidTo: paidTo || null,
      expenseDate,
      notes: notes || null,
    }
    try {
      if (expense) {
        await updateExpense({ id: expense.id, body }).unwrap()
      } else {
        await createExpense(body).unwrap()
      }
      onSaved()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-bold text-slate-800">{expense ? 'Edit Expense' : 'Add Expense'}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description <span className="font-urdu text-xs text-slate-400">تفصیل</span>
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Amount (Rs) <span className="font-urdu text-xs text-slate-400">رقم</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date <span className="font-urdu text-xs text-slate-400">تاریخ</span>
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Paid To <span className="font-urdu text-xs text-slate-400">کس کو ادا کیا</span>
            </label>
            <input
              value={paidTo}
              onChange={(e) => setPaidTo(e.target.value)}
              placeholder="Enter name"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes <span className="font-urdu text-xs text-slate-400">نوٹس</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          {error && (
            <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>
        <div className="flex gap-3 p-5 pt-0">
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
    </div>
  )
}
