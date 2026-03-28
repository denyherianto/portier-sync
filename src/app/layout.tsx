import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Portier Sync',
  description: 'Portier Sync Application',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-[#FAFAFA] text-gray-900 antialiased min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
