'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Plug, History, Settings, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/integrations', label: 'Integrations', icon: Plug },
  { href: '/audit-log', label: 'Audit Log', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full z-10 shrink-0 hidden md:flex">
      {/* Logo */}
      <div className="h-14 flex items-center px-6 border-b border-gray-100">
        <span className="text-base font-medium tracking-tighter text-gray-900">S Y N C A</span>
      </div>

      {/* Main Nav */}
      <nav className="p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
              pathname.startsWith(href)
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
