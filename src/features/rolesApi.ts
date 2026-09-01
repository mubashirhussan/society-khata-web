import { api } from '@/store/api'
import type { PermissionGroup, Role } from '@/lib/types'

export const rolesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getRoles: build.query<Role[], void>({
      query: () => '/roles',
      providesTags: ['Roles'],
    }),
    getPermissions: build.query<PermissionGroup[], void>({
      query: () => '/permissions',
      providesTags: ['Permissions'],
    }),
    updateRolePermissions: build.mutation<Role, { id: string; permissionKeys: string[] }>({
      query: ({ id, permissionKeys }) => ({
        url: `/roles/${id}/permissions`,
        method: 'PUT',
        body: { permissionKeys },
      }),
      invalidatesTags: ['Roles', 'Me'],
    }),
    getAssignableRoles: build.query<Role[], void>({
      query: () => '/users/roles',
      providesTags: ['Roles'],
    }),
  }),
})

export const {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useUpdateRolePermissionsMutation,
  useGetAssignableRolesQuery,
} = rolesApi
