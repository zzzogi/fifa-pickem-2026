// app/(dashboard)/layout.tsx
import { authOptions } from "@/auth";
import MobileNav from "@/components/layout/mobile-nav";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/");

  return (
    <div className="app-shell min-h-screen">
      <Sidebar />
      <Topbar userName={session.user?.name} />

      <main>
        <div className="lg:pl-[var(--sidebar-width)]">
          <div className="px-4 py-6 lg:px-8 lg:py-8">{children}</div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
