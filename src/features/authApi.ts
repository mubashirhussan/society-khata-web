import { api } from '@/store/api'
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/lib/types'

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    register: build.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    me: build.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['Me'],
    }),
  }),
})

export const { useLoginMutation, useRegisterMutation, useMeQuery, useLazyMeQuery } = authApi
