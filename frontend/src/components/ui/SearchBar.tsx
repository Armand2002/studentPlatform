import React from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function SearchBar({ value, onChange, placeholder = 'Cerca...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-3 py-2 border border-border rounded-md w-full text-slate-900 placeholder-slate-500"
      />
    </div>
  )
}
