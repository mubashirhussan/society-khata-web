'use client'

import { useCallback, useRef, useState } from 'react'
import Modal from '@/components/Modal'

interface ConfirmOptions {
  title?: string
  confirmLabel?: string
}

export function useConfirm() {
  const [message, setMessage] = useState<string | null>(null)
  const [options, setOptions] = useState<ConfirmOptions>({})
  const resolver = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((msg: string, opts: ConfirmOptions = {}) => {
    setMessage(msg)
    setOptions(opts)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const respond = (result: boolean) => {
    resolver.current?.(result)
    resolver.current = null
    setMessage(null)
  }

  const ConfirmDialog = message === null ? null : (
    <Modal title={options.title ?? 'Confirm Delete'} onClose={() => respond(false)} maxWidth="max-w-sm">
      <p className="text-sm text-slate-600">{message}</p>
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={() => respond(false)}
          className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => respond(true)}
          className="flex-1 bg-error-600 hover:bg-error-700 text-white py-2.5 rounded-lg text-sm font-medium transition-all"
        >
          {options.confirmLabel ?? 'Delete'}
        </button>
      </div>
    </Modal>
  )

  return { confirm, ConfirmDialog }
}
