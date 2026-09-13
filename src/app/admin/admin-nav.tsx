"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/tracks", label: "Tracks" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/teams", label: "Teams" },
  { href: "/admin/leaderboard", label: "Leaderboard" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="overflow-x-auto whitespace-nowrap border-b border-border-subtle bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl gap-0 px-4 md:px-6">
        {links.map((link) => {
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-4 py-3 text-sm transition-colors duration-150 ${
                isActive
                  ? "text-primary font-medium"
                  : "text-secondary hover:text-primary"
              }`}
            >
              {link.label}
              {isActive ? (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-accent rounded-full" />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
