import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Subtle radial gradient overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(163,230,53,0.05) 0%, transparent 70%)",
        }}
      />

      {/* Top nav */}
      <nav className="relative z-10 px-6 py-4">
        <Link
          href="/"
          className="text-sm font-medium tracking-tight font-[family-name:var(--font-geist-mono)] text-primary hover:text-accent transition-colors duration-150"
        >
          Agentathon
        </Link>
      </nav>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center text-xs text-muted">
        Agentathon &middot; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
