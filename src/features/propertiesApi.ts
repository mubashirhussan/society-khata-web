import { api } from '@/store/api'
import type { Property, PropertyRequest } from '@/lib/types'

export const propertiesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProperties: build.query<Property[], void>({
      query: () => '/properties',
      providesTags: ['Properties'],
    }),
    createProperty: build.mutation<Property, PropertyRequest>({
      query: (body) => ({ url: '/properties', method: 'POST', body }),
      invalidatesTags: ['Properties', 'Dashboard'],
    }),
    updateProperty: build.mutation<Property, { id: string; body: PropertyRequest }>({
      query: ({ id, body }) => ({ url: `/properties/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Properties', 'Payments', 'Dashboard'],
    }),
    deleteProperty: build.mutation<void, string>({
      query: (id) => ({ url: `/properties/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Properties', 'Dashboard'],
    }),
  }),
})

export const {
  useGetPropertiesQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
} = propertiesApi
