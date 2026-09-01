'use client'

import { useEffect, useMemo, useState } from 'react'
import { Shield, Save, Loader2 } from 'lucide-react'
import {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useUpdateRolePermissionsMutation,
} from '@/features/rolesApi'
import { getApiError } from '@/lib/utils'
import { PERMS } from '@/lib/permissions'
import { useRequirePermission } from '@/hooks/usePermissions'

export default function RolesPage() {
  const allowed = useRequirePermission(PERMS.rolesManage)
  const { data: roles = [], isLoading: loadingRoles } = useGetRolesQuery(undefined, { skip: !allowed })
  const { data: permissionGroups = [], isLoading: loadingPerms } = useGetPermissionsQuery(undefined, { skip: !allowed })
  const [updatePermissions, { isLoading: saving }] = useUpdateRolePermissionsMutation()

  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId),
    [roles, selectedRoleId]
  )

  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0].id)
      setSelectedKeys(roles[0].permissions)
    }
  }, [roles, selectedRoleId])

  useEffect(() => {
    if (selectedRole) setSelectedKeys(selectedRole.permissions)
  }, [selectedRole])

  if (!allowed) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-400 text-sm">
        Redirecting...
      </div>
    )
  }

  const loading = loadingRoles || loadingPerms

  const togglePermission = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const toggleGroup = (keys: string[], checked: boolean) => {
    setSelectedKeys((prev) => {
      const without = prev.filter((k) => !keys.includes(k))
      return checked ? [...without, ...keys] : without
    })
  }

  const handleSave = async () => {
    if (!selectedRoleId) return
    setError(null)
    setMessage(null)
    try {
      await updatePermissions({ id: selectedRoleId, permissionKeys: selectedKeys }).unwrap()
      setMessage('Permissions saved. Users must sign in again for changes to apply.')
    } catch (err) {
      setError(getApiError(err))
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Roles & Permissions <span className="font-urdu text-lg text-slate-500">کردار و اجازت</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Control which screens each role can access
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !selectedRoleId}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Permissions
        </button>
      </div>

      {message && (
        <div className="bg-success-50 border border-success-200 text-success-700 text-sm rounded-lg px-4 py-3">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Roles
            </h3>
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedRoleId === role.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {role.name}
                {role.isSystem && (
                  <span className={`block text-xs mt-0.5 ${selectedRoleId === role.id ? 'text-primary-100' : 'text-slate-400'}`}>
                    System role
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
            <h3 className="text-sm font-semibold text-slate-700">
              Permissions for <span className="text-primary-600">{selectedRole?.name}</span>
            </h3>

            {permissionGroups.map((group) => {
              const groupKeys = group.permissions.map((p) => p.key)
              const allChecked = groupKeys.every((k) => selectedKeys.includes(k))
              const someChecked = groupKeys.some((k) => selectedKeys.includes(k))

              return (
                <div key={group.group} className="border border-slate-100 rounded-lg p-4">
                  <label className="flex items-center gap-2 mb-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={(el) => {
                        if (el) el.indeterminate = someChecked && !allChecked
                      }}
                      onChange={(e) => toggleGroup(groupKeys, e.target.checked)}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-semibold text-slate-800">{group.group}</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                    {group.permissions.map((perm) => (
                      <label key={perm.key} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedKeys.includes(perm.key)}
                          onChange={() => togglePermission(perm.key)}
                          className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        {perm.name}
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
