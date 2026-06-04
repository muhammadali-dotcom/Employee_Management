import { redirect } from 'next/navigation';

// Root path redirects to /login.
// RouteGuard will then forward logged-in users to their role-appropriate home.
export default function Home() {
  redirect('/login');
}
