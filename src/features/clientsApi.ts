import { api } from '@/store/api'
import type { Client, ClientRequest } from '@/lib/types'

export const clientsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getClients: build.query<Client[], void>({
      query: () => '/clients',
      providesTags: ['Clients'],
    }),
    createClient: build.mutation<Client, ClientRequest>({
      query: (body) => ({ url: '/clients', method: 'POST', body }),
      invalidatesTags: ['Clients', 'Dashboard'],
    }),
    updateClient: build.mutation<Client, { id: string; body: ClientRequest }>({
      query: ({ id, body }) => ({ url: `/clients/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Clients', 'Properties', 'Payments', 'Dashboard'],
    }),
    deleteClient: build.mutation<void, string>({
      query: (id) => ({ url: `/clients/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Clients', 'Properties', 'Dashboard'],
    }),
  }),
})

export const {
  useGetClientsQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
} = clientsApi
