import { requireAdmin } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <AppShell user={user} role="admin" nav={<AdminNav />}>
      {children}
    </AppShell>
  );
}
