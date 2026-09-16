'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { getHomeRoute, hasPermission, type PermissionKey } from '@/lib/permissions'

export function usePermissions() {
  const user = useSelector((s: RootState) => s.auth.user)
  const permissions = user?.permissions ?? []

  return {
    user,
    permissions,
    can: (permission: PermissionKey | string) => hasPermission(permissions, permission),
  }
}

export function useRequirePermission(permission: PermissionKey | string) {
  const router = useRouter()
  const { user, can, permissions } = usePermissions()
  const allowed = can(permission)

  useEffect(() => {
    if (!user || allowed) return
    const home = getHomeRoute(permissions, user.isPlatformManager)
    if (home !== '/login') router.replace(home)
  }, [user, allowed, permissions, router])

  return allowed
}
