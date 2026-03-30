import type { Metadata } from 'next'
import { AuthProvider } from '@/lib/auth/context'
import './globals.css'

export const metadata: Metadata = {
  title: 'MZNET OLT – Network Management',
  description: 'GPON network management system for ISPs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" translate="no" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
