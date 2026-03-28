import type { ReactNode } from 'react'
import { Header } from '@/components/layout/Header'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <>
      <Header />
      {children}
    </>
  )
}
