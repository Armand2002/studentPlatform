"use client"
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PackagesPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect students to their assigned packages dashboard
    if (user?.role === 'student') {
      router.replace('/dashboard/student/packages')
      return
    }
    
    // For now, redirect all users to appropriate dashboard
    // This page could be reserved for admin package management in the future
    if (user?.role === 'tutor') {
      router.replace('/dashboard/tutor')
      return
    }
    
    if (user?.role === 'admin') {
      router.replace('/dashboard/admin')
      return
    }
    
    // If no user, redirect to login
    router.replace('/login')
  }, [user, router])

  return (
    <section className="w-full min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-foreground-muted">Reindirizzamento in corso...</p>
      </div>
    </section>
  )
}


