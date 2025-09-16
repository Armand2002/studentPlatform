import { redirect } from 'next/navigation'

export default function ApprovalsRedirect() {
  // Server-side redirect to unified user management page
  redirect('/dashboard/admin/user-management')
}
