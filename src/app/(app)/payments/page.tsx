'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, X, Printer } from 'lucide-react'
import {
  useGetPaymentsQuery,
  useGetPaymentLedgerQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
} from '@/features/paymentsApi'
import { useGetClientsQuery } from '@/features/clientsApi'
import { useGetPropertiesQuery } from '@/features/propertiesApi'
import { formatPKR, formatDate, numberToWords, getApiError } from '@/lib/utils'
import { PERMS } from '@/lib/permissions'
import { usePermissions, useRequirePermission } from '@/hooks/usePermissions'
import type { Client, Property, Payment, PaymentLedgerRow, PaymentRequest } from '@/lib/types'

export default function PaymentsPage() {
  useRequirePermission(PERMS.paymentsView)
  const router = useRouter()
  const { user, can } = usePermissions()
  const tenantName = user?.tenantName
  const { data: payments = [], isLoading: loading } = useGetPaymentsQuery()
  const { data: ledger = [], isLoading: ledgerLoading } = useGetPaymentLedgerQuery()
  const { data: clients = [] } = useGetClientsQuery()
  const { data: properties = [] } = useGetPropertiesQuery()

  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [printReceipt, setPrintReceipt] = useState<Payment | null>(null)
  const [receivingDue, setReceivingDue] = useState<PaymentLedgerRow | null>(null)

  const canCreate = can(PERMS.paymentsCreate)
  const canEdit = can(PERMS.paymentsEdit)

  const propertyClients = new Map(
    payments
      .filter((payment) => payment.propertyId && payment.clientId)
      .map((payment) => [payment.propertyId as string, payment.clientId as string])
  )
  const summaries = Array.from(
    payments.reduce((map, payment) => {
      const clientId = payment.clientId
        ?? payment.property?.clientId
        ?? (payment.propertyId ? propertyClients.get(payment.propertyId) : undefined)
      const client = payment.client ?? clients.find((item) => item.id === clientId)
      if (!clientId || !client) return map
      const current = map.get(clientId) ?? {
        client,
        totalReceived: 0,
        pendingAmount: 0,
        properties: new Set<string>(),
        propertyIds: new Set<string>(),
        lastPaymentDate: payment.paymentDate,
      }
      current.totalReceived += payment.amount
      if (payment.property?.propertyNumber) current.properties.add(payment.property.propertyNumber)
      if (payment.propertyId) current.propertyIds.add(payment.propertyId)
      if (payment.paymentDate > current.lastPaymentDate) current.lastPaymentDate = payment.paymentDate
      map.set(clientId, current)
      return map
    }, new Map<string, {
      client: Client
      totalReceived: number
      pendingAmount: number
      properties: Set<string>
      propertyIds: Set<string>
      lastPaymentDate: string
    }>())
  ).map(([clientId, summary]) => {
    const scheduledPropertyIds = new Set(
      ledger
        .filter((row) => row.rowType === 'installment' && row.clientId === clientId)
        .map((row) => row.propertyId)
        .filter(Boolean)
    )
    const scheduledPending = ledger
      .filter((row) => row.rowType === 'installment' && row.clientId === clientId)
      .reduce((sum, row) => sum + row.amount, 0)
    const unscheduledPending = Array.from(summary.propertyIds)
      .filter((propertyId) => !scheduledPropertyIds.has(propertyId))
      .reduce((sum, propertyId) => {
        const property = payments.find((payment) => payment.propertyId === propertyId)?.property
        const paid = payments
          .filter((payment) => payment.propertyId === propertyId)
          .reduce((paymentSum, payment) => paymentSum + payment.amount, 0)
        return sum + Math.max(0, (property?.totalPrice ?? paid) - paid)
      }, 0)

    return {
      clientId,
      ...summary,
      totalPlotAmount: Array.from(summary.propertyIds).reduce((sum, propertyId) => {
        const property = payments.find((payment) => payment.propertyId === propertyId)?.property
        return sum + (property?.totalPrice ?? 0)
      }, 0),
      pendingAmount: scheduledPending + unscheduledPending,
    }
  })

  const filtered = summaries.filter((summary) => {
    const q = search.toLowerCase()
    return (
      summary.client.name.toLowerCase().includes(q) ||
      (summary.client.cnic?.toLowerCase().includes(q) ?? false) ||
      (summary.client.phone?.toLowerCase().includes(q) ?? false) ||
      Array.from(summary.properties).some((property) => property.toLowerCase().includes(q))
    )
  })

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
              setReceivingDue(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-success-600 hover:bg-success-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> Receive Payment
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
        {loading || ledgerLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No payments recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-semibold">Sr #</th>
                  <th className="px-4 py-3 text-left font-semibold">Client</th>
                  <th className="px-4 py-3 text-left font-semibold">CNIC / Phone</th>
                  <th className="px-4 py-3 text-left font-semibold">Properties</th>
                  <th className="px-4 py-3 text-left font-semibold">Total Plot Amount</th>
                  <th className="px-4 py-3 text-left font-semibold">Total Received</th>
                  <th className="px-4 py-3 text-left font-semibold">Pending</th>
                  <th className="px-4 py-3 text-left font-semibold">Last Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((summary, index) => (
                  <tr
                    key={summary.clientId}
                    onClick={() => router.push(`/payments/${summary.clientId}`)}
                    className="cursor-pointer hover:bg-primary-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{summary.client.name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{summary.client.cnic ?? '-'}</div>
                      <div className="text-xs text-slate-400">{summary.client.phone ?? '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {Array.from(summary.properties).join(', ') || '-'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      Rs {formatPKR(summary.totalPlotAmount)}
                    </td>
                    <td className="px-4 py-3 font-bold text-success-600">
                      Rs {formatPKR(summary.totalReceived)}
                    </td>
                    <td className="px-4 py-3 font-bold text-amber-600">
                      Rs {formatPKR(summary.pendingAmount)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(summary.lastPaymentDate)}</td>
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
          due={receivingDue}
          payments={payments}
          ledger={ledger}
          clients={clients}
          properties={properties}
          onClose={() => {
            setShowModal(false)
            setReceivingDue(null)
          }}
          onSaved={() => {
            setShowModal(false)
            setReceivingDue(null)
          }}
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

function addMonthsToDate(date: string, months: number) {
  const [year, month, day] = date.split('-').map(Number)
  const targetMonth = month - 1 + months
  const targetYear = year + Math.floor(targetMonth / 12)
  const normalizedMonth = ((targetMonth % 12) + 12) % 12
  const daysInMonth = new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate()
  const result = new Date(Date.UTC(targetYear, normalizedMonth, Math.min(day, daysInMonth)))
  return result.toISOString().slice(0, 10)
}

function PaymentModal({
  payment,
  due,
  payments,
  ledger,
  clients,
  properties,
  onClose,
  onSaved,
}: {
  payment: Payment | null
  due: PaymentLedgerRow | null
  payments: Payment[]
  ledger: PaymentLedgerRow[]
  clients: Client[]
  properties: Property[]
  onClose: () => void
  onSaved: () => void
}) {
  const [createPayment] = useCreatePaymentMutation()
  const [updatePayment] = useUpdatePaymentMutation()
  const [receiptNo, setReceiptNo] = useState(payment?.receiptNo ?? `R-${Date.now().toString().slice(-6)}`)
  const [clientId, setClientId] = useState(payment?.clientId ?? due?.clientId ?? '')
  const [propertyId, setPropertyId] = useState(payment?.propertyId ?? due?.propertyId ?? '')
  const [paymentMethod, setPaymentMethod] = useState<'full' | 'installment'>('installment')
  const [amount, setAmount] = useState(payment?.amount?.toString() ?? due?.amount.toString() ?? '')
  const [paymentDate, setPaymentDate] = useState(
    payment?.paymentDate ?? new Date().toISOString().slice(0, 10)
  )
  const [notes, setNotes] = useState(payment?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [installmentDuration, setInstallmentDuration] = useState('')
  const [planFrequency, setPlanFrequency] = useState<'monthly' | 'quarterly' | 'half-yearly' | 'yearly'>('monthly')

  const selectedProperty = properties.find((property) => property.id === propertyId)
  const recordedPayments = payments
    .filter((item) => item.propertyId === propertyId && item.id !== payment?.id)
    .reduce((sum, item) => sum + item.amount, 0)
  const remainingBalance = selectedProperty
    ? Math.max(0, selectedProperty.totalPrice - recordedPayments)
    : 0
  const existingPlan = ledger.filter(
    (row) => row.rowType === 'installment' && row.propertyId === propertyId
  )
  const enteredAmount = paymentMethod === 'full' ? remainingBalance : Number(amount || 0)
  const scheduleTarget = Math.max(0, remainingBalance - enteredAmount)
  const lockedToInstallment = due !== null
  const durationMonths = Number(installmentDuration || 0)
  const frequencyMonths = {
    monthly: 1,
    quarterly: 3,
    'half-yearly': 6,
    yearly: 12,
  }[planFrequency]
  const installmentCount = durationMonths > 0
    ? Math.ceil(durationMonths / frequencyMonths)
    : 0
  const installmentAmount = installmentCount > 0 ? scheduleTarget / installmentCount : 0

  const buildSchedule = () => {
    if (installmentCount <= 0) return []
    let allocated = 0
    return Array.from({ length: installmentCount }, (_, index) => {
      const isLast = index === installmentCount - 1
      const itemAmount = isLast
        ? Number((scheduleTarget - allocated).toFixed(2))
        : Number(installmentAmount.toFixed(2))
      allocated += itemAmount
      const dueAfterMonths = Math.min((index + 1) * frequencyMonths, durationMonths)
      return {
        dueDate: addMonthsToDate(paymentDate, dueAfterMonths),
        amount: itemAmount,
      }
    })
  }

  const handleSave = async () => {
    if (!clientId || !propertyId || (paymentMethod === 'installment' && !amount)) {
      setError('Select a client and property, then enter the payment amount.')
      return
    }
    if (!Number.isFinite(enteredAmount) || enteredAmount <= 0) {
      setError('Payment amount must be greater than zero.')
      return
    }
    const isNewPlan = !payment && !due && paymentMethod === 'installment'
      && existingPlan.length === 0 && scheduleTarget > 0
    if (!payment && !due && existingPlan.length > 0) {
      setError('This property already has a plan. Use Receive on a pending installment row.')
      return
    }
    if (isNewPlan && (!Number.isInteger(durationMonths) || durationMonths <= 0)) {
      setError('Enter a valid installment duration in months.')
      return
    }
    setSaving(true)
    setError(null)
    const body: PaymentRequest = {
      receiptNo: receiptNo || null,
      clientId,
      propertyId,
      amount: enteredAmount,
      paymentDate,
      notes: notes || null,
      paymentMethod,
      installmentDueId: due?.id ?? null,
      installmentSchedule: isNewPlan
        ? buildSchedule()
        : undefined,
      planFrequency: isNewPlan ? planFrequency : null,
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

  const filteredProperties = clientId
    ? properties.filter((p) => !p.clientId || p.clientId === clientId)
    : properties

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
              disabled={lockedToInstallment}
              onChange={(e) => {
                setClientId(e.target.value)
                setPropertyId('')
                setInstallmentDuration('')
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-50"
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
              disabled={lockedToInstallment}
              onChange={(e) => {
                setPropertyId(e.target.value)
                setInstallmentDuration('')
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-50"
            >
              <option value="">— Select property... پلاٹ منتخب کریں —</option>
              {filteredProperties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.propertyNumber} ({p.propertyType}) — {p.status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Method <span className="font-urdu text-xs text-slate-400">ادائیگی کا طریقہ</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={lockedToInstallment}
                onClick={() => setPaymentMethod('full')}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  paymentMethod === 'full'
                    ? 'border-success-500 bg-success-50 text-success-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Full Payment
              </button>
              <button
                type="button"
                disabled={lockedToInstallment}
                onClick={() => setPaymentMethod('installment')}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  paymentMethod === 'installment'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Payment Plan / Installment
              </button>
            </div>
          </div>
          {(paymentMethod === 'full' || payment || due) && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {due ? 'Installment Amount' : 'Amount'} (Rs.){' '}
              <span className="font-urdu text-xs text-slate-400">رقم</span>
            </label>
            <input
              type="number"
              value={paymentMethod === 'full' ? remainingBalance : amount}
              onChange={(e) => setAmount(e.target.value)}
              readOnly={paymentMethod === 'full' || lockedToInstallment}
              placeholder="0"
              className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                paymentMethod === 'full' || lockedToInstallment ? 'bg-slate-50 text-slate-600' : ''
              }`}
            />
            {selectedProperty && (
              <p className="mt-1 text-xs text-slate-500">
                Remaining balance: Rs {formatPKR(remainingBalance)}
              </p>
            )}
          </div>
          )}
          {!payment && paymentMethod === 'installment' && selectedProperty && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-800">Payment Plan Details</p>

              {due ? (
                <p className="text-sm text-slate-600">
                  Receiving scheduled installment due {formatDate(due.date)}.
                </p>
              ) : existingPlan.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-amber-700">
                    This property already has a plan. Receive payments from its pending table rows.
                  </p>
                  {existingPlan.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs text-slate-600">
                      <span>{formatDate(item.date)}</span>
                      <span className="font-semibold">Rs {formatPKR(item.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Advance Amount (Rs.)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Installment Duration
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="e.g. 12 months"
                        value={installmentDuration}
                        onChange={(e) => setInstallmentDuration(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Installment Amount (Rs.)
                      </label>
                      <input
                        readOnly
                        value={installmentCount > 0 ? installmentAmount.toFixed(2) : ''}
                        placeholder="Calculated automatically"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Payment Plan
                      </label>
                      <select
                        value={planFrequency}
                        onChange={(e) => setPlanFrequency(e.target.value as typeof planFrequency)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="monthly">Monthly installments</option>
                        <option value="quarterly">Quarterly installments</option>
                        <option value="half-yearly">Half-yearly installments</option>
                        <option value="yearly">Yearly installments</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Future balance: Rs {formatPKR(scheduleTarget)}</span>
                    <span>{installmentCount || 0} installments</span>
                  </div>
                  {scheduleTarget === 0 && (
                    <p className="text-xs text-success-700">
                      The advance covers the full remaining balance.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
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
