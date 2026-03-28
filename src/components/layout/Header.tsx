'use client'

import { Book, Bell } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-5">
        <div className="font-semibold tracking-tighter text-lg text-black">PORTIER SYNC</div>
        <div className="h-4 w-px bg-gray-200" />
        <nav className="flex items-center gap-2 text-base text-gray-900 font-medium">
          Integrations
        </nav>
      </div>
    </header>
  )
}
