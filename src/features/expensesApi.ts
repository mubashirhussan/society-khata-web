import { api } from '@/store/api'
import type { Expense, ExpenseRequest, ExpenseTitle } from '@/lib/types'

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
    updateExpense: build.mutation<Expense, { id: number; body: ExpenseRequest }>({
      query: ({ id, body }) => ({ url: `/expenses/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Expenses', 'Dashboard'],
    }),
    deleteExpense: build.mutation<void, number>({
      query: (id) => ({ url: `/expenses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Expenses', 'Dashboard'],
    }),
    getExpenseTitles: build.query<ExpenseTitle[], void>({
      query: () => '/expenses/titles',
      providesTags: ['ExpenseTitles'],
    }),
    createExpenseTitle: build.mutation<ExpenseTitle, { name: string }>({
      query: (body) => ({ url: '/expenses/titles', method: 'POST', body }),
      invalidatesTags: ['ExpenseTitles'],
    }),
    updateExpenseTitle: build.mutation<ExpenseTitle, { id: number; name: string }>({
      query: ({ id, name }) => ({ url: `/expenses/titles/${id}`, method: 'PUT', body: { name } }),
      invalidatesTags: ['ExpenseTitles', 'Expenses'],
    }),
    deleteExpenseTitle: build.mutation<void, number>({
      query: (id) => ({ url: `/expenses/titles/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ExpenseTitles', 'Expenses'],
    }),
  }),
})

export const {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpenseTitlesQuery,
  useCreateExpenseTitleMutation,
  useUpdateExpenseTitleMutation,
  useDeleteExpenseTitleMutation,
} = expensesApi
