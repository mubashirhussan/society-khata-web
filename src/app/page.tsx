'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'

export default function HomePage() {
  const router = useRouter()
  const { token, hydrated } = useSelector((s: RootState) => s.auth)

  useEffect(() => {
    if (!hydrated) return
    router.replace(token ? '/dashboard' : '/login')
  }, [hydrated, token, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-slate-400 text-sm">Loading...</div>
    </div>
  )
}
