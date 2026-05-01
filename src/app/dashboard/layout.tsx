import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

/**
 * Dashboard Layout
 * M4 - Sidebar + Navbar shell, protected route wrapper
 * 
 * TODO: Add route protection (check auth session)
 * TODO: Render Sidebar and Navbar
 * TODO: Create responsive layout
 * TODO: Add loading states
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Check auth and redirect if not authenticated
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
