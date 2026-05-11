/**
 * Auth Layout
 * Wrapper for login and register pages (without dashboard layout)
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
