import { api } from '@/store/api'
import type { SocietiesOverview } from '@/lib/types'

export const platformApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSocieties: build.query<SocietiesOverview, void>({
      query: () => '/platform/societies',
    }),
  }),
})

export const { useGetSocietiesQuery } = platformApi
