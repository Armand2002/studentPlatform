// Custom hook for analytics data management
'use client'
import { useState, useEffect, useCallback } from 'react'
import { 
  analyticsService, 
  StudentAnalytics, 
  TutorAnalytics, 
  AdminAnalytics, 
  DashboardOverview 
} from '@/lib/api-services'

export type TimeframeType = 'week' | 'month' | 'quarter' | 'year'

export interface UseAnalyticsOptions {
  userType?: 'student' | 'tutor' | 'admin'
  timeframe?: TimeframeType
  autoFetch?: boolean
  pollInterval?: number
}

export interface UseAnalyticsReturn {
  analytics: StudentAnalytics | TutorAnalytics | AdminAnalytics | null
  dashboardOverview: DashboardOverview | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchAnalytics: (timeframe?: TimeframeType) => Promise<void>
  fetchDashboardOverview: () => Promise<void>
  refreshAnalytics: () => Promise<void>
  
  // State management
  clearError: () => void
  setTimeframe: (timeframe: TimeframeType) => void
  timeframe: TimeframeType
}

export const useAnalytics = (options: UseAnalyticsOptions = {}): UseAnalyticsReturn => {
  const { 
    userType = 'student', 
    timeframe: initialTimeframe = 'month', 
    autoFetch = true, 
    pollInterval 
  } = options
  
  const [analytics, setAnalytics] = useState<StudentAnalytics | TutorAnalytics | AdminAnalytics | null>(null)
  const [dashboardOverview, setDashboardOverview] = useState<DashboardOverview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState(initialTimeframe)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const fetchAnalytics = useCallback(async (newTimeframe?: TimeframeType) => {
    try {
      setLoading(true)
      setError(null)
      
      const timeframeToUse = newTimeframe || timeframe
      let response
      
      switch (userType) {
        case 'student':
          response = await analyticsService.getStudentAnalytics(timeframeToUse as any)
          break
        case 'tutor':
          response = await analyticsService.getTutorAnalytics(timeframeToUse as any)
          break
        case 'admin':
          response = await analyticsService.getAdminAnalytics(timeframeToUse as any)
          break
        default:
          throw new Error('Invalid user type')
      }
      
      setAnalytics(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [userType, timeframe])

  const fetchDashboardOverview = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await analyticsService.getDashboardOverview()
      setDashboardOverview(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshAnalytics = useCallback(async () => {
    await Promise.all([
      fetchAnalytics(),
      fetchDashboardOverview()
    ])
  }, [fetchAnalytics, fetchDashboardOverview])

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchAnalytics()
      fetchDashboardOverview()
    }
  }, [autoFetch, fetchAnalytics, fetchDashboardOverview])

  // Polling for real-time updates
  useEffect(() => {
    if (pollInterval && pollInterval > 0) {
      const interval = setInterval(() => {
        refreshAnalytics()
      }, pollInterval)

      return () => clearInterval(interval)
    }
  }, [pollInterval, refreshAnalytics])

  return {
    analytics,
    dashboardOverview,
    loading,
    error,
    fetchAnalytics,
    fetchDashboardOverview,
    refreshAnalytics,
    clearError,
    setTimeframe,
    timeframe
  }
}

// Hook for learning progress
export const useLearningProgress = (subjectId?: string) => {
  const [progressData, setProgressData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await analyticsService.getLearningProgress(subjectId)
      setProgressData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [subjectId])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  return {
    progressData,
    loading,
    error,
    refetch: fetchProgress,
    clearError: () => setError(null)
  }
}

// Hook for performance trends
export const usePerformanceTrends = (metric: 'attendance' | 'completion' | 'rating' | 'hours') => {
  const [trendsData, setTrendsData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTrends = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await analyticsService.getPerformanceTrends(metric)
      setTrendsData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [metric])

  useEffect(() => {
    fetchTrends()
  }, [fetchTrends])

  return {
    trendsData,
    loading,
    error,
    refetch: fetchTrends,
    clearError: () => setError(null)
  }
}

// Hook for revenue analytics (tutor/admin only)
export const useRevenueAnalytics = (timeframe?: string) => {
  const [revenueData, setRevenueData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRevenue = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await analyticsService.getRevenueAnalytics(timeframe)
      setRevenueData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [timeframe])

  useEffect(() => {
    fetchRevenue()
  }, [fetchRevenue])

  return {
    revenueData,
    loading,
    error,
    refetch: fetchRevenue,
    clearError: () => setError(null)
  }
}
