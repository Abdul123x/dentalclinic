import Link from "next/link";
import { FileEdit, Globe, Layers, Plus } from "lucide-react";

import { DemosTable } from "@/components/admin/DemosTable";
import { getDemoStats, listDemos } from "@/lib/demo-service";

export const metadata = { title: "Dashboard — Dental Demos" };

export default async function Dashboard() {
  const [stats, recent] = await Promise.all([getDemoStats(), listDemos()]);
  const cards = [
    { label: "Total demos", value: stats.total, icon: Layers, href: "/admin/demos" },
    { label: "Published", value: stats.published, icon: Globe, href: "/admin/demos?status=published" },
    { label: "Drafts", value: stats.drafts, icon: FileEdit, href: "/admin/demos?status=draft" },
  ];
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">One template, many clinics. Create a demo and send the link.</p>
        </div>
        <Link
          href="/admin/demos/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
        >
          <Plus className="size-4" /> Create demo
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-2xl bg-surface p-5 ring-1 ring-border transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm font-medium">{c.label}</span>
              <c.icon className="size-4" />
            </div>
            <div className="mt-2 font-display text-4xl">{c.value}</div>
          </Link>
        ))}
      </div>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Recently edited</h2>
          <Link href="/admin/demos" className="text-sm font-semibold text-primary">
            View all →
          </Link>
        </div>
        <DemosTable demos={recent.slice(0, 8)} siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? ""} />
      </div>
    </div>
  );
}
