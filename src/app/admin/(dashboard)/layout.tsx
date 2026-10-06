import Link from "next/link";
import { LayoutDashboard, List, LogOut, Plus } from "lucide-react";

import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const nav = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/demos", label: "All demos", icon: List },
    { href: "/admin/demos/new", label: "Create demo", icon: Plus },
  ];
  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary font-display text-primary-foreground">D</span>
            <span className="font-display text-lg tracking-tight">DENTAL DEMOS</span>
          </Link>
          <nav className="ml-4 hidden items-center gap-1 sm:flex">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <n.icon className="size-4" /> {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground md:inline">{session.email}</span>
            <form action={logoutAction}>
              <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground ring-1 ring-border hover:text-foreground">
                <LogOut className="size-4" /> <span className="hidden sm:inline">Log out</span>
              </button>
            </form>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 sm:hidden">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground ring-1 ring-border">
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
    </div>
  );
}
