'use client'

import { useState } from 'react'
import { ArrowLeft, CalendarClock, CalendarRange, Edit2, Printer, Trash2, Wallet, X } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useGetClientsQuery } from '@/features/clientsApi'
import {
  useCreatePaymentMutation,
  useDeletePaymentMutation,
  useGetPaymentLedgerQuery,
  useGetPaymentsQuery,
  useUpdatePaymentMutation,
} from '@/features/paymentsApi'
import { usePermissions, useRequirePermission } from '@/hooks/usePermissions'
import { useConfirm } from '@/hooks/useConfirm'
import { PERMS } from '@/lib/permissions'
import { formatDate, formatPKR, getApiError, numberToWords } from '@/lib/utils'
import type { Payment, PaymentLedgerRow, PaymentRequest, Property } from '@/lib/types'

export default function ClientPaymentDetailsPage() {
  useRequirePermission(PERMS.paymentsView)
  const router = useRouter()
  const params = useParams<{ clientId: string }>()
  const { can } = usePermissions()
  const { data: clients = [], isLoading: clientsLoading } = useGetClientsQuery()
  const { data: payments = [], isLoading: paymentsLoading } = useGetPaymentsQuery()
  const { data: ledger = [], isLoading: ledgerLoading } = useGetPaymentLedgerQuery()
  const [deletePayment] = useDeletePaymentMutation()
  const { confirm, ConfirmDialog } = useConfirm()
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [printPayment, setPrintPayment] = useState<Payment | null>(null)
  const [showReceiveModal, setShowReceiveModal] = useState(false)

  const clientPropertyIds = new Set(
    payments
      .filter((payment) => payment.clientId === params.clientId && payment.propertyId)
      .map((payment) => payment.propertyId as string)
  )
  const clientPayments = payments
    .filter((payment) =>
      payment.clientId === params.clientId
      || (!payment.clientId && payment.propertyId && clientPropertyIds.has(payment.propertyId))
    )
    .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))
  const scheduledInstallments = ledger
    .filter((row) => row.rowType === 'installment' && row.clientId === params.clientId)
    .sort((a, b) => a.date.localeCompare(b.date))
  const scheduledPropertyIds = new Set(
    scheduledInstallments.map((installment) => installment.propertyId).filter(Boolean)
  )
  const unscheduledBalances = Array.from(clientPropertyIds)
    .filter((propertyId) => !scheduledPropertyIds.has(propertyId))
    .map((propertyId) => {
      const property = payments.find((payment) => payment.propertyId === propertyId)?.property
      const paid = payments
        .filter((payment) => payment.propertyId === propertyId)
        .reduce((sum, payment) => sum + payment.amount, 0)
      return {
        id: `balance-${propertyId}`,
        date: null as string | null,
        propertyId,
        property,
        amount: Math.max(0, (property?.totalPrice ?? paid) - paid),
        status: 'pending' as const,
      }
    })
    .filter((balance) => balance.amount > 0)
  const pendingInstallments = [...scheduledInstallments, ...unscheduledBalances]
  const pendingByPlot = Array.from(
    pendingInstallments.reduce((groups, installment) => {
      const propertyId = installment.property?.id ?? installment.propertyId ?? 'unknown'
      const label = installment.property?.propertyNumber
        ?? (propertyId === 'unknown' ? 'Unassigned' : propertyId)
      const existing = groups.get(propertyId)
      if (existing) {
        existing.items.push(installment)
        existing.total += installment.amount
      } else {
        groups.set(propertyId, {
          propertyId,
          label,
          propertyType: installment.property?.propertyType ?? null,
          items: [installment],
          total: installment.amount,
        })
      }
      return groups
    }, new Map<string, {
      propertyId: string
      label: string
      propertyType: string | null
      items: typeof pendingInstallments
      total: number
    }>())
  ).map(([, group]) => group)
    .sort((a, b) => a.label.localeCompare(b.label))
  const client = clients.find((item) => item.id === params.clientId)
    ?? clientPayments[0]?.client
    ?? scheduledInstallments[0]?.client
  const totalReceived = clientPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const totalPending = pendingInstallments.reduce((sum, installment) => sum + installment.amount, 0)
  const storedPlans = Array.from(new Set(
    scheduledInstallments
      .map((item) => item.planFrequency)
      .filter((frequency): frequency is NonNullable<PaymentLedgerRow['planFrequency']> => Boolean(frequency))
  ))
  const inferredPlan = storedPlans.length === 0
    ? inferPlanFrequency(scheduledInstallments.map((item) => item.date))
    : null
  const planLabel = storedPlans.length > 0
    ? storedPlans.map(formatPlanFrequency).join(', ')
    : inferredPlan ?? 'Not scheduled'
  const isLoading = paymentsLoading || ledgerLoading || clientsLoading

  return (
    <div className="print-area space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/payments')}
            className="no-print rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
            title="Back to clients"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {client?.name ?? 'Client Payments'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {client?.cnic ?? 'No CNIC'} {client?.phone ? `• ${client.phone}` : ''}
            </p>
          </div>
        </div>
        <div className="no-print flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-white px-4 py-2.5 text-sm font-medium text-primary-700 hover:bg-primary-50"
          >
            <Printer className="h-4 w-4" /> Print Statement
          </button>
        {can(PERMS.paymentsCreate) && (
          <button
            onClick={() => setShowReceiveModal(true)}
            className="rounded-lg bg-success-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-success-700"
          >
            Receive Payment
          </button>
        )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          label="Total Received"
          amount={totalReceived}
          color="success"
          icon={<Wallet className="h-6 w-6" />}
        />
        <SummaryCard
          label="Pending Amount"
          amount={totalPending}
          color="amber"
          icon={<CalendarClock className="h-6 w-6" />}
        />
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div>
            <p className="text-sm text-slate-500">Installment Plan</p>
            <p className="text-xl font-bold text-primary-600">{planLabel}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <CalendarRange className="h-6 w-6" />
          </div>
        </div>
      </div>

      <PaymentTable
        title="Received Payments"
        emptyText="No received payments found."
        loading={isLoading}
        headers={['Receipt No', 'Date', 'Property', 'Amount', 'Notes', 'Actions']}
        rows={clientPayments.map((payment) => [
          payment.receiptNo ?? '-',
          formatDate(payment.paymentDate),
          payment.property?.propertyNumber ?? '-',
          <span key="amount" className="font-bold text-success-600">
            Rs {formatPKR(payment.amount)}
          </span>,
          payment.notes ?? '-',
          <div key="actions" className="flex items-center justify-end gap-1">
            <button
              onClick={() => setPrintPayment(payment)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600"
              title="Print receipt"
            >
              <Printer className="h-4 w-4" />
            </button>
            {can(PERMS.paymentsEdit) && (
              <button
                onClick={() => setEditingPayment(payment)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600"
                title="Edit receipt"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
            {can(PERMS.paymentsDelete) && (
              <button
                onClick={async () => {
                  if (await confirm(`Delete receipt ${payment.receiptNo ?? ''}?`)) {
                    const result = await deletePayment(payment.id)
                    if ('error' in result) alert(getApiError(result.error))
                  }
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-error-50 hover:text-error-600"
                title="Delete receipt"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>,
        ])}
      />

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800">
          Pending Installments <span className="font-urdu text-sm font-normal text-slate-400">بقایا اقساط</span>
        </h3>
        {isLoading ? (
          <div className="rounded-xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-400 shadow-sm">
            Loading...
          </div>
        ) : pendingByPlot.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-400 shadow-sm">
            No pending installments.
          </div>
        ) : (
          pendingByPlot.map((plot) => (
            <PaymentTable
              key={plot.propertyId}
              title={`${plot.label}${plot.propertyType ? ` (${plot.propertyType})` : ''} — Pending Rs ${formatPKR(plot.total)}`}
              emptyText="No pending installments."
              loading={false}
              headers={['Due Date', 'Amount', 'Status']}
              rows={plot.items.map((installment) => [
                installment.date ? formatDate(installment.date) : 'Not scheduled',
                <span key="amount" className="font-bold text-amber-600">
                  Rs {formatPKR(installment.amount)}
                </span>,
                <span
                  key="status"
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                    installment.status === 'overdue'
                      ? 'bg-error-50 text-error-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {installment.status}
                </span>,
              ])}
            />
          ))
        )}
      </div>

      {editingPayment && (
        <EditReceiptModal
          payment={editingPayment}
          clientId={params.clientId}
          onClose={() => setEditingPayment(null)}
        />
      )}
      {printPayment && (
        <ReceiptModal payment={printPayment} onClose={() => setPrintPayment(null)} />
      )}
      {showReceiveModal && client && (
        <ReceivePaymentModal
          clientId={params.clientId}
          properties={Array.from(
            new Map(
              clientPayments
                .filter((payment) => payment.property)
                .map((payment) => [payment.property!.id, payment.property!])
            ).values()
          )}
          scheduledInstallments={scheduledInstallments}
          onClose={() => setShowReceiveModal(false)}
        />
      )}
      {ConfirmDialog}
    </div>
  )
}

function formatPlanFrequency(frequency: NonNullable<PaymentLedgerRow['planFrequency']>) {
  return {
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    'half-yearly': 'Half-yearly',
    yearly: 'Yearly',
  }[frequency]
}

function inferPlanFrequency(dates: string[]) {
  if (dates.length < 2) return null
  const sorted = [...dates].sort()
  const first = new Date(`${sorted[0]}T00:00:00`)
  const second = new Date(`${sorted[1]}T00:00:00`)
  const months = (second.getFullYear() - first.getFullYear()) * 12
    + second.getMonth() - first.getMonth()
  if (months === 1) return 'Monthly'
  if (months === 3) return 'Quarterly'
  if (months === 6) return 'Half-yearly'
  if (months === 12) return 'Yearly'
  return null
}

function ReceivePaymentModal({
  clientId,
  properties,
  scheduledInstallments,
  onClose,
}: {
  clientId: string
  properties: Property[]
  scheduledInstallments: PaymentLedgerRow[]
  onClose: () => void
}) {
  const [createPayment] = useCreatePaymentMutation()
  const initialPropertyId = properties[0]?.id ?? ''
  const initialDue = scheduledInstallments.find((item) => item.propertyId === initialPropertyId)
  const [propertyId, setPropertyId] = useState(initialPropertyId)
  const [installmentDueId, setInstallmentDueId] = useState(initialDue?.id ?? '')
  const [receiptNo, setReceiptNo] = useState(`R-${Date.now().toString().slice(-6)}`)
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10))
  const [amount, setAmount] = useState(initialDue?.amount.toString() ?? '')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const propertyDues = scheduledInstallments.filter((item) => item.propertyId === propertyId)
  const selectedDue = propertyDues.find((item) => item.id === installmentDueId)

  const dueRemaining = selectedDue?.amount ?? 0

  const save = async () => {
    const parsedAmount = Number(amount)
    if (!propertyId || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Select a property and enter a valid payment amount.')
      return
    }
    if (propertyDues.length > 0 && !selectedDue) {
      setError('Select the installment being received.')
      return
    }
    if (selectedDue && parsedAmount > dueRemaining) {
      setError(`Amount cannot exceed the remaining installment of Rs ${formatPKR(dueRemaining)}.`)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await createPayment({
        receiptNo: receiptNo || null,
        clientId,
        propertyId,
        amount: parsedAmount,
        paymentDate,
        notes: notes || null,
        paymentMethod: 'installment',
        installmentDueId: selectedDue?.id ?? null,
      }).unwrap()
      onClose()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h3 className="font-bold text-slate-800">Receive Payment — ادائیگی وصول کریں</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Receipt No" value={receiptNo} onChange={setReceiptNo} />
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(event) => setPaymentDate(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Property</label>
            <select
              value={propertyId}
              onChange={(event) => {
                const nextPropertyId = event.target.value
                const nextDue = scheduledInstallments.find((item) => item.propertyId === nextPropertyId)
                setPropertyId(nextPropertyId)
                setInstallmentDueId(nextDue?.id ?? '')
                setAmount(nextDue?.amount.toString() ?? '')
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.propertyNumber} ({property.propertyType})
                </option>
              ))}
            </select>
          </div>
          {propertyDues.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Pending Installment</label>
              <select
                value={installmentDueId}
                onChange={(event) => {
                  const due = propertyDues.find((item) => item.id === event.target.value)
                  setInstallmentDueId(event.target.value)
                  setAmount(due?.amount.toString() ?? '')
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {propertyDues.map((due) => (
                  <option key={due.id} value={due.id}>
                    {formatDate(due.date)} — Rs {formatPKR(due.amount)}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Amount (Rs.)</label>
            <input
              type="number"
              min="1"
              max={selectedDue ? dueRemaining : undefined}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {selectedDue && (
              <p className="mt-1 text-xs text-slate-500">
                Due Rs {formatPKR(dueRemaining)}
                {Number(amount) > 0 && Number(amount) < dueRemaining
                  ? ` · Remaining after this payment: Rs ${formatPKR(dueRemaining - Number(amount))}`
                  : ' · Full or partial amount allowed'}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          {properties.length === 0 && (
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              No property is linked to this client.
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700">
              {error}
            </div>
          )}
        </div>
        <div className="flex gap-3 p-5 pt-0">
          <button onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || properties.length === 0}
            className="flex-1 rounded-lg bg-success-600 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Payment'}
          </button>
        </div>
      </div>
    </div>
  )
}

function EditReceiptModal({
  payment,
  clientId,
  onClose,
}: {
  payment: Payment
  clientId: string
  onClose: () => void
}) {
  const [updatePayment] = useUpdatePaymentMutation()
  const [receiptNo, setReceiptNo] = useState(payment.receiptNo ?? '')
  const [paymentDate, setPaymentDate] = useState(payment.paymentDate)
  const [amount, setAmount] = useState(payment.amount.toString())
  const [notes, setNotes] = useState(payment.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async () => {
    const parsedAmount = Number(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Payment amount must be greater than zero.')
      return
    }
    const body: PaymentRequest = {
      receiptNo: receiptNo || null,
      clientId: payment.clientId ?? clientId,
      propertyId: payment.propertyId,
      amount: parsedAmount,
      paymentDate,
      notes: notes || null,
      paymentMethod: 'installment',
    }
    setSaving(true)
    setError(null)
    try {
      await updatePayment({ id: payment.id, body }).unwrap()
      onClose()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h3 className="font-bold text-slate-800">Edit Payment Receipt</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <InputField label="Receipt No" value={receiptNo} onChange={setReceiptNo} />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Payment Date</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(event) => setPaymentDate(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Amount (Rs.)</label>
            <input
              type="number"
              min="1"
              value={amount}
              readOnly={payment.amountLocked}
              onChange={(event) => setAmount(event.target.value)}
              className={`w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                payment.amountLocked ? 'bg-slate-50 text-slate-600' : ''
              }`}
            />
            {payment.amountLocked && (
              <p className="mt-1 text-xs text-slate-500">
                This receipt is part of an installment plan, so the amount is fixed. Only the receipt number,
                date, and notes can be changed.
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          {error && (
            <div className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700">
              {error}
            </div>
          )}
        </div>
        <div className="flex gap-3 p-5 pt-0">
          <button onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-lg bg-success-600 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>
  )
}

function ReceiptModal({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="no-print flex items-center justify-between border-b border-slate-100 p-5">
          <h3 className="font-bold text-slate-800">Payment Receipt — رسید</h3>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="rounded-lg p-1.5 text-primary-600 hover:bg-primary-50">
              <Printer className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100">
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>
        <div className="print-area p-6">
          <div className="mb-6 border-b-2 border-primary-600 pb-4 text-center">
            <h1 className="text-xl font-bold text-slate-900">Society Khata</h1>
            <p className="text-sm text-slate-500">Payment Receipt — رسید</p>
          </div>
          <div className="space-y-2 text-sm">
            <ReceiptRow label="Receipt No" value={payment.receiptNo ?? '-'} />
            <ReceiptRow label="Date" value={formatDate(payment.paymentDate)} />
            <ReceiptRow label="Client Name" value={payment.client?.name ?? '-'} />
            <ReceiptRow
              label="Property"
              value={`${payment.property?.propertyNumber ?? '-'} (${payment.property?.propertyType ?? '-'})`}
            />
            <ReceiptRow label="Amount" value={`Rs ${formatPKR(payment.amount)}`} strong />
            <div className="py-2">
              <span className="font-bold text-slate-700">Amount in words:</span>
              <p className="mt-1 italic text-slate-600">{numberToWords(payment.amount)}</p>
            </div>
            {payment.notes && <ReceiptRow label="Notes" value={payment.notes} />}
          </div>
          <div className="mt-10 flex justify-between gap-8 text-center text-xs text-slate-500">
            <div className="flex-1 border-t border-slate-300 pt-1">Received By</div>
            <div className="flex-1 border-t border-slate-300 pt-1">Client Signature</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReceiptRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-2">
      <span className={strong ? 'font-bold text-slate-700' : 'text-slate-500'}>{label}:</span>
      <span className={strong ? 'font-bold text-success-600' : 'font-medium text-slate-800'}>{value}</span>
    </div>
  )
}

function SummaryCard({
  label,
  amount,
  color,
  icon,
}: {
  label: string
  amount: number
  color: 'success' | 'amber'
  icon: React.ReactNode
}) {
  const styles = color === 'success'
    ? 'bg-success-50 text-success-600'
    : 'bg-amber-50 text-amber-600'

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className={`text-2xl font-bold ${color === 'success' ? 'text-success-600' : 'text-amber-600'}`}>
          Rs {formatPKR(amount)}
        </p>
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${styles}`}>{icon}</div>
    </div>
  )
}

function PaymentTable({
  title,
  emptyText,
  loading,
  headers,
  rows,
}: {
  title: string
  emptyText: string
  loading: boolean
  headers: string[]
  rows: React.ReactNode[][]
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="font-bold text-slate-800">{title}</h3>
      </div>
      {loading ? (
        <div className="p-8 text-center text-sm text-slate-400">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-400">{emptyText}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600">
                {headers.map((header) => (
                  <th key={header} className="px-4 py-3 text-left font-semibold">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-50">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3 text-slate-600">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
