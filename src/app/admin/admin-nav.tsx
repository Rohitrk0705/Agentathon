"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Settings,
  Users,
  Trophy,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/tracks", label: "Tracks", icon: Layers },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/teams", label: "Teams", icon: Users },
  { href: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="overflow-x-auto whitespace-nowrap border-t border-border-subtle/60 bg-background/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl gap-1 px-4 sm:px-6">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "text-primary"
                  : "text-secondary hover:text-primary hover:bg-surface-hover/50"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-accent" : "text-muted"}`} />
              <span>{link.label}</span>
              {isActive ? (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full" />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
