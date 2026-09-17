import Link from "next/link";
import { Bot, ArrowRight } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-primary selection:bg-accent-muted selection:text-accent">
      {/* Subtle radial ambient glow at top */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-25 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgba(132, 204, 22, 0.4) 0%, rgba(14, 165, 233, 0.2) 50%, transparent 75%)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a08_1px,transparent_1px),linear-gradient(to_bottom,#27272a08_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-20 border-b border-border-subtle/70 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 h-16">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-mono text-sm font-semibold tracking-tight text-primary hover:text-accent transition-colors duration-150 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated border border-border-subtle group-hover:border-accent/40 group-hover:bg-accent-muted transition-all">
              <Bot className="h-4 w-4 text-accent" />
            </div>
            <span className="font-semibold tracking-normal text-base">Agentathon</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="inline-flex items-center rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium text-secondary hover:text-primary hover:bg-surface transition-colors duration-150"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-accent-text hover:bg-accent-hover active:brightness-95 transition-all duration-150 shadow-sm"
            >
              <span>Register</span>
              <ArrowRight className="h-3.5 w-3.5 hidden xs:inline" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main content slot */}
      <main className="relative z-10 flex flex-1 flex-col justify-center">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border-subtle/50 py-8 text-center text-xs text-muted">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span>Submissions & Judging Engine Active</span>
          </div>
          <p>© {new Date().getFullYear()} Agentathon. Built for autonomous systems.</p>
        </div>
      </footer>
    </div>
  );
}
