'use client'

import { Printer, TrendingUp, TrendingDown, Wallet, Building2 } from 'lucide-react'
import { useGetPropertiesQuery } from '@/features/propertiesApi'
import { useGetPaymentsQuery } from '@/features/paymentsApi'
import { useGetExpensesQuery } from '@/features/expensesApi'
import { useGetClientsQuery } from '@/features/clientsApi'
import { formatPKR, formatDate } from '@/lib/utils'
import { PERMS } from '@/lib/permissions'
import { useRequirePermission } from '@/hooks/usePermissions'
import PrintHeader from '@/components/PrintHeader'

export default function ReportsPage() {
  useRequirePermission(PERMS.reportsView)
  const { data: properties = [], isLoading: loadingProps } = useGetPropertiesQuery()
  const { data: payments = [], isLoading: loadingPay } = useGetPaymentsQuery()
  const { data: expenses = [], isLoading: loadingExp } = useGetExpensesQuery()
  const { data: clients = [], isLoading: loadingClients } = useGetClientsQuery()

  const loading = loadingProps || loadingPay || loadingExp || loadingClients

  const totalPropertyValue = properties.reduce((s, p) => s + (p.totalPrice || 0), 0)
  const totalReceived = payments.reduce((s, p) => s + (p.amount || 0), 0)
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  const totalOutstanding = totalPropertyValue - totalReceived
  const netBalance = totalReceived - totalExpenses

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Reports <span className="font-urdu text-lg text-slate-500">رپورٹ</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">Complete financial overview and reports</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all no-print"
        >
          <Printer className="w-4 h-4" /> Print Report
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
      ) : (
        <div className="print-area space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <PrintHeader subtitle="Society Khata — سوسائٹی کھاتہ" />
            <p className="text-xs text-slate-400 mt-2 text-center">
              Report generated: {formatDate(new Date().toISOString())}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              icon={Building2}
              label="Total Property Value"
              urdu="کل جائیداد قیمت"
              value={`Rs ${formatPKR(totalPropertyValue)}`}
              color="primary"
            />
            <SummaryCard
              icon={TrendingUp}
              label="Total Received"
              urdu="کل وصولی"
              value={`Rs ${formatPKR(totalReceived)}`}
              color="success"
            />
            <SummaryCard
              icon={TrendingDown}
              label="Total Expenses"
              urdu="کل اخراجات"
              value={`Rs ${formatPKR(totalExpenses)}`}
              color="error"
            />
            <SummaryCard
              icon={Wallet}
              label="Net Balance"
              urdu="کل باقی"
              value={`Rs ${formatPKR(netBalance)}`}
              color={netBalance >= 0 ? 'success' : 'error'}
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              Sales Summary <span className="font-urdu text-slate-400">فروخت خلاصہ</span>
            </h3>
            <div className="space-y-3">
              <SummaryRow label="Total Properties" urdu="کل جائیداد" value={`${properties.length}`} />
              <SummaryRow label="Total Clients" urdu="کل گاہک" value={`${clients.length}`} />
              <SummaryRow
                label="Total Property Value"
                urdu="کل جائیداد قیمت"
                value={`Rs ${formatPKR(totalPropertyValue)}`}
              />
              <SummaryRow
                label="Total Received"
                urdu="کل وصولی"
                value={`Rs ${formatPKR(totalReceived)}`}
                color="text-success-600"
              />
              <SummaryRow
                label="Total Outstanding"
                urdu="کل باقی"
                value={`Rs ${formatPKR(totalOutstanding)}`}
                color="text-warning-600"
              />
              <SummaryRow
                label="Total Expenses"
                urdu="کل اخراجات"
                value={`Rs ${formatPKR(totalExpenses)}`}
                color="text-error-600"
              />
              <SummaryRow
                label="Net Balance"
                urdu="خالص بقایا"
                value={`Rs ${formatPKR(netBalance)}`}
                color={netBalance >= 0 ? 'text-success-600' : 'text-error-600'}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">
                Properties Report <span className="font-urdu text-slate-400">جائیداد کی تفصیل</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left font-semibold">Plot / Shop</th>
                    <th className="px-4 py-3 text-left font-semibold">Type</th>
                    <th className="px-4 py-3 text-left font-semibold">Client</th>
                    <th className="px-4 py-3 text-left font-semibold">Total Price</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {properties.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{p.propertyNumber}</td>
                      <td className="px-4 py-3 text-slate-600">{p.propertyType}</td>
                      <td className="px-4 py-3 text-slate-600">{p.client?.name ?? '-'}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">Rs {formatPKR(p.totalPrice)}</td>
                      <td className="px-4 py-3 text-slate-600">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">
                Payments Report <span className="font-urdu text-slate-400">ادائیگی کی تفصیل</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left font-semibold">Receipt No</th>
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Client</th>
                    <th className="px-4 py-3 text-left font-semibold">Property</th>
                    <th className="px-4 py-3 text-left font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                        No payments recorded.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{p.receiptNo ?? '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(p.paymentDate)}</td>
                        <td className="px-4 py-3 text-slate-600">{p.client?.name ?? '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{p.property?.propertyNumber ?? '-'}</td>
                        <td className="px-4 py-3 font-bold text-success-600">Rs {formatPKR(p.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">
                Expenses Report <span className="font-urdu text-slate-400">اخراجات کی تفصیل</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                    <th className="px-4 py-3 text-left font-semibold">Paid To</th>
                    <th className="px-4 py-3 text-left font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                        No expenses recorded.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-600">{formatDate(e.expenseDate)}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{e.description}</td>
                        <td className="px-4 py-3 text-slate-600">{e.paidTo ?? '-'}</td>
                        <td className="px-4 py-3 font-bold text-error-600">Rs {formatPKR(e.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  urdu,
  value,
  color,
}: {
  icon: typeof Building2
  label: string
  urdu: string
  value: string
  color: string
}) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    error: 'bg-error-50 text-error-600',
    warning: 'bg-warning-50 text-warning-600',
  }
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-lg font-bold text-slate-800 mt-0.5">{value}</p>
      <p className="font-urdu text-xs text-slate-400 mt-0.5">{urdu}</p>
    </div>
  )
}

function SummaryRow({
  label,
  urdu,
  value,
  color,
}: {
  label: string
  urdu: string
  value: string
  color?: string
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50">
      <span className="text-sm text-slate-600">
        {label} <span className="font-urdu text-xs text-slate-400">{urdu}</span>
      </span>
      <span className={`text-sm font-bold ${color ?? 'text-slate-800'}`}>{value}</span>
    </div>
  )
}
