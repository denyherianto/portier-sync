'use client'

import { Book, Bell } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-5">
        <div className="font-semibold tracking-tighter text-lg text-black">NEXUS</div>
        <div className="h-4 w-px bg-gray-200" />
        <nav className="flex items-center gap-2 text-base text-gray-900 font-medium">
          Integrations
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-base font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5">
          <Book strokeWidth={1.5} className="w-5 h-5" />
          Docs
        </button>
        <button className="relative text-gray-500 hover:text-gray-900 transition-colors">
          <Bell strokeWidth={1.5} className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
        <div className="h-8 w-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium cursor-pointer">
          JD
        </div>
      </div>
    </header>
  )
}
