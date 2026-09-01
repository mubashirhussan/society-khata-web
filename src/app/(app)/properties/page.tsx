'use client'

import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Building2, User, Phone, MapPin } from 'lucide-react'
import {
  useGetPropertiesQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
} from '@/features/propertiesApi'
import {
  useGetClientsQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
} from '@/features/clientsApi'
import { formatPKR, formatDate, getApiError } from '@/lib/utils'
import { PERMS } from '@/lib/permissions'
import { usePermissions, useRequirePermission } from '@/hooks/usePermissions'
import type { Client, Property } from '@/lib/types'
import Modal, { ModalActions, Field, inputCls } from '@/components/Modal'

export default function PropertiesPage() {
  useRequirePermission(PERMS.propertiesView)
  const { can } = usePermissions()
  const canCreate = can(PERMS.propertiesCreate)
  const canEdit = can(PERMS.propertiesEdit)
  const canDelete = can(PERMS.propertiesDelete)
  const canManage = canCreate || canEdit || canDelete
  const { data: properties = [], isLoading: loadingProps } = useGetPropertiesQuery()
  const { data: clients = [], isLoading: loadingClients } = useGetClientsQuery()
  const [deleteProperty] = useDeletePropertyMutation()
  const [deleteClient] = useDeleteClientMutation()

  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showClientModal, setShowClientModal] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const loading = loadingProps || loadingClients

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
            Properties & Clients <span className="font-urdu text-lg text-slate-500">پلاٹ و گاہک</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {canManage ? 'Manage plots, shops, and client information' : 'View plots, shops, and client information'}
          </p>
        </div>
        {canCreate && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingClient(null)
                setShowClientModal(true)
              }}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all"
            >
              <Plus className="w-4 h-4" /> New Client
            </button>
            <button
              onClick={() => {
                setEditingProperty(null)
                setShowAddModal(true)
              }}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            >
              <Plus className="w-4 h-4" /> Add Property & Client
            </button>
          </div>
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
            {canCreate && ' Click "Add Property & Client" to get started.'}
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
                        <button
                          onClick={() => setSelectedClient(p.client ?? null)}
                          className="text-primary-600 hover:underline font-medium"
                        >
                          {p.client.name}
                        </button>
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
                                if (confirm(`Delete property ${p.propertyNumber}?`)) {
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

      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Clients <span className="font-urdu text-slate-400">گاہک</span>
        </h3>
        {clients.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-6 text-center text-slate-400 text-sm">
            No clients found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.cnic ?? 'No CNIC'}</p>
                    </div>
                  </div>
                  {(canEdit || canDelete) && (
                    <div className="flex gap-1">
                      {canEdit && (
                        <button
                          onClick={() => {
                            setEditingClient(c)
                            setShowClientModal(true)
                          }}
                          className="p-1 text-slate-400 hover:text-primary-600 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={async () => {
                            if (confirm(`Delete client ${c.name}?`)) {
                              await deleteClient(c.id)
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-error-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-1 text-xs text-slate-500">
                  {c.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> {c.phone}
                    </p>
                  )}
                  {c.address && (
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> {c.address}
                    </p>
                  )}
                  {c.fatherHusband && (
                    <p className="flex items-center gap-1.5">
                      <User className="w-3 h-3" /> {c.fatherHusband}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (canCreate || (editingProperty && canEdit)) && (
        <PropertyModal
          property={editingProperty}
          clients={clients}
          onClose={() => setShowAddModal(false)}
          onSaved={() => setShowAddModal(false)}
          onNewClient={() => {
            setShowAddModal(false)
            setEditingClient(null)
            setShowClientModal(true)
          }}
        />
      )}

      {showClientModal && (canCreate || (editingClient && canEdit)) && (
        <ClientModal
          client={editingClient}
          onClose={() => setShowClientModal(false)}
          onSaved={() => setShowClientModal(false)}
        />
      )}

      {selectedClient && (
        <ClientProfileModal
          client={selectedClient}
          properties={properties.filter((p) => p.clientId === selectedClient.id)}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  )
}

function PropertyModal({
  property,
  clients,
  onClose,
  onSaved,
  onNewClient,
}: {
  property: Property | null
  clients: Client[]
  onClose: () => void
  onSaved: () => void
  onNewClient: () => void
}) {
  const [createProperty] = useCreatePropertyMutation()
  const [updateProperty] = useUpdatePropertyMutation()
  const [propertyNumber, setPropertyNumber] = useState(property?.propertyNumber ?? '')
  const [propertyType, setPropertyType] = useState(property?.propertyType ?? 'plot')
  const [marla, setMarla] = useState(property?.marla?.toString() ?? '')
  const [totalPrice, setTotalPrice] = useState(property?.totalPrice?.toString() ?? '')
  const [bookingDate, setBookingDate] = useState(property?.bookingDate ?? '')
  const [status, setStatus] = useState(property?.status ?? 'available')
  const [existingClientId, setExistingClientId] = useState(property?.clientId ?? '')
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
      totalPrice: totalPrice ? parseFloat(totalPrice) : 0,
      bookingDate: bookingDate || null,
      status,
      clientId: existingClientId || null,
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
    <Modal title={property ? 'Edit Property' : 'Add Property & Client'} onClose={onClose}>
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
          <Field label="Booking Date" urdu="بکنگ کی تاریخ">
            <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Status" urdu="حالت">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="sold">Sold</option>
            </select>
          </Field>
        </div>
        <Field label="Assign Client" urdu="مختص جائیداد">
          <div className="flex gap-2">
            <select
              value={existingClientId}
              onChange={(e) => setExistingClientId(e.target.value)}
              className={inputCls}
            >
              <option value="">— Select client... گاہک منتخب کریں —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onNewClient}
              className="flex-shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 rounded-lg text-sm font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
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

function ClientModal({
  client,
  onClose,
  onSaved,
}: {
  client: Client | null
  onClose: () => void
  onSaved: () => void
}) {
  const [createClient] = useCreateClientMutation()
  const [updateClient] = useUpdateClientMutation()
  const [name, setName] = useState(client?.name ?? '')
  const [cnic, setCnic] = useState(client?.cnic ?? '')
  const [phone, setPhone] = useState(client?.phone ?? '')
  const [address, setAddress] = useState(client?.address ?? '')
  const [fatherHusband, setFatherHusband] = useState(client?.fatherHusband ?? '')
  const [notes, setNotes] = useState(client?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    const body = {
      name: name.trim(),
      cnic: cnic || null,
      phone: phone || null,
      address: address || null,
      fatherHusband: fatherHusband || null,
      notes: notes || null,
    }
    try {
      if (client) {
        await updateClient({ id: client.id, body }).unwrap()
      } else {
        await createClient(body).unwrap()
      }
      onSaved()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={client ? 'Edit Client' : 'New Client'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Client Name" urdu="گاہک کا نام">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter client name"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="CNIC" urdu="شناختی کارڈ">
            <input
              value={cnic}
              onChange={(e) => setCnic(e.target.value)}
              placeholder="XXXXX-XXXXXXX-X"
              className={inputCls}
            />
          </Field>
          <Field label="Phone" urdu="فون نمبر">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="03XX-XXXXXXX"
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Father / Husband" urdu="والد / شوہر کا نام">
          <input value={fatherHusband} onChange={(e) => setFatherHusband(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Address" urdu="پتہ">
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className={inputCls} />
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

function ClientProfileModal({
  client,
  properties,
  onClose,
}: {
  client: Client
  properties: Property[]
  onClose: () => void
}) {
  return (
    <Modal title="Client Profile" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{client.name}</h3>
            <p className="text-sm text-slate-400">{client.cnic ?? 'No CNIC'}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {client.phone && <InfoItem icon={Phone} label="Phone" value={client.phone} />}
          {client.fatherHusband && <InfoItem icon={User} label="Father/Husband" value={client.fatherHusband} />}
          {client.address && <InfoItem icon={MapPin} label="Address" value={client.address} />}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-2">
            Assigned Properties <span className="font-urdu text-slate-400">مختص جائیداد</span>
          </h4>
          {properties.length === 0 ? (
            <p className="text-sm text-slate-400">No properties assigned.</p>
          ) : (
            <div className="space-y-2">
              {properties.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">{p.propertyNumber}</span>
                    <span className="text-xs text-slate-400">({p.propertyType})</span>
                  </div>
                  <span className="text-sm font-bold text-slate-700">Rs {formatPKR(p.totalPrice)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
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
      <Icon className="w-4 h-4 text-slate-400 mt-0.5" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm text-slate-700">{value}</p>
      </div>
    </div>
  )
}
