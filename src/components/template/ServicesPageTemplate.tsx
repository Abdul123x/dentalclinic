import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";

import { resolveDemo } from "@/lib/defaults";
import { getIcon } from "@/lib/icons";
import { slugify } from "@/lib/slug";
import type { Demo } from "@/lib/validation";
import { telLink, whatsappLink } from "@/lib/whatsapp";
import { Reveal } from "./Reveal";

/** Detailed services page (/demo/[slug]/services) — same template for every demo. */
export function ServicesPageTemplate({ demo, basePath }: { demo: Demo; basePath: string }) {
  const d = resolveDemo(demo);
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-14 pb-10">
        <div className="animate-rise">
          <div className="mb-3 font-mono text-xs tracking-widest text-primary">
            OUR SERVICES · {d.services.length} TREATMENTS
          </div>
          <h1 className="max-w-4xl text-balance font-display text-[clamp(3rem,8vw,6rem)] leading-[0.9] tracking-tight">
            Every treatment, <span className="text-primary">explained.</span>
          </h1>
          <p className="mt-5 max-w-[60ch] text-pretty text-lg text-muted-foreground">
            What each treatment at {d.businessName} involves — so you can decide with confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {d.services.map((s, i) => {
              const Icon = getIcon(s.icon);
              return (
                <a
                  key={`${s.title}-${i}`}
                  href={`#${slugify(s.title)}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border transition-colors hover:text-primary hover:ring-primary/40"
                >
                  <Icon className="size-3.5" /> {s.title}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-5 px-5 pb-16">
        {d.services.map((s, i) => {
          const Icon = getIcon(s.icon);
          const wa = whatsappLink(d.whatsapp, `Assalam o Alaikum, I'd like to ask about ${s.title} at ${d.businessName}.`);
          return (
            <Reveal key={`${s.title}-${i}`}>
              <article id={slugify(s.title)} className="scroll-mt-24 rounded-[28px] bg-surface p-6 ring-1 ring-border md:p-8">
                <div className="grid gap-6 md:grid-cols-12">
                  <div className="md:col-span-4">
                    <div
                      className={`mb-5 grid size-14 place-items-center rounded-2xl ${
                        i % 2 === 0 ? "bg-primary/15 text-primary-deep" : "bg-accent/15 text-accent"
                      }`}
                    >
                      <Icon className="size-7" />
                    </div>
                    <h2 className="font-display text-3xl tracking-tight md:text-4xl">{s.title}</h2>
                    <p className="mt-2 text-sm font-medium text-primary-deep">{s.description}</p>
                  </div>
                  <div className="md:col-span-8">
                    <div className="space-y-3 text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
                      {(s.details || s.description).split(/\n{2,}/).map((p, j) => (
                        <p key={j}>{p}</p>
                      ))}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {wa && (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90"
                        >
                          <MessageCircle className="size-4" /> Ask / Book
                        </a>
                      )}
                      <a
                        href={telLink(d.phone)}
                        className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-3 text-sm font-semibold ring-1 ring-border hover:ring-foreground/30"
                      >
                        <Phone className="size-4" /> Call
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
        {d.services.length === 0 && (
          <p className="rounded-3xl bg-surface p-10 text-center text-muted-foreground ring-1 ring-border">
            Services coming soon. Call {d.phone} to ask about any treatment.
          </p>
        )}
      </div>

      <section className="bg-foreground text-background">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-14 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-4xl tracking-tight md:text-5xl">Not sure what you need?</h2>
            <p className="mt-2 text-background/70">Book a check-up and we&apos;ll explain your options — no pressure.</p>
          </div>
          <Link href={`${basePath}#book`} className="rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground hover:bg-primary-deep">
            {d.ctaText}
          </Link>
        </div>
      </section>
    </>
  );
}
