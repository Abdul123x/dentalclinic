import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { DemosTable } from "@/components/admin/DemosTable";
import { listDemos } from "@/lib/demo-service";

export const metadata = { title: "All demos — Dental Demos" };

type SP = Promise<{ q?: string; status?: string }>;

export default async function DemosPage({ searchParams }: { searchParams: SP }) {
  const { q = "", status: s } = await searchParams;
  const status = s === "published" || s === "draft" ? s : "all";
  const demos = await listDemos({ q, status });
  const tabs = [
    { key: "all", label: "All" },
    { key: "published", label: "Published" },
    { key: "draft", label: "Drafts" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl tracking-tight">All demos</h1>
        <Link
          href="/admin/demos/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
        >
          <Plus className="size-4" /> Create demo
        </Link>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex gap-1 rounded-full bg-surface p-1 ring-1 ring-border">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={{ pathname: "/admin/demos", query: { ...(q ? { q } : {}), ...(t.key !== "all" ? { status: t.key } : {}) } }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                status === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <form className="relative flex-1 md:max-w-sm" action="/admin/demos">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, slug, city, phone…"
            className="w-full rounded-full bg-surface py-2.5 pr-4 pl-10 text-sm ring-1 ring-border outline-none focus:ring-2 focus:ring-primary"
          />
        </form>
      </div>
      <p className="text-sm text-muted-foreground">
        {demos.length} demo{demos.length === 1 ? "" : "s"}
        {q ? ` matching “${q}”` : ""}
      </p>
      <DemosTable demos={demos} siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? ""} />
    </div>
  );
}
