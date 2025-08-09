"use client"
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getMe, loginWithPassword, registerUser } from '@/lib/api'

type UserRole = 'student' | 'tutor' | 'admin'

interface User {
  id: number
  email: string
  role: UserRole
  is_active?: boolean
  is_verified?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (input: { email: string; password: string; role: 'student' | 'tutor'; first_name?: string; last_name?: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const bootstrap = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      if (!token) return
      const me = await getMe()
      setUser(me)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    bootstrap().finally(() => setIsLoading(false))
  }, [bootstrap])

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await loginWithPassword(email, password)
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', tokens.access_token)
      localStorage.setItem('refresh_token', tokens.refresh_token)
    }
    const me = await getMe()
    setUser(me)
  }, [])

  const register = useCallback(async (input: { email: string; password: string; role: 'student' | 'tutor'; first_name?: string; last_name?: string }) => {
    await registerUser(input)
    await login(input.email, input.password)
  }, [login])

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
    setUser(null)
  }, [])

  const value = useMemo<AuthContextType>(() => ({ user, isLoading, login, register, logout }), [user, isLoading, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

