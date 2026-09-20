import { api } from '@/store/api'
import type {
  Payment,
  PaymentClientDetail,
  PaymentClientSummary,
  PaymentLedgerRow,
  PaymentRequest,
} from '@/lib/types'

export const paymentsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPayments: build.query<Payment[], void>({
      query: () => '/payments',
      providesTags: ['Payments'],
    }),
    getPaymentLedger: build.query<PaymentLedgerRow[], void>({
      query: () => '/payments/ledger',
      providesTags: ['Payments'],
    }),
    getPaymentsSummary: build.query<PaymentClientSummary[], void>({
      query: () => '/payments/summary',
      providesTags: ['Payments'],
    }),
    getPaymentClientDetail: build.query<PaymentClientDetail, number>({
      query: (clientId) => `/payments/client/${clientId}`,
      providesTags: ['Payments'],
    }),
    createPayment: build.mutation<Payment, PaymentRequest>({
      query: (body) => ({ url: '/payments', method: 'POST', body }),
      invalidatesTags: ['Payments', 'Properties', 'Dashboard'],
    }),
    updatePayment: build.mutation<Payment, { id: number; body: PaymentRequest }>({
      query: ({ id, body }) => ({ url: `/payments/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Payments', 'Properties', 'Dashboard'],
    }),
    deletePayment: build.mutation<void, number>({
      query: (id) => ({ url: `/payments/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Payments', 'Properties', 'Dashboard'],
    }),
  }),
})

export const {
  useGetPaymentsQuery,
  useGetPaymentLedgerQuery,
  useGetPaymentsSummaryQuery,
  useGetPaymentClientDetailQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
} = paymentsApi
