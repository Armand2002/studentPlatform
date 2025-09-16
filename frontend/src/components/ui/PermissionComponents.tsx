/**
 * ✅ CLEANUP: Centralized Permission UI Components  
 * Eliminates duplicate role icons, badges, and access denied UI
 */
import React from 'react'
import { 
  UsersIcon,
  AcademicCapIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { UserRole, UserStatus, getRoleBadgeClasses, getRoleLabel, getStatusBadgeClasses, getStatusLabel } from '@/lib/permissions'

// ✅ CLEANUP: Centralized role icon component (replaces 7+ duplicate functions)
export const RoleIcon = ({ role, className = "h-4 w-4" }: { role: UserRole; className?: string }) => {
  switch (role) {
    case 'student':
      return <UsersIcon className={`${className} text-blue-500`} />
    case 'tutor':
      return <AcademicCapIcon className={`${className} text-green-500`} />
    case 'admin':
      return <ShieldCheckIcon className={`${className} text-purple-500`} />
    default:
      return <UsersIcon className={`${className} text-gray-500`} />
  }
}

// ✅ CLEANUP: Centralized role badge component (replaces 6+ duplicate implementations)
export const RoleBadge = ({ role, className = "" }: { role: UserRole; className?: string }) => {
  return (
    <span className={`${getRoleBadgeClasses(role)} ${className}`}>
      {getRoleLabel(role)}
    </span>
  )
}

// ✅ CLEANUP: Centralized status badge component (replaces 5+ duplicate implementations)
export const StatusBadge = ({ status, className = "" }: { status: UserStatus; className?: string }) => {
  return (
    <span className={`${getStatusBadgeClasses(status)} ${className}`}>
      {getStatusLabel(status)}
    </span>
  )
}

// ✅ CLEANUP: Access denied component (replaces duplicate JSX in 5+ files)
export const AccessDenied = ({ 
  title = "Accesso Negato",
  message = "Non hai i permessi necessari per accedere a questa sezione."
}: {
  title?: string
  message?: string
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
)

// ✅ CLEANUP: Admin-only access component
export const AdminOnlyAccess = () => (
  <AccessDenied 
    title="Accesso Negato"
    message="Solo gli amministratori possono accedere a questa sezione."
  />
)
