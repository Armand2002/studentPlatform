import { redirect } from 'next/navigation';

export default function Page() {
  // Server-side redirect to the new unified analytics page.
  redirect('/dashboard/admin/analytics');
}
