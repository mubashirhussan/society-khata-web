export const PERMS = {
  dashboardView: 'dashboard.view',
  propertiesView: 'properties.view',
  propertiesCreate: 'properties.create',
  propertiesEdit: 'properties.edit',
  propertiesDelete: 'properties.delete',
  paymentsView: 'payments.view',
  paymentsCreate: 'payments.create',
  paymentsEdit: 'payments.edit',
  paymentsDelete: 'payments.delete',
  expensesView: 'expenses.view',
  expensesCreate: 'expenses.create',
  expensesEdit: 'expenses.edit',
  expensesDelete: 'expenses.delete',
  reportsView: 'reports.view',
  usersView: 'users.view',
  usersManage: 'users.manage',
  rolesManage: 'roles.manage',
} as const

export type PermissionKey = (typeof PERMS)[keyof typeof PERMS]

export function hasPermission(
  permissions: string[] | undefined,
  permission: PermissionKey | string
): boolean {
  return permissions?.includes(permission) ?? false
}

export function hasAnyPermission(
  permissions: string[] | undefined,
  keys: string[]
): boolean {
  return keys.some((k) => hasPermission(permissions, k))
}

export const NAV_PERMISSIONS: Record<string, PermissionKey> = {
  '/dashboard': PERMS.dashboardView,
  '/properties': PERMS.propertiesView,
  '/clients': PERMS.propertiesView,
  '/payments': PERMS.paymentsView,
  '/expenses': PERMS.expensesView,
  '/reports': PERMS.reportsView,
  '/users': PERMS.usersView,
  '/roles': PERMS.rolesManage,
}
