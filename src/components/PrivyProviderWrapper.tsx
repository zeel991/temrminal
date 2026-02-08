'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { privyConfig } from '@/lib/privy-config'

// Replace this with any of the networks listed at https://github.com/wevm/viem/blob/main/src/chains/index.ts
import {base, berachain, polygon, arbitrum, story, mantle} from 'viem/chains';

export default function PrivyProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={privyConfig}
    >
      {children}
    </PrivyProvider>
  )
}