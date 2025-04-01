import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Weight Tracker',
  description: 'Weight Tracker',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
