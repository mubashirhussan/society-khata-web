import { api } from '@/store/api'
import type { CreateUserRequest, UserListItem } from '@/lib/types'

export const usersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<UserListItem[], void>({
      query: () => '/users',
      providesTags: ['Users'],
    }),
    createUser: build.mutation<UserListItem, CreateUserRequest>({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: build.mutation<void, number>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Users'],
    }),
    resetUserPassword: build.mutation<void, { id: number; newPassword: string }>({
      query: ({ id, newPassword }) => ({
        url: `/users/${id}/reset-password`,
        method: 'POST',
        body: { newPassword },
      }),
    }),
  }),
})

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
} = usersApi
