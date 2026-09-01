import { api } from '@/store/api'
import type { Expense, ExpenseRequest } from '@/lib/types'

export const expensesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getExpenses: build.query<Expense[], void>({
      query: () => '/expenses',
      providesTags: ['Expenses'],
    }),
    createExpense: build.mutation<Expense, ExpenseRequest>({
      query: (body) => ({ url: '/expenses', method: 'POST', body }),
      invalidatesTags: ['Expenses', 'Dashboard'],
    }),
    updateExpense: build.mutation<Expense, { id: string; body: ExpenseRequest }>({
      query: ({ id, body }) => ({ url: `/expenses/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Expenses', 'Dashboard'],
    }),
    deleteExpense: build.mutation<void, string>({
      query: (id) => ({ url: `/expenses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Expenses', 'Dashboard'],
    }),
  }),
})

export const {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = expensesApi
