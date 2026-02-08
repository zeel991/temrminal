import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import PrivyProviderWrapper from '@/components/Providers'
import Header from './Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'My Wallet App',
  description: 'Web3 app with Privy wallet connection',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PrivyProviderWrapper>
          <Header />
          {children}
        </PrivyProviderWrapper>
      </body>
    </html>
  )
}