"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Phone, X } from "lucide-react";

import type { ResolvedDemo } from "@/lib/defaults";
import { telLink } from "@/lib/whatsapp";
import { Logo } from "./Logo";

export function Navbar({ demo, basePath }: { demo: ResolvedDemo; basePath: string }) {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Home", href: `${basePath}#top` },
    { label: "Services", href: `${basePath}/services` },
    { label: "About", href: `${basePath}#about` },
    { label: "Reviews", href: `${basePath}#reviews` },
    { label: "Contact", href: `${basePath}#contact` },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5">
        <Link href={`${basePath}#top`} className="min-w-0">
          <Logo demo={demo} />
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-foreground/80 md:flex">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className="transition-colors hover:text-primary">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={telLink(demo.phone)}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            <Phone className="size-4" />
            <span className="hidden sm:inline">{demo.phone}</span>
            <span className="sm:hidden">Call</span>
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className="grid size-10 place-items-center rounded-full ring-1 ring-border md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border bg-background px-5 py-3 md:hidden">
          {links.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="block py-2.5 text-base font-medium">
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
