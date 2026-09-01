'use client'

import { X } from 'lucide-react'

export default function Modal({
  title,
  onClose,
  children,
  maxWidth = 'max-w-lg',
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  maxWidth?: string
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto animate-fadeIn`}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function ModalActions({
  onSave,
  saving,
  onCancel,
  saveLabel = 'Save',
  saveClassName = 'bg-primary-600 hover:bg-primary-700',
}: {
  onSave: () => void
  saving: boolean
  onCancel: () => void
  saveLabel?: string
  saveClassName?: string
}) {
  return (
    <div className="flex gap-3 mt-6">
      <button
        onClick={onCancel}
        className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className={`flex-1 text-white py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-60 ${saveClassName}`}
      >
        {saving ? 'Saving...' : saveLabel}
      </button>
    </div>
  )
}

export function Field({
  label,
  urdu,
  children,
}: {
  label: string
  urdu: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} <span className="font-urdu text-xs text-slate-400">{urdu}</span>
      </label>
      {children}
    </div>
  )
}

export const inputCls =
  'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
