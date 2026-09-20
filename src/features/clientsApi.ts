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
    updateClient: build.mutation<Client, { id: number; body: ClientRequest }>({
      query: ({ id, body }) => ({ url: `/clients/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Clients', 'Properties', 'Payments', 'Dashboard'],
    }),
    uploadClientPicture: build.mutation<Client, { id: number; picture: File }>({
      query: ({ id, picture }) => {
        const body = new FormData()
        body.append('picture', picture)
        return { url: `/clients/${id}/picture`, method: 'POST', body }
      },
      invalidatesTags: ['Clients'],
    }),
    getClientPicture: build.query<Blob, number>({
      query: (id) => ({
        url: `/clients/${id}/picture`,
        responseHandler: (response) => response.blob(),
      }),
      providesTags: (_result, _error, id) => [{ type: 'Clients', id: `picture-${id}` }],
    }),
    deleteClient: build.mutation<void, number>({
      query: (id) => ({ url: `/clients/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Clients', 'Properties', 'Payments', 'Dashboard'],
    }),
  }),
})

export const {
  useGetClientsQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useUploadClientPictureMutation,
  useGetClientPictureQuery,
  useDeleteClientMutation,
} = clientsApi
