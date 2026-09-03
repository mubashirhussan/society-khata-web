import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from './index'
import { TOKEN_KEY } from '@/lib/utils'

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5084/api'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const stateToken = (getState() as RootState).auth.token
      const token =
        stateToken ||
        (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null)
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Clients', 'Properties', 'Payments', 'Expenses', 'Dashboard', 'Users', 'Me', 'Roles', 'Permissions'],
  endpoints: () => ({}),
})
