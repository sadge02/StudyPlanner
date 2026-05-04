/**
 * Register Page
 * M1 - Auth logic | M4 - Page styling
 * 
 * TODO: Create registration form component
 * TODO: Implement email/password registration
 * TODO: Add password confirmation validation
 * TODO: Add email verification logic
 * TODO: Add "Already have account?" link
 * TODO: Handle loading and error states
 * TODO: Style with Tailwind/shadcn UI
 */

import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex w-full min-h-screen items-center justify-center p-4 bg-slate-50">
      <RegisterForm />
    </div>
  );
}
