import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getIcon } from "@/lib/icons";
import { slugify } from "@/lib/slug";
import type { Service } from "@/lib/validation";
import { Reveal } from "./Reveal";
import { SectionLabel } from "./SectionLabel";

export function Services({ data, basePath }: { data: Service[]; basePath: string }) {
  if (!data.length) return null;
  const featured = data.slice(0, 6);
  return (
    <section id="services" className="scroll-mt-20 border-y border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <Reveal>
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <SectionLabel>Services</SectionLabel>
              <h2 className="font-display text-4xl tracking-tight md:text-5xl">Everything your smile needs</h2>
            </div>
            <Link
              href={`${basePath}/services`}
              className="hidden items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-deep sm:inline-flex"
            >
              View all services <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((s, i) => {
            const Icon = getIcon(s.icon);
            return (
              <Reveal key={`${s.title}-${i}`} delay={i * 70}>
                <Link
                  href={`${basePath}/services#${slugify(s.title)}`}
                  className="lift-card group block h-full rounded-3xl bg-background p-6"
                >
                  <div
                    className={`mb-5 grid size-12 place-items-center rounded-2xl ${
                      i % 2 === 0 ? "bg-primary/15 text-primary-deep" : "bg-accent/15 text-accent"
                    }`}
                  >
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mb-1 font-display text-2xl tracking-tight">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Learn more <ArrowRight className="size-3.5" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
        {data.length > 6 && (
          <Reveal delay={120}>
            <div className="mt-10 rounded-3xl bg-background p-6 ring-1 ring-border">
              <div className="mb-4 font-mono text-xs tracking-widest text-muted-foreground">ALL TREATMENTS WE OFFER</div>
              <div className="flex flex-wrap gap-2">
                {data.map((s, i) => (
                  <Link
                    key={`${s.title}-${i}`}
                    href={`${basePath}/services#${slugify(s.title)}`}
                    className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border transition-colors hover:text-primary hover:ring-primary/40"
                  >
                    {s.title}
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        )}
        <Link
          href={`${basePath}/services`}
          className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-primary sm:hidden"
        >
          View all services <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
