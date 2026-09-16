'use client'

import { useState } from 'react'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import {
  useGetPropertiesQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
} from '@/features/propertiesApi'
import { formatPKR, formatDate, getApiError } from '@/lib/utils'
import { PERMS } from '@/lib/permissions'
import { usePermissions, useRequirePermission } from '@/hooks/usePermissions'
import { useConfirm } from '@/hooks/useConfirm'
import type { Property } from '@/lib/types'
import Modal, { ModalActions, Field, inputCls } from '@/components/Modal'

export default function PropertiesPage() {
  useRequirePermission(PERMS.propertiesView)
  const { can } = usePermissions()
  const canCreate = can(PERMS.propertiesCreate)
  const canEdit = can(PERMS.propertiesEdit)
  const canDelete = can(PERMS.propertiesDelete)
  const canManage = canCreate || canEdit || canDelete
  const { data: properties = [], isLoading: loadingProps } = useGetPropertiesQuery()
  const [deleteProperty] = useDeletePropertyMutation()
  const { confirm, ConfirmDialog } = useConfirm()

  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)

  const loading = loadingProps

  const filtered = properties.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.propertyNumber.toLowerCase().includes(q) ||
      p.propertyType.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q) ||
      (p.client?.name?.toLowerCase().includes(q) ?? false)
    )
  })

  const statusColors: Record<string, string> = {
    available: 'bg-success-100 text-success-700',
    booked: 'bg-warning-100 text-warning-700',
    sold: 'bg-primary-100 text-primary-700',
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Properties <span className="font-urdu text-lg text-slate-500">جائیداد</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {canManage ? 'Manage plots and shops' : 'View plots and shops'}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => {
              setEditingProperty(null)
              setShowAddModal(true)
            }}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> Add Property
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
          <div className="p-8 text-center text-slate-400 text-sm">
            No properties found.
            {canCreate && ' Click "Add Property" to get started.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-semibold">Plot / Shop</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Marla</th>
                  <th className="px-4 py-3 text-left font-semibold">Total Price</th>
                  <th className="px-4 py-3 text-left font-semibold">Client</th>
                  <th className="px-4 py-3 text-left font-semibold">Booking Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  {(canEdit || canDelete) && <th className="px-4 py-3 text-right font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{p.propertyNumber}</td>
                    <td className="px-4 py-3">
                      <span className="text-slate-600">
                        {p.propertyType === 'plot' ? 'Plot — پلاٹ' : 'Shop — دکان'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.marla ?? '-'}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">Rs {formatPKR(p.totalPrice)}</td>
                    <td className="px-4 py-3">
                      {p.client ? (
                        <span className="font-medium text-primary-600">{p.client.name}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(p.bookingDate)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[p.status] ?? 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    {(canEdit || canDelete) && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <button
                              onClick={() => {
                                setEditingProperty(p)
                                setShowAddModal(true)
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
                                if (await confirm(`Delete property ${p.propertyNumber}?`)) {
                                  await deleteProperty(p.id)
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
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (canCreate || (editingProperty && canEdit)) && (
        <PropertyModal
          property={editingProperty}
          onClose={() => setShowAddModal(false)}
          onSaved={() => setShowAddModal(false)}
        />
      )}
      {ConfirmDialog}
    </div>
  )
}

function PropertyModal({
  property,
  onClose,
  onSaved,
}: {
  property: Property | null
  onClose: () => void
  onSaved: () => void
}) {
  const [createProperty] = useCreatePropertyMutation()
  const [updateProperty] = useUpdatePropertyMutation()
  const [propertyNumber, setPropertyNumber] = useState(property?.propertyNumber ?? '')
  const [propertyType, setPropertyType] = useState(property?.propertyType ?? 'plot')
  const [marla, setMarla] = useState(property?.marla?.toString() ?? '')
  const [lengthFeet, setLengthFeet] = useState(property?.lengthFeet?.toString() ?? '')
  const [widthFeet, setWidthFeet] = useState(property?.widthFeet?.toString() ?? '')
  const [totalPrice, setTotalPrice] = useState(property?.totalPrice?.toString() ?? '')
  const [bookingDate, setBookingDate] = useState(property?.bookingDate ?? '')
  const [notes, setNotes] = useState(property?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!propertyNumber.trim()) return
    setSaving(true)
    setError(null)
    const body = {
      propertyNumber: propertyNumber.trim(),
      propertyType,
      marla: marla ? parseFloat(marla) : null,
      lengthFeet: lengthFeet ? parseFloat(lengthFeet) : null,
      widthFeet: widthFeet ? parseFloat(widthFeet) : null,
      totalPrice: totalPrice ? parseFloat(totalPrice) : 0,
      bookingDate: bookingDate || null,
      status: property?.status ?? 'available',
      clientId: property?.clientId ?? null,
      notes: notes || null,
    }
    try {
      if (property) {
        await updateProperty({ id: property.id, body }).unwrap()
      } else {
        await createProperty(body).unwrap()
      }
      onSaved()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={property ? 'Edit Property' : 'Add Property'} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Plot / Shop Number" urdu="پلاٹ نمبر">
            <input
              value={propertyNumber}
              onChange={(e) => setPropertyNumber(e.target.value)}
              placeholder="P-101"
              className={inputCls}
            />
          </Field>
          <Field label="Type" urdu="قسم">
            <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={inputCls}>
              <option value="plot">Plot — پلاٹ</option>
              <option value="shop">Shop — دکان</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Marla" urdu="مرلہ">
            <input
              type="number"
              value={marla}
              onChange={(e) => setMarla(e.target.value)}
              placeholder="Enter marla"
              className={inputCls}
            />
          </Field>
          <Field label="Total Price (Rs)" urdu="کل قیمت">
            <input
              type="number"
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              placeholder="0"
              className={inputCls}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Length (ft)" urdu="لمبائی (فٹ)">
            <input
              type="number"
              value={lengthFeet}
              onChange={(e) => setLengthFeet(e.target.value)}
              placeholder="Enter length"
              className={inputCls}
            />
          </Field>
          <Field label="Width (ft)" urdu="چوڑائی (فٹ)">
            <input
              type="number"
              value={widthFeet}
              onChange={(e) => setWidthFeet(e.target.value)}
              placeholder="Enter width"
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Booking Date" urdu="بکنگ کی تاریخ">
          <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Notes" urdu="نوٹس">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputCls} />
        </Field>
        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-lg px-3 py-2">{error}</div>
        )}
      </div>
      <ModalActions onSave={handleSave} saving={saving} onCancel={onClose} />
    </Modal>
  )
}

