'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useGetTenantLogoQuery } from '@/features/authApi'
import { usePermissions } from '@/hooks/usePermissions'

export default function PrintHeader({ subtitle }: { subtitle?: string }) {
  const { user } = usePermissions()
  const { data: logoBlob } = useGetTenantLogoQuery(undefined, { skip: !user?.hasLogo })
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!logoBlob) {
      setLogoUrl(null)
      return
    }
    const url = URL.createObjectURL(logoBlob)
    setLogoUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [logoBlob])

  return (
    <div className="text-center">
      {logoUrl && (
        <Image
          src={logoUrl}
          alt={user?.tenantName || 'Society logo'}
          width={56}
          height={56}
          unoptimized
          className="mx-auto mb-2 h-14 w-14 rounded-lg object-cover"
        />
      )}
      <h1 className="text-xl font-bold text-slate-900">{user?.tenantName || 'Society Khata'}</h1>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
  )
}
