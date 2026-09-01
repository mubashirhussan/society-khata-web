import { api } from '@/store/api'
import type { Payment, PaymentRequest } from '@/lib/types'

export const paymentsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPayments: build.query<Payment[], void>({
      query: () => '/payments',
      providesTags: ['Payments'],
    }),
    createPayment: build.mutation<Payment, PaymentRequest>({
      query: (body) => ({ url: '/payments', method: 'POST', body }),
      invalidatesTags: ['Payments', 'Dashboard'],
    }),
    updatePayment: build.mutation<Payment, { id: string; body: PaymentRequest }>({
      query: ({ id, body }) => ({ url: `/payments/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Payments', 'Dashboard'],
    }),
    deletePayment: build.mutation<void, string>({
      query: (id) => ({ url: `/payments/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Payments', 'Dashboard'],
    }),
  }),
})

export const {
  useGetPaymentsQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
} = paymentsApi
