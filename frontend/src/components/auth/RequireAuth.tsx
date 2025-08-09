"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [isLoading, user, router])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }
  return <>{children}</>
}


