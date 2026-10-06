"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Copy, CopyPlus, Eye, Globe, GlobeLock, Pencil, Trash2 } from "lucide-react";

import { deleteDemoAction, duplicateDemoAction, setPublishedAction } from "@/lib/actions";
import type { DemoListItem } from "@/lib/demo-service";

export function publicUrl(siteUrl: string, slug: string) {
  const base = (siteUrl || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "");
  return `${base}/demo/${slug}`;
}

export function CopyUrlButton({ slug, siteUrl, compact = false }: { slug: string; siteUrl: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    const url = publicUrl(siteUrl, slug);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this URL:", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button
      type="button"
      onClick={copy}
      title="Copy public URL"
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1 ring-border hover:bg-muted"
    >
      {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
      {!compact && (copied ? "Copied" : "Copy URL")}
    </button>
  );
}

function RowActions({ demo, siteUrl }: { demo: DemoListItem; siteUrl: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, after?: (r: never) => void) =>
    start(async () => {
      setError("");
      const r = await fn();
      if (!r.ok) setError(r.error ?? "Failed");
      else {
        after?.(r as never);
        router.refresh();
      }
    });

  const btn =
    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1 ring-border hover:bg-muted disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <a href={`/admin/preview/${demo.id}`} target="_blank" rel="noreferrer" className={btn} title="Preview">
        <Eye className="size-3.5" /> <span className="hidden lg:inline">Preview</span>
      </a>
      <Link href={`/admin/demos/${demo.id}/edit`} className={btn} title="Edit">
        <Pencil className="size-3.5" /> <span className="hidden lg:inline">Edit</span>
      </Link>
      <CopyUrlButton slug={demo.slug} siteUrl={siteUrl} compact />
      <button
        type="button"
        disabled={pending}
        className={btn}
        title="Duplicate"
        onClick={() =>
          run(
            () => duplicateDemoAction(demo.id),
            (r: { id: string }) => router.push(`/admin/demos/${r.id}/edit`),
          )
        }
      >
        <CopyPlus className="size-3.5" /> <span className="hidden lg:inline">Duplicate</span>
      </button>
      <button
        type="button"
        disabled={pending}
        className={btn}
        title={demo.isPublished ? "Unpublish" : "Publish"}
        onClick={() => run(() => setPublishedAction(demo.id, !demo.isPublished))}
      >
        {demo.isPublished ? <GlobeLock className="size-3.5" /> : <Globe className="size-3.5" />}
        <span className="hidden lg:inline">{demo.isPublished ? "Unpublish" : "Publish"}</span>
      </button>
      <button
        type="button"
        disabled={pending}
        className={`${btn} text-destructive`}
        title="Delete"
        onClick={() => {
          if (window.confirm(`Delete "${demo.businessName}"? Its URL /demo/${demo.slug} will stop working. This cannot be undone.`)) {
            run(() => deleteDemoAction(demo.id));
          }
        }}
      >
        <Trash2 className="size-3.5" />
      </button>
      {error && <span className="w-full text-right text-xs text-destructive">{error}</span>}
    </div>
  );
}

export function DemosTable({ demos, siteUrl }: { demos: DemoListItem[]; siteUrl: string }) {
  if (!demos.length) {
    return (
      <div className="rounded-2xl bg-surface p-10 text-center ring-1 ring-border">
        <p className="text-muted-foreground">No demos yet.</p>
        <Link href="/admin/demos/new" className="mt-3 inline-block font-semibold text-primary">
          Create your first demo →
        </Link>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
      <ul className="divide-y divide-border">
        {demos.map((d) => (
          <li key={d.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {d.logo ? (
                <img src={d.logo} alt="" className="size-10 shrink-0 rounded-xl object-contain ring-1 ring-border" />
              ) : (
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-xl font-display text-lg text-white"
                  style={{ background: d.primaryColor }}
                >
                  {d.businessName.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/admin/demos/${d.id}/edit`} className="truncate font-semibold hover:text-primary">
                    {d.businessName}
                  </Link>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                      d.isPublished ? "bg-primary/15 text-primary-deep" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {d.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="truncate font-mono text-xs text-muted-foreground">
                  /demo/{d.slug}
                  {d.city ? ` · ${d.city}` : ""} · updated {new Date(d.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <RowActions demo={d} siteUrl={siteUrl} />
          </li>
        ))}
      </ul>
    </div>
  );
}
