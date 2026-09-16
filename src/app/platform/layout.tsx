'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { logout, setUser } from '@/store/authSlice'
import { useLazyMeQuery } from '@/features/authApi'
import { getHomeRoute } from '@/lib/permissions'

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const dispatch = useDispatch()
  const { token, hydrated, user } = useSelector((s: RootState) => s.auth)
  const [fetchMe] = useLazyMeQuery()

  useEffect(() => {
    if (!hydrated) return
    if (!token) {
      router.replace('/login')
      return
    }

    fetchMe()
      .unwrap()
      .then((me) => {
        dispatch(setUser(me))
        if (!me.isPlatformManager) router.replace(getHomeRoute(me.permissions))
      })
      .catch(() => {
        dispatch(logout())
        router.replace('/login')
      })
  }, [hydrated, token, fetchMe, dispatch, router])

  useEffect(() => {
    if (hydrated && user && !user.isPlatformManager) {
      router.replace(getHomeRoute(user.permissions))
    }
  }, [hydrated, user, router])

  if (!hydrated || !token || !user || !user.isPlatformManager) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    )
  }

  return <div className="min-h-screen bg-slate-50">{children}</div>
}
