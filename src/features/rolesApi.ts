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
    updateRolePermissions: build.mutation<Role, { id: number; permissionKeys: string[] }>({
      query: ({ id, permissionKeys }) => ({
        url: `/roles/${id}/permissions`,
        method: 'PUT',
        body: { permissionKeys },
      }),
      invalidatesTags: ['Roles', 'Me'],
    }),
    createRole: build.mutation<Role, { name: string; permissionKeys: string[] }>({
      query: (body) => ({ url: '/roles', method: 'POST', body }),
      invalidatesTags: ['Roles'],
    }),
    renameRole: build.mutation<Role, { id: number; name: string }>({
      query: ({ id, name }) => ({ url: `/roles/${id}`, method: 'PUT', body: { name } }),
      invalidatesTags: ['Roles'],
    }),
    deleteRole: build.mutation<void, number>({
      query: (id) => ({ url: `/roles/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Roles'],
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
  useCreateRoleMutation,
  useRenameRoleMutation,
  useDeleteRoleMutation,
  useGetAssignableRolesQuery,
} = rolesApi
