'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Building2, Edit2, ImagePlus, MapPin, Phone, Plus, Search, Trash2, User } from 'lucide-react'
import {
  useCreateClientMutation,
  useDeleteClientMutation,
  useGetClientPictureQuery,
  useGetClientsQuery,
  useUploadClientPictureMutation,
  useUpdateClientMutation,
} from '@/features/clientsApi'
import { useGetPropertiesQuery } from '@/features/propertiesApi'
import { getApiError, formatPKR } from '@/lib/utils'
import { PERMS } from '@/lib/permissions'
import { usePermissions, useRequirePermission } from '@/hooks/usePermissions'
import type { Client, Property } from '@/lib/types'
import Modal, { Field, inputCls, ModalActions } from '@/components/Modal'

export default function ClientsPage() {
  useRequirePermission(PERMS.propertiesView)
  const { can } = usePermissions()
  const canCreate = can(PERMS.propertiesCreate)
  const canEdit = can(PERMS.propertiesEdit)
  const canDelete = can(PERMS.propertiesDelete)
  const canManage = canCreate || canEdit || canDelete

  const { data: clients = [], isLoading } = useGetClientsQuery()
  const { data: properties = [] } = useGetPropertiesQuery()
  const [deleteClient] = useDeleteClientMutation()

  const [search, setSearch] = useState('')
  const [showClientModal, setShowClientModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const filtered = clients.filter((client) => {
    const query = search.toLowerCase()
    return (
      client.name.toLowerCase().includes(query) ||
      client.cnic?.toLowerCase().includes(query) ||
      client.phone?.toLowerCase().includes(query) ||
      client.address?.toLowerCase().includes(query) ||
      client.fatherHusband?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Clients <span className="font-urdu text-lg text-slate-500">گاہک</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {canManage ? 'Manage client information' : 'View client information'}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => {
              setEditingClient(null)
              setShowClientModal(true)
            }}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> New Client
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search clients... گاہک تلاش کریں"
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-400 text-sm">
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-400 text-sm">
          No clients found.
          {canCreate && clients.length === 0 && ' Click "New Client" to get started.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <button
                  onClick={() => setSelectedClient(client)}
                  className="flex items-center gap-2 text-left min-w-0"
                >
                  <ClientAvatar client={client} size="small" />
                  <span className="min-w-0">
                    <span className="block font-medium text-slate-800 text-sm truncate hover:text-primary-600">
                      {client.name}
                    </span>
                    <span className="block text-xs text-slate-400">{client.cnic ?? 'No CNIC'}</span>
                  </span>
                </button>
                {(canEdit || canDelete) && (
                  <div className="flex gap-1">
                    {canEdit && (
                      <button
                        onClick={() => {
                          setEditingClient(client)
                          setShowClientModal(true)
                        }}
                        className="p-1 text-slate-400 hover:text-primary-600 transition-colors"
                        title="Edit client"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={async () => {
                          if (confirm(`Delete client ${client.name}?`)) {
                            await deleteClient(client.id)
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-error-600 transition-colors"
                        title="Delete client"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-1 text-xs text-slate-500">
                {client.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> {client.phone}
                  </p>
                )}
                {client.address && (
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> {client.address}
                  </p>
                )}
                {client.fatherHusband && (
                  <p className="flex items-center gap-1.5">
                    <User className="w-3 h-3" /> {client.fatherHusband}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedClient(client)}
                className="mt-4 text-xs font-medium text-primary-600 hover:underline"
              >
                View profile
              </button>
            </div>
          ))}
        </div>
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
          properties={properties.filter((property) => property.clientId === selectedClient.id)}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
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
  const [uploadClientPicture] = useUploadClientPictureMutation()
  const [name, setName] = useState(client?.name ?? '')
  const [cnic, setCnic] = useState(client?.cnic ?? '')
  const [phone, setPhone] = useState(client?.phone ?? '')
  const [address, setAddress] = useState(client?.address ?? '')
  const [fatherHusband, setFatherHusband] = useState(client?.fatherHusband ?? '')
  const [notes, setNotes] = useState(client?.notes ?? '')
  const [picture, setPicture] = useState<File | null>(null)
  const [picturePreview, setPicturePreview] = useState<string | null>(null)
  const [createdClientId, setCreatedClientId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (picturePreview) URL.revokeObjectURL(picturePreview)
    }
  }, [picturePreview])

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
        let clientId = createdClientId
        if (!clientId) {
          const createdClient = await createClient(body).unwrap()
          clientId = createdClient.id
          setCreatedClientId(clientId)
        }
        if (picture) {
          await uploadClientPicture({ id: clientId, picture }).unwrap()
        }
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
        {!client && (
          <Field label="Client Picture (optional)" urdu="گاہک کی تصویر">
            <label className="flex items-center gap-4 rounded-lg border border-dashed border-slate-300 p-3 cursor-pointer hover:border-primary-400 transition-colors">
              <span className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                {picturePreview ? (
                  <Image
                    src={picturePreview}
                    alt="Client preview"
                    width={64}
                    height={64}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImagePlus className="w-6 h-6 text-slate-400" />
                )}
              </span>
              <span>
                <span className="block text-sm font-medium text-slate-700">
                  {picture ? picture.name : 'Choose a picture'}
                </span>
                <span className="block text-xs text-slate-400 mt-1">JPG, PNG, or WebP · Max 5 MB</span>
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null
                  if (file && file.size > 5 * 1024 * 1024) {
                    setPicture(null)
                    setPicturePreview(null)
                    setError('Please choose an image smaller than 5 MB.')
                    return
                  }
                  setError(null)
                  setPicture(file)
                  setPicturePreview(file ? URL.createObjectURL(file) : null)
                }}
              />
            </label>
          </Field>
        )}
        <Field label="Client Name" urdu="گاہک کا نام">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter client name"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="CNIC" urdu="شناختی کارڈ">
            <input
              value={cnic}
              onChange={(event) => setCnic(event.target.value)}
              placeholder="XXXXX-XXXXXXX-X"
              className={inputCls}
            />
          </Field>
          <Field label="Phone" urdu="فون نمبر">
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="03XX-XXXXXXX"
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Father / Husband" urdu="والد / شوہر کا نام">
          <input
            value={fatherHusband}
            onChange={(event) => setFatherHusband(event.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Address" urdu="پتہ">
          <textarea
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            rows={2}
            className={inputCls}
          />
        </Field>
        <Field label="Notes" urdu="نوٹس">
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
            className={inputCls}
          />
        </Field>
        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
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
          <ClientAvatar client={client} size="large" />
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
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">{property.propertyNumber}</span>
                    <span className="text-xs text-slate-400">({property.propertyType})</span>
                  </div>
                  <span className="text-sm font-bold text-slate-700">Rs {formatPKR(property.totalPrice)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
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

  const dimensions = size === 'large' ? 'w-12 h-12 rounded-xl' : 'w-8 h-8 rounded-lg'
  const iconSize = size === 'large' ? 'w-6 h-6' : 'w-4 h-4'

  return (
    <span className={`${dimensions} bg-primary-100 overflow-hidden flex items-center justify-center flex-shrink-0`}>
      {pictureUrl ? (
        <Image
          src={pictureUrl}
          alt={client.name}
          width={size === 'large' ? 48 : 32}
          height={size === 'large' ? 48 : 32}
          unoptimized
          className="w-full h-full object-cover"
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
      <Icon className="w-4 h-4 text-slate-400 mt-0.5" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm text-slate-700">{value}</p>
      </div>
    </div>
  )
}
