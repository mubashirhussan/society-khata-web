'use client'

import { useEffect, useRef, useState } from 'react'
import { DateRangePicker as RDRPicker, type Range, type RangeKeyDict } from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { Calendar, X } from 'lucide-react'

export interface DateRangeValue {
  from?: string // yyyy-MM-dd
  to?: string
}

interface Props {
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
}

const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const fromIso = (s?: string) => {
  if (!s) return undefined
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const fmt = (s?: string) =>
  s ? fromIso(s)!.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''

export default function DateRangePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Range>({ key: 'selection' })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const openPicker = () => {
    const from = fromIso(value.from)
    const to = fromIso(value.to)
    setDraft({ startDate: from ?? new Date(), endDate: to ?? from ?? new Date(), key: 'selection' })
    setOpen(true)
  }

  const apply = () => {
    if (!draft.startDate) return
    onChange({
      from: toIso(draft.startDate),
      to: toIso(draft.endDate ?? draft.startDate),
    })
    setOpen(false)
  }

  const label =
    value.from || value.to
      ? value.from === value.to
        ? fmt(value.from)
        : `${fmt(value.from)} – ${fmt(value.to)}`
      : 'All Time'

  return (
    <div ref={ref} className="relative inline-block">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => (open ? setOpen(false) : openPicker())}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          <Calendar className="w-4 h-4 text-slate-400" />
          {label}
        </button>
        {(value.from || value.to) && (
          <button
            type="button"
            aria-label="Clear dates"
            onClick={() => onChange({})}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-30 mt-2 left-0 max-w-[92vw] overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-lg">
          <RDRPicker
            ranges={[draft]}
            onChange={(r: RangeKeyDict) => setDraft(r.selection)}
            months={2}
            shownDate={draft.startDate}
            maxDate={new Date(new Date().getFullYear() + 5, 11, 31)}
            minDate={new Date(2015, 0, 1)}
            direction="horizontal"
            moveRangeOnFirstSelection={false}
            rangeColors={['#0284c7']}
          />
          <div className="flex justify-end gap-2 p-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 rounded-lg hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={apply}
              className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
