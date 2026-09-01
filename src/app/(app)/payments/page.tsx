'use client'

import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, X, Printer, Wallet } from 'lucide-react'
import {
  useGetPaymentsQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
} from '@/features/paymentsApi'
import { useGetClientsQuery } from '@/features/clientsApi'
import { useGetPropertiesQuery } from '@/features/propertiesApi'
import { formatPKR, formatDate, numberToWords, getApiError } from '@/lib/utils'
import { PERMS } from '@/lib/permissions'
import { usePermissions, useRequirePermission } from '@/hooks/usePermissions'
import type { Client, Property, Payment } from '@/lib/types'

export default function PaymentsPage() {
  useRequirePermission(PERMS.paymentsView)
  const { user, can } = usePermissions()
  const tenantName = user?.tenantName
  const { data: payments = [], isLoading: loading } = useGetPaymentsQuery()
  const { data: clients = [] } = useGetClientsQuery()
  const { data: properties = [] } = useGetPropertiesQuery()
  const [deletePayment] = useDeletePaymentMutation()

  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [printReceipt, setPrintReceipt] = useState<Payment | null>(null)

  const canCreate = can(PERMS.paymentsCreate)
  const canEdit = can(PERMS.paymentsEdit)
  const canDelete = can(PERMS.paymentsDelete)

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase()
    return (
      (p.receiptNo?.toLowerCase().includes(q) ?? false) ||
      (p.client?.name?.toLowerCase().includes(q) ?? false) ||
      (p.property?.propertyNumber?.toLowerCase().includes(q) ?? false)
    )
  })

  const totalReceived = payments.reduce((s, p) => s + (p.amount || 0), 0)

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Payments <span className="font-urdu text-lg text-slate-500">ادائیگی</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">Track all received payments and print receipts</p>
        </div>
        {canCreate && (
          <button
            onClick={() => {
              setEditingPayment(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-success-600 hover:bg-success-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> Receive Payment
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Total Received <span className="font-urdu text-xs text-slate-400">کل وصولی</span>
          </p>
          <p className="text-2xl font-bold text-success-600">Rs {formatPKR(totalReceived)}</p>
        </div>
        <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
          <Wallet className="w-6 h-6 text-success-600" />
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
          <div className="p-8 text-center text-slate-400 text-sm">No payments recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-semibold">Receipt No</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Client</th>
                  <th className="px-4 py-3 text-left font-semibold">Property</th>
                  <th className="px-4 py-3 text-left font-semibold">Amount</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{p.receiptNo ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(p.paymentDate)}</td>
                    <td className="px-4 py-3 text-slate-600">{p.client?.name ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{p.property?.propertyNumber ?? '-'}</td>
                    <td className="px-4 py-3 font-bold text-success-600">Rs {formatPKR(p.amount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPrintReceipt(p)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                          title="Print Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => {
                              setEditingPayment(p)
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
                              if (confirm(`Delete payment of Rs ${formatPKR(p.amount)}?`)) {
                                await deletePayment(p.id)
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

      {showModal && (canCreate || (editingPayment && canEdit)) && (
        <PaymentModal
          payment={editingPayment}
          clients={clients}
          properties={properties}
          onClose={() => setShowModal(false)}
          onSaved={() => setShowModal(false)}
        />
      )}

      {printReceipt && (
        <ReceiptModal
          payment={printReceipt}
          tenantName={tenantName}
          onClose={() => setPrintReceipt(null)}
        />
      )}
    </div>
  )
}

function PaymentModal({
  payment,
  clients,
  properties,
  onClose,
  onSaved,
}: {
  payment: Payment | null
  clients: Client[]
  properties: Property[]
  onClose: () => void
  onSaved: () => void
}) {
  const [createPayment] = useCreatePaymentMutation()
  const [updatePayment] = useUpdatePaymentMutation()
  const [receiptNo, setReceiptNo] = useState(payment?.receiptNo ?? `R-${Date.now().toString().slice(-6)}`)
  const [clientId, setClientId] = useState(payment?.clientId ?? '')
  const [propertyId, setPropertyId] = useState(payment?.propertyId ?? '')
  const [amount, setAmount] = useState(payment?.amount?.toString() ?? '')
  const [paymentDate, setPaymentDate] = useState(
    payment?.paymentDate ?? new Date().toISOString().slice(0, 10)
  )
  const [notes, setNotes] = useState(payment?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!amount) return
    setSaving(true)
    setError(null)
    const body = {
      receiptNo: receiptNo || null,
      clientId: clientId || null,
      propertyId: propertyId || null,
      amount: parseFloat(amount),
      paymentDate,
      notes: notes || null,
    }
    try {
      if (payment) {
        await updatePayment({ id: payment.id, body }).unwrap()
      } else {
        await createPayment(body).unwrap()
      }
      onSaved()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  const filteredProperties = clientId ? properties.filter((p) => p.clientId === clientId) : properties

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-bold text-slate-800">Receive Cash Payment — نقد ادائیگی</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Receipt No <span className="font-urdu text-xs text-slate-400">رسید نمبر</span>
              </label>
              <input
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Payment Date <span className="font-urdu text-xs text-slate-400">ادائیگی کی تاریخ</span>
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Select Client <span className="font-urdu text-xs text-slate-400">گاہک منتخب کریں</span>
            </label>
            <select
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value)
                setPropertyId('')
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">— Select client... گاہک منتخب کریں —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Select Property <span className="font-urdu text-xs text-slate-400">پلاٹ منتخب کریں</span>
            </label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">— Select property... پلاٹ منتخب کریں —</option>
              {filteredProperties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.propertyNumber} ({p.propertyType})
                </option>
              ))}
            </select>
          </div>
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
            className="flex-1 bg-success-600 hover:bg-success-700 text-white py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Payment'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ReceiptModal({
  payment,
  tenantName,
  onClose,
}: {
  payment: Payment
  tenantName?: string
  onClose: () => void
}) {
  const client = payment.client
  const property = payment.property

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-fadeIn">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 no-print">
          <h3 className="font-bold text-slate-800">Payment Receipt — رسید</h3>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 hover:bg-primary-50 rounded-lg text-primary-600 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="print-area p-6">
          <div className="text-center mb-6 pb-4 border-b-2 border-primary-600">
            <h1 className="text-xl font-bold text-slate-900">{tenantName || 'Society Khata'}</h1>
            <p className="text-sm text-slate-500">Society Khata — سوسائٹی کھاتہ</p>
          </div>

          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">Payment Receipt — رسید</h2>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Receipt No:</span>
              <span className="font-medium text-slate-800">{payment.receiptNo ?? '-'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Date:</span>
              <span className="font-medium text-slate-800">{formatDate(payment.paymentDate)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Client Name:</span>
              <span className="font-medium text-slate-800">{client?.name ?? '-'}</span>
            </div>
            {client?.cnic && (
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">CNIC:</span>
                <span className="font-medium text-slate-800">{client.cnic}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Property:</span>
              <span className="font-medium text-slate-800">
                {property?.propertyNumber ?? '-'} ({property?.propertyType ?? '-'})
              </span>
            </div>
            <div className="flex justify-between py-2 border-b-2 border-slate-200">
              <span className="font-bold text-slate-700">Amount (in figures):</span>
              <span className="font-bold text-success-600 text-lg">Rs {formatPKR(payment.amount)}</span>
            </div>
            <div className="py-2">
              <span className="font-bold text-slate-700">Amount (in words):</span>
              <p className="text-slate-600 mt-1 italic">{numberToWords(payment.amount)}</p>
            </div>
            {payment.notes && (
              <div className="py-1 border-b border-slate-100">
                <span className="text-slate-500">Notes:</span>
                <p className="text-slate-600 mt-1">{payment.notes}</p>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-8 pt-4">
            <div className="text-center">
              <div className="border-t border-slate-300 w-32 pt-1">
                <p className="text-xs text-slate-500">Received By</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-slate-300 w-32 pt-1">
                <p className="text-xs text-slate-500">Client Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
