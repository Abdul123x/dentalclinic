"use client";

import Link from "next/link";
import { useState } from "react";
import { Clock, MapPin, Menu, MessageCircle, Phone, X } from "lucide-react";

import type { ResolvedDemo } from "@/lib/defaults";
import { telLink, whatsappLink } from "@/lib/whatsapp";
import { Logo } from "./Logo";
import { btnPrimary, container } from "./ui";

export function Navbar({ demo, basePath }: { demo: ResolvedDemo; basePath: string }) {
  const [open, setOpen] = useState(false);
  const wa = whatsappLink(demo.whatsapp);
  const links = [
    { label: "Treatments", href: `${basePath}/services` },
    { label: "About", href: `${basePath}#about` },
    ...(demo.doctorName ? [{ label: "Our dentist", href: `${basePath}#doctor` }] : []),
    { label: "Reviews", href: `${basePath}#reviews` },
    { label: "Contact", href: `${basePath}#contact` },
  ];
  return (
    <>
      {/* Utility bar — what real clinic sites lead with: hours, location, phone */}
      <div className="hidden bg-ink text-[13px] text-ink-foreground/80 md:block">
        <div className={`${container} flex h-10 items-center gap-6`}>
          {demo.openingHours && (
            <span className="flex shrink-0 items-center gap-2 whitespace-nowrap">
              <Clock className="size-3.5 text-ink-foreground/50" /> {demo.openingHours}
            </span>
          )}
          {demo.address && (
            <span className="hidden min-w-0 items-center gap-2 lg:flex">
              <MapPin className="size-3.5 shrink-0 text-ink-foreground/50" />
              <span className="truncate">{demo.address.split("\n")[0]}</span>
            </span>
          )}
          <span className="ml-auto flex shrink-0 items-center gap-5">
            {wa && (
              <a href={wa} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white">
                <MessageCircle className="size-3.5" /> WhatsApp
              </a>
            )}
            <a href={telLink(demo.phone)} className="flex items-center gap-1.5 font-semibold text-white">
              <Phone className="size-3.5" /> {demo.phone}
            </a>
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className={`${container} flex h-[76px] items-center justify-between gap-6`}>
          <Link href={basePath} className="min-w-0">
            <Logo demo={demo} />
          </Link>
          <nav className="hidden items-center gap-8 text-[15px] font-medium text-foreground/75 lg:flex">
            {links.map((l) => (
              <Link key={l.label} href={l.href} className="transition-colors hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden md:block">
              <Link href={`${basePath}#book`} className={btnPrimary}>
                {demo.ctaText}
              </Link>
            </span>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={open}
              className="grid size-11 place-items-center border border-border lg:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-border bg-background lg:hidden">
            <div className={`${container} py-2`}>
              {links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-border py-4 font-serif text-2xl last:border-0"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}

/** Fixed bottom bar on phones: the three actions patients actually want. */
export function MobileActionBar({ demo, basePath }: { demo: ResolvedDemo; basePath: string }) {
  const wa = whatsappLink(demo.whatsapp, `Assalam o Alaikum, I'd like to book an appointment at ${demo.businessName}.`);
  const item = "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[12px] font-semibold";
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-background/97 backdrop-blur md:hidden">
      <a href={telLink(demo.phone)} className={item}>
        <Phone className="size-5" /> Call
      </a>
      {wa && (
        <a href={wa} target="_blank" rel="noreferrer" className={`${item} border-l border-border`}>
          <MessageCircle className="size-5" /> WhatsApp
        </a>
      )}
      <Link href={`${basePath}#book`} className={`${item} bg-primary text-primary-foreground`}>
        <span className="text-[15px] leading-5">Book</span>
        <span className="font-normal opacity-80">appointment</span>
      </Link>
    </div>
  );
}
