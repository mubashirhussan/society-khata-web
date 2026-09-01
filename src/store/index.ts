import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import authReducer from './authSlice'
import { api } from './api'
import '@/features/authApi'
import '@/features/clientsApi'
import '@/features/propertiesApi'
import '@/features/paymentsApi'
import '@/features/expensesApi'
import '@/features/dashboardApi'
import '@/features/usersApi'
import '@/features/rolesApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
