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
    uploadClientPicture: build.mutation<Client, { id: string; picture: File }>({
      query: ({ id, picture }) => {
        const body = new FormData()
        body.append('picture', picture)
        return { url: `/clients/${id}/picture`, method: 'POST', body }
      },
      invalidatesTags: ['Clients'],
    }),
    getClientPicture: build.query<Blob, string>({
      query: (id) => ({
        url: `/clients/${id}/picture`,
        responseHandler: (response) => response.blob(),
      }),
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
  useUploadClientPictureMutation,
  useGetClientPictureQuery,
  useDeleteClientMutation,
} = clientsApi
