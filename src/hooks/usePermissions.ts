'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { hasPermission, type PermissionKey } from '@/lib/permissions'

export function usePermissions() {
  const user = useSelector((s: RootState) => s.auth.user)
  const permissions = user?.permissions ?? []

  return {
    user,
    permissions,
    can: (permission: PermissionKey | string) => hasPermission(permissions, permission),
  }
}

export function useRequirePermission(permission: PermissionKey | string, redirectTo = '/dashboard') {
  const router = useRouter()
  const { user, can } = usePermissions()

  useEffect(() => {
    if (user && !can(permission)) router.replace(redirectTo)
  }, [user, can, permission, redirectTo, router])

  return can(permission)
}
