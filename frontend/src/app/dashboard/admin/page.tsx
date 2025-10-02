"use client"
import RequireAuth from '@/components/auth/RequireAuth'
import { useAuth } from '@/contexts/AuthContext'
import { canAccessAdmin } from '@/lib/permissions'
import { AdminOnlyAccess } from '@/components/ui/PermissionComponents'
import { PlatformMetrics } from '@/components/dashboard/admin/PlatformMetrics'
import { AdminAnalyticsChart } from '@/components/dashboard/admin/AdminAnalyticsChart'
import { UserManagementWidget } from '@/components/dashboard/admin/UserManagementWidget'
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
      {/* ✅ CLEANUP: Use centralized permission checking */}
      {canAccessAdmin(user?.role) ? (
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
          <div className="flex justify-center">
            <div className="w-full max-w-6xl">
              <AdminAnalyticsChart />
            </div>
          </div>

          {/* Management Section */}
          <div className="grid grid-cols-1 gap-6">
            <UserManagementWidget />
          </div>

          {/* Quick Actions */}
          <AdminQuickActionsWidget />
        </div>
      ) : (
        <AdminOnlyAccess />
      )}
    </RequireAuth>
  )
}
