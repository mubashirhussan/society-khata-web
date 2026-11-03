import { api } from '@/store/api'
import type { DashboardStats } from '@/lib/types'

export interface DashboardRange {
  from?: string
  to?: string
}

export const dashboardApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDashboardStats: build.query<DashboardStats, DashboardRange | void>({
      query: (range) => {
        const params = new URLSearchParams()
        if (range?.from) params.set('from', range.from)
        if (range?.to) params.set('to', range.to)
        const qs = params.toString()
        return `/dashboard/stats${qs ? `?${qs}` : ''}`
      },
      providesTags: ['Dashboard'],
    }),
  }),
})

export const { useGetDashboardStatsQuery } = dashboardApi
