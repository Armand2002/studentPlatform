"use client"
import RequireAuth from '@/components/auth/RequireAuth'
import { useAuth } from '@/contexts/AuthContext'
import { PlatformMetrics } from '@/components/dashboard/admin/PlatformMetrics'
import { AdminAnalyticsChart } from '@/components/dashboard/admin/AdminAnalyticsChart'
import { UserManagementWidget } from '@/components/dashboard/admin/UserManagementWidget'
import { SystemOverviewWidget } from '@/components/dashboard/admin/SystemOverviewWidget'
import { RevenueAnalyticsWidget } from '@/components/dashboard/admin/RevenueAnalyticsWidget'
import { AdminQuickActionsWidget } from '@/components/dashboard/admin/AdminQuickActionsWidget'
import { useEffect } from 'react'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  
  // Clear service workers on component mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          console.log('Unregistering service worker:', registration);
          registration.unregister();
        }
      });
    }
    
    if ('caches' in window) {
      caches.keys().then(function(names) {
        for (let name of names) {
          console.log('Deleting cache:', name);
          caches.delete(name);
        }
      });
    }
  }, [])
  
  return (
    <RequireAuth>
      {user?.role === 'admin' ? (
        <div className="space-y-6">
          {/* Welcome section */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-xl p-6 border border-primary/20">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Dashboard Admin
            </h1>
            <p className="text-foreground-secondary text-lg">
              Gestisci la piattaforma, monitora le performance e supervisiona gli utenti.
            </p>
          </div>

          {/* Platform Metrics Row */}
          <PlatformMetrics />

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AdminAnalyticsChart />
            </div>
            <div className="lg:col-span-1">
              <RevenueAnalyticsWidget />
            </div>
          </div>

          {/* Management Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserManagementWidget />
            <SystemOverviewWidget />
          </div>

          {/* Quick Actions */}
          <AdminQuickActionsWidget />
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Accesso Negato</h1>
            <p className="text-gray-600">Solo gli amministratori possono accedere a questa sezione.</p>
          </div>
        </div>
      )}
    </RequireAuth>
  )
}
