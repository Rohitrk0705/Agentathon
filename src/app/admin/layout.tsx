import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 md:px-6 py-3">
          <Link
            href="/admin"
            className="text-sm font-medium tracking-tight font-[family-name:var(--font-geist-mono)] text-primary hover:text-accent transition-colors duration-150"
          >
            Agentathon
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs text-muted">
              {user.email}
            </span>
            <form action="/logout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-transparent px-3 py-1.5 text-sm text-secondary hover:bg-surface-hover hover:text-primary transition-colors duration-150"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Secondary nav */}
      <AdminNav />

      {/* Main content */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 md:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
