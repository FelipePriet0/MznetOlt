import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SmartOLT - Network Management',
  description: 'Network management system for ISP',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
