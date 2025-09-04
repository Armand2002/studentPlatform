// Custom hook for booking data management
'use client'
import { useState, useEffect, useCallback } from 'react'
import { bookingService, BookingData, BookingFilters } from '@/lib/api-services'

export interface UseBookingsOptions {
  initialFilters?: BookingFilters
  autoFetch?: boolean
  pollInterval?: number
  userType?: 'student' | 'tutor'
}

export interface UseBookingsReturn {
  bookings: BookingData[]
  loading: boolean
  error: string | null
  total: number
  
  // Actions
  fetchBookings: (filters?: BookingFilters) => Promise<void>
  createBooking: (data: any) => Promise<BookingData | null>
  confirmBooking: (bookingId: string) => Promise<BookingData | null>
  cancelBooking: (bookingId: string, reason?: string) => Promise<BookingData | null>
  rescheduleBooking: (bookingId: string, newStartTime: string, newDuration?: number) => Promise<BookingData | null>
  refreshBookings: () => Promise<void>
  
  // State management
  clearError: () => void
  setFilters: (filters: BookingFilters) => void
  filters: BookingFilters
}

export const useBookings = (options: UseBookingsOptions = {}): UseBookingsReturn => {
  const { initialFilters = {}, autoFetch = true, pollInterval, userType = 'student' } = options
  
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<BookingFilters>(initialFilters)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const fetchBookings = useCallback(async (newFilters?: BookingFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const filtersToUse = newFilters || filters
      
      const response = userType === 'student' 
        ? await bookingService.getStudentBookings(filtersToUse)
        : await bookingService.getTutorBookings(filtersToUse)
      
      setBookings(response.data)
      setTotal(response.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [filters, userType])

  const createBooking = useCallback(async (data: any): Promise<BookingData | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await bookingService.createBooking(data)
      
      // Refresh bookings list
      await fetchBookings()
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchBookings])

  const confirmBooking = useCallback(async (bookingId: string): Promise<BookingData | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await bookingService.confirmBooking(bookingId)
      
      // Update booking in state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? response.data : booking
      ))
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const cancelBooking = useCallback(async (bookingId: string, reason?: string): Promise<BookingData | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await bookingService.cancelBooking(bookingId, reason)
      
      // Update booking in state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? response.data : booking
      ))
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const rescheduleBooking = useCallback(async (bookingId: string, newStartTime: string, newDuration?: number): Promise<BookingData | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await bookingService.rescheduleBooking(bookingId, newStartTime, newDuration)
      
      // Update booking in state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? response.data : booking
      ))
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshBookings = useCallback(async () => {
    await fetchBookings()
  }, [fetchBookings])

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    if (autoFetch) {
      fetchBookings()
    }
  }, [autoFetch, fetchBookings])

  // Polling for real-time updates
  useEffect(() => {
    if (pollInterval && pollInterval > 0) {
      const interval = setInterval(() => {
        fetchBookings()
      }, pollInterval)

      return () => clearInterval(interval)
    }
  }, [pollInterval, fetchBookings])

  return {
    bookings,
    loading,
    error,
    total,
    fetchBookings,
    createBooking,
    confirmBooking,
    cancelBooking,
    rescheduleBooking,
    refreshBookings,
    clearError,
    setFilters,
    filters
  }
}

// Hook for single booking
export const useBooking = (bookingId: string) => {
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBooking = useCallback(async () => {
    if (!bookingId) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await bookingService.getBooking(bookingId)
      setBooking(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  useEffect(() => {
    fetchBooking()
  }, [fetchBooking])

  return {
    booking,
    loading,
    error,
    refetch: fetchBooking,
    clearError: () => setError(null)
  }
}
