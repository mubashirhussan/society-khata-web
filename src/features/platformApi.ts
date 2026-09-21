import { api } from '@/store/api'
import type { SocietiesOverview } from '@/lib/types'

export const platformApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSocieties: build.query<SocietiesOverview, void>({
      query: () => '/platform/societies',
      providesTags: ['Societies'],
    }),
    setSocietyActive: build.mutation<void, { id: number; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/platform/societies/${id}/active`,
        method: 'POST',
        body: { isActive },
      }),
      invalidatesTags: ['Societies'],
    }),
    resetSocietyAdminPassword: build.mutation<void, { id: number; newPassword: string }>({
      query: ({ id, newPassword }) => ({
        url: `/platform/societies/${id}/reset-admin-password`,
        method: 'POST',
        body: { newPassword },
      }),
    }),
    deleteSociety: build.mutation<void, number>({
      query: (id) => ({ url: `/platform/societies/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Societies'],
    }),
  }),
})

export const {
  useGetSocietiesQuery,
  useSetSocietyActiveMutation,
  useResetSocietyAdminPasswordMutation,
  useDeleteSocietyMutation,
} = platformApi
