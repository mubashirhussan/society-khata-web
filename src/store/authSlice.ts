import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/lib/types'
import { TOKEN_KEY, USER_KEY } from '@/lib/utils'

interface AuthState {
  user: User | null
  token: string | null
  hydrated: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  hydrated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user
      state.token = action.payload.token
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, action.payload.token)
        localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user))
      }
    },
    logout(state) {
      state.user = null
      state.token = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      }
    },
    hydrateAuth(state) {
      if (typeof window === 'undefined') {
        state.hydrated = true
        return
      }
      const token = localStorage.getItem(TOKEN_KEY)
      const raw = localStorage.getItem(USER_KEY)
      state.token = token
      if (raw) {
        try {
          state.user = JSON.parse(raw) as User
        } catch {
          state.user = null
        }
      }
      state.hydrated = true
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_KEY, JSON.stringify(action.payload))
      }
    },
  },
})

export const { setCredentials, logout, hydrateAuth, setUser } = authSlice.actions
export default authSlice.reducer
