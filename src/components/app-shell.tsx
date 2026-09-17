import Link from "next/link";
import { LogOut, Bot, Shield, User } from "lucide-react";

export function AppShell({
  user,
  role,
  nav,
  children,
}: {
  user?: { email?: string | null };
  role?: "admin" | "participant";
  nav?: React.ReactNode;
  children: React.ReactNode;
}) {
  const homeHref = role === "admin" ? "/admin" : "/dashboard";

  return (
    <div className="min-h-screen flex flex-col bg-background text-primary">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 h-14">
          {/* Brand Logo */}
          <Link
            href={homeHref}
            className="flex items-center gap-2.5 font-mono text-sm font-semibold tracking-tight text-primary hover:text-accent transition-colors duration-150 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated border border-border-subtle group-hover:border-accent/40 group-hover:bg-accent-muted transition-all">
              <Bot className="h-4 w-4 text-accent" />
            </div>
            <span className="font-semibold tracking-normal text-base">Agentathon</span>
            {role === "admin" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-muted border border-accent/30 px-2 py-0.5 text-[10px] font-semibold text-accent uppercase tracking-wider">
                <Shield className="h-2.5 w-2.5" />
                Admin
              </span>
            ) : null}
          </Link>

          {/* User profile & actions */}
          <div className="flex items-center gap-3">
            {user?.email ? (
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-3 py-1 text-xs text-secondary">
                <User className="h-3 w-3 text-muted" />
                <span className="max-w-[200px] truncate">{user.email}</span>
              </div>
            ) : null}

            <form action="/logout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-secondary hover:text-primary hover:bg-surface-hover hover:border-border-strong transition-colors duration-150 cursor-pointer"
                title="Sign out of your account"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>

        {/* Subnav slot (e.g., Admin tabs) */}
        {nav}
      </header>

      {/* Main Page Content */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 md:py-8">
        {children}
      </main>

      {/* Subtle modern footer */}
      <footer className="border-t border-border-subtle/50 py-6 text-center text-xs text-muted">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span>Platform operational</span>
          </div>
          <p>© {new Date().getFullYear()} Agentathon. Built for autonomous systems.</p>
        </div>
      </footer>
    </div>
  );
}
