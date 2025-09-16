import { redirect } from 'next/navigation'

export default function Page() {
  // Redirect to the packages management page
  redirect('/dashboard/admin/packages')
}
