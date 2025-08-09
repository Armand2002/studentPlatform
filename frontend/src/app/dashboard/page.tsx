"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Route } from 'next'
import RequireAuth from '@/components/auth/RequireAuth'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    let target = '/dashboard/admin'
    if (user.role === 'student') {
      target = '/dashboard/student'
    } else if (user.role === 'tutor') {
      target = '/dashboard/tutor'
    }
    // Fix: router.replace expects a RouteImpl<string>, not a plain string.
    // Use router.push instead, which accepts a string.
    router.replace(target as Route)
  }, [user, router])

  return (
    <RequireAuth>
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex items-center gap-3 text-blue-700">
          <LoadingSpinner />
          <span>Reindirizzamento…</span>
        </div>
      </div>
    </RequireAuth>
  )
}
