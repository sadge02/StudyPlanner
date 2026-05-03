/**
 * Login Page
 * M1 - Auth logic | M4 - Page styling
 * 
 * TODO: Create login form component
 * TODO: Implement email/password login
 * TODO: Add OAuth provider buttons (Google, GitHub)
 * TODO: Add "Sign up" link
 * TODO: Handle loading and error states
 * TODO: Style with Tailwind/shadcn UI
 */

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex w-full min-h-screen items-center justify-center p-4 bg-slate-50">
      <LoginForm />
    </div>
  );
}
