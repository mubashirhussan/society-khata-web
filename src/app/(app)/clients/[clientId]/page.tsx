'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Building2, MapPin, Phone, Printer, User } from 'lucide-react'
import { useGetClientPictureQuery, useGetClientsQuery } from '@/features/clientsApi'
import { useGetPropertiesQuery } from '@/features/propertiesApi'
import { useGetPaymentLedgerQuery, useGetPaymentsQuery } from '@/features/paymentsApi'
import { formatDate, formatPKR } from '@/lib/utils'
import { PERMS } from '@/lib/permissions'
import { usePermissions, useRequirePermission } from '@/hooks/usePermissions'
import type { Client } from '@/lib/types'

export default function ClientProfilePage() {
  useRequirePermission(PERMS.propertiesView)
  const router = useRouter()
  const params = useParams<{ clientId: string }>()
  const { can } = usePermissions()
  const { data: clients = [], isLoading: clientsLoading } = useGetClientsQuery()
  const { data: properties = [], isLoading: propertiesLoading } = useGetPropertiesQuery()
  const { data: payments = [], isLoading: paymentsLoading } = useGetPaymentsQuery()
  const { data: ledger = [], isLoading: ledgerLoading } = useGetPaymentLedgerQuery()

  const client = clients.find((item) => item.id === params.clientId)
  const clientProperties = properties.filter((property) => property.clientId === params.clientId)
  const isLoading = clientsLoading || propertiesLoading || paymentsLoading || ledgerLoading

  const clientPayments = payments
    .filter((payment) => payment.clientId === params.clientId)
    .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))

  const pendingRows = ledger
    .filter(
      (row) =>
        row.clientId === params.clientId &&
        row.rowType === 'installment' &&
        (row.status === 'pending' || row.status === 'overdue')
    )
    .sort((a, b) => a.date.localeCompare(b.date))

  const paidByProperty = clientPayments.reduce<Record<string, number>>((acc, payment) => {
    if (!payment.propertyId) return acc
    acc[payment.propertyId] = (acc[payment.propertyId] ?? 0) + payment.amount
    return acc
  }, {})

  const unscheduledBalances = clientProperties
    .map((property) => {
      const paid = paidByProperty[property.id] ?? 0
      const scheduled = pendingRows
        .filter((row) => row.propertyId === property.id)
        .reduce((sum, row) => sum + row.amount, 0)
      const remaining = Math.max(0, property.totalPrice - paid - scheduled)
      return { property, remaining }
    })
    .filter((item) => item.remaining > 0 && !pendingRows.some((row) => row.propertyId === item.property.id))

  const totalReceived = clientPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const totalPending =
    pendingRows.reduce((sum, row) => sum + row.amount, 0) +
    unscheduledBalances.reduce((sum, item) => sum + item.remaining, 0)
  const totalPropertyValue = clientProperties.reduce((sum, property) => sum + property.totalPrice, 0)

  const pendingByPlot = (() => {
    const groups = new Map<string, {
      propertyId: string
      label: string
      propertyType: string | null
      rows: Array<{ key: string; left: string; middle: string; right: string; tone: 'success' | 'amber' | 'error' }>
      total: number
    }>()

    for (const row of pendingRows) {
      const propertyId = row.propertyId ?? 'unknown'
      const label = row.property?.propertyNumber ?? (propertyId === 'unknown' ? 'Unassigned' : propertyId)
      const amount = row.amount
      const item = {
        key: row.id,
        left: row.date ? formatDate(row.date) : 'Not scheduled',
        middle: row.status,
        right: `Rs ${formatPKR(amount)}`,
        tone: (row.status === 'overdue' ? 'error' : 'amber') as 'error' | 'amber',
      }
      const existing = groups.get(propertyId)
      if (existing) {
        existing.rows.push(item)
        existing.total += amount
      } else {
        groups.set(propertyId, {
          propertyId,
          label,
          propertyType: row.property?.propertyType ?? null,
          rows: [item],
          total: amount,
        })
      }
    }

    for (const item of unscheduledBalances) {
      const amount = item.remaining
      const row = {
        key: `balance-${item.property.id}`,
        left: 'Not scheduled',
        middle: 'pending',
        right: `Rs ${formatPKR(amount)}`,
        tone: 'amber' as const,
      }
      const existing = groups.get(item.property.id)
      if (existing) {
        existing.rows.push(row)
        existing.total += amount
      } else {
        groups.set(item.property.id, {
          propertyId: item.property.id,
          label: item.property.propertyNumber,
          propertyType: item.property.propertyType,
          rows: [row],
          total: amount,
        })
      }
    }

    return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label))
  })()

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-400">
        Loading...
      </div>
    )
  }

  if (!client) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.push('/clients')}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" /> Back to clients
        </button>
        <div className="rounded-xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-400">
          Client not found.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/clients')}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
            title="Back to clients"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Client Profile <span className="font-urdu text-lg text-slate-500">گاہک پروفائل</span>
            </h2>
            <p className="mt-1 text-sm text-slate-500">Complete record for {client.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-white px-4 py-2.5 text-sm font-medium text-primary-700 hover:bg-primary-50"
          >
            <Printer className="h-4 w-4" /> Print Complete Record
          </button>
          {can(PERMS.paymentsView) && (
            <Link
              href={`/payments/${client.id}`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
            >
              Open Payments
            </Link>
          )}
        </div>
      </div>

      <div className="print-area space-y-6 rounded-xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <ClientAvatar client={client} size="large" />
          <div>
            <h3 className="text-xl font-bold text-slate-800">{client.name}</h3>
            <p className="text-sm text-slate-400">{client.cnic ?? 'No CNIC'}</p>
            <p className="mt-1 text-xs text-slate-400">Complete client record</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          {client.phone && <InfoItem icon={Phone} label="Phone" value={client.phone} />}
          {client.fatherHusband && <InfoItem icon={User} label="Father/Husband" value={client.fatherHusband} />}
          {client.address && <InfoItem icon={MapPin} label="Address" value={client.address} />}
          {client.notes && <InfoItem icon={User} label="Notes" value={client.notes} />}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryBox label="Property Value" value={`Rs ${formatPKR(totalPropertyValue)}`} />
          <SummaryBox label="Total Received" value={`Rs ${formatPKR(totalReceived)}`} tone="success" />
          <SummaryBox label="Pending" value={`Rs ${formatPKR(totalPending)}`} tone="amber" />
        </div>

        <section>
          <h4 className="mb-2 text-sm font-semibold text-slate-700">
            Assigned Properties <span className="font-urdu text-slate-400">مختص جائیداد</span>
          </h4>
          {clientProperties.length === 0 ? (
            <p className="text-sm text-slate-400">No properties assigned.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-100">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Property</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2 text-right">Total</th>
                    <th className="px-3 py-2 text-right">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {clientProperties.map((property) => (
                    <tr key={property.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-medium text-slate-700">
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          {property.propertyNumber}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-500">{property.propertyType}</td>
                      <td className="px-3 py-2 text-right font-medium">Rs {formatPKR(property.totalPrice)}</td>
                      <td className="px-3 py-2 text-right text-success-600">
                        Rs {formatPKR(paidByProperty[property.id] ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h4 className="mb-2 text-sm font-semibold text-slate-700">
            Received Payments <span className="font-urdu text-slate-400">وصول شدہ</span>
          </h4>
          <PaymentRows
            emptyText="No payments received."
            rows={clientPayments.map((payment) => ({
              key: payment.id,
              left: payment.receiptNo ?? '-',
              middle: `${formatDate(payment.paymentDate)} · ${payment.property?.propertyNumber ?? '-'}`,
              right: `Rs ${formatPKR(payment.amount)}`,
              tone: 'success',
            }))}
          />
        </section>

        <section>
          <h4 className="mb-2 text-sm font-semibold text-slate-700">
            Pending Payments <span className="font-urdu text-slate-400">بقایا</span>
          </h4>
          {pendingByPlot.length === 0 ? (
            <p className="text-sm text-slate-400">No pending payments.</p>
          ) : (
            <div className="space-y-4">
              {pendingByPlot.map((plot) => (
                <div key={plot.propertyId} className="rounded-lg border border-slate-100 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-700">
                      {plot.label}
                      {plot.propertyType ? (
                        <span className="ml-1 text-xs font-normal text-slate-400">({plot.propertyType})</span>
                      ) : null}
                    </p>
                    <p className="text-sm font-bold text-amber-600">Rs {formatPKR(plot.total)}</p>
                  </div>
                  <PaymentRows emptyText="No pending payments." rows={plot.rows} />
                </div>
              ))}
            </div>
          )}
        </section>

        {clientProperties.length > 0 && (
          <p className="text-xs text-slate-400">
            Linked records: {clientProperties.length} properties, {clientPayments.length} payments,{' '}
            {pendingRows.length + unscheduledBalances.length} pending items.
          </p>
        )}
      </div>
    </div>
  )
}

function PaymentRows({
  emptyText,
  rows,
}: {
  emptyText: string
  rows: Array<{ key: string; left: string; middle: string; right: string; tone: 'success' | 'amber' | 'error' }>
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-400">{emptyText}</p>
  }

  const toneClass = {
    success: 'text-success-600',
    amber: 'text-amber-600',
    error: 'text-error-600',
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div
          key={row.key}
          className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm"
        >
          <div className="min-w-0">
            <p className="font-medium text-slate-700">{row.left}</p>
            <p className="truncate text-xs text-slate-400">{row.middle}</p>
          </div>
          <p className={`font-bold ${toneClass[row.tone]}`}>{row.right}</p>
        </div>
      ))}
    </div>
  )
}

function SummaryBox({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'success' | 'amber'
}) {
  const toneClass = {
    default: 'text-slate-800',
    success: 'text-success-600',
    amber: 'text-amber-600',
  }
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-sm font-bold ${toneClass[tone]}`}>{value}</p>
    </div>
  )
}

function ClientAvatar({ client, size }: { client: Client; size: 'small' | 'large' }) {
  const { data: picture } = useGetClientPictureQuery(client.id, { skip: !client.hasPicture })
  const [pictureUrl, setPictureUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!picture) {
      setPictureUrl(null)
      return
    }
    const url = URL.createObjectURL(picture)
    setPictureUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [picture])

  const dimensions = size === 'large' ? 'w-14 h-14 rounded-xl' : 'w-8 h-8 rounded-lg'
  const iconSize = size === 'large' ? 'w-7 h-7' : 'w-4 h-4'

  return (
    <span className={`${dimensions} flex flex-shrink-0 items-center justify-center overflow-hidden bg-primary-100`}>
      {pictureUrl ? (
        <Image
          src={pictureUrl}
          alt={client.name}
          width={size === 'large' ? 56 : 32}
          height={size === 'large' ? 56 : 32}
          unoptimized
          className="h-full w-full object-cover"
        />
      ) : (
        <User className={`${iconSize} text-primary-600`} />
      )}
    </span>
  )
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 text-slate-400" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm text-slate-700">{value}</p>
      </div>
    </div>
  )
}
