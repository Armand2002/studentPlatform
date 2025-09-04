// Custom hook for package data management
'use client'
import { useState, useEffect, useCallback } from 'react'
import { packageService, PackageData, UserPackageData, PackageFilters } from '@/lib/api-services'

export interface UsePackagesOptions {
  initialFilters?: PackageFilters
  autoFetch?: boolean
  pollInterval?: number
}

export interface UsePackagesReturn {
  packages: PackageData[]
  userPackages: UserPackageData[]
  loading: boolean
  error: string | null
  total: number
  
  // Actions
  fetchPackages: (filters?: PackageFilters) => Promise<void>
  fetchUserPackages: () => Promise<void>
  purchasePackage: (packageId: string, paymentMethodId?: string) => Promise<UserPackageData | null>
  refreshPackages: () => Promise<void>
  refreshUserPackages: () => Promise<void>
  
  // State management
  clearError: () => void
  setFilters: (filters: PackageFilters) => void
  filters: PackageFilters
}

export const usePackages = (options: UsePackagesOptions = {}): UsePackagesReturn => {
  const { initialFilters = {}, autoFetch = true, pollInterval } = options
  
  const [packages, setPackages] = useState<PackageData[]>([])
  const [userPackages, setUserPackages] = useState<UserPackageData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<PackageFilters>(initialFilters)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const fetchPackages = useCallback(async (newFilters?: PackageFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const filtersToUse = newFilters || filters
      const response = await packageService.getPackages(filtersToUse)
      
      setPackages(response.data)
      setTotal(response.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const fetchUserPackages = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await packageService.getUserPackages()
      setUserPackages(response) // response is already the array, no .data needed
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const purchasePackage = useCallback(async (packageId: string, paymentMethodId?: string): Promise<UserPackageData | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await packageService.purchasePackage(packageId, paymentMethodId)
      
      // Refresh user packages list
      await fetchUserPackages()
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchUserPackages])

  const refreshPackages = useCallback(async () => {
    await fetchPackages()
  }, [fetchPackages])

  const refreshUserPackages = useCallback(async () => {
    await fetchUserPackages()
  }, [fetchUserPackages])

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    if (autoFetch) {
      fetchPackages()
      fetchUserPackages()
    }
  }, [autoFetch, fetchPackages, fetchUserPackages])

  // Polling for real-time updates
  useEffect(() => {
    if (pollInterval && pollInterval > 0) {
      const interval = setInterval(() => {
        fetchPackages()
        fetchUserPackages()
      }, pollInterval)

      return () => clearInterval(interval)
    }
  }, [pollInterval, fetchPackages, fetchUserPackages])

  return {
    packages,
    userPackages,
    loading,
    error,
    total,
    fetchPackages,
    fetchUserPackages,
    purchasePackage,
    refreshPackages,
    refreshUserPackages,
    clearError,
    setFilters,
    filters
  }
}

// Hook for single package
export const usePackage = (packageId: string) => {
  const [packageData, setPackageData] = useState<PackageData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPackage = useCallback(async () => {
    if (!packageId) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await packageService.getPackage(packageId)
      setPackageData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [packageId])

  useEffect(() => {
    fetchPackage()
  }, [fetchPackage])

  return {
    packageData,
    loading,
    error,
    refetch: fetchPackage,
    clearError: () => setError(null)
  }
}

// Hook for popular packages (as alternative to recommendations)
export const usePopularPackages = () => {
  const [popularPackages, setPopularPackages] = useState<PackageData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPopularPackages = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use getPackages with a filter for popular packages
      const response = await packageService.getPackages({ isActive: true })
      // Take first few packages as popular (can be enhanced with actual popularity logic)
      setPopularPackages(response.data.slice(0, 6))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPopularPackages()
  }, [fetchPopularPackages])

  return {
    popularPackages,
    loading,
    error,
    refetch: fetchPopularPackages,
    clearError: () => setError(null)
  }
}
