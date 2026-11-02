import Link from "next/link";

import { resolveDemo } from "@/lib/defaults";
import { slugify } from "@/lib/slug";
import type { Demo } from "@/lib/validation";
import { telLink, whatsappLink } from "@/lib/whatsapp";
import { btnOutlineLight, btnPrimary, container, eyebrowLight, textLink } from "./ui";

/** Detailed treatments page (/demo/[slug]/services) — same template for every demo. */
export function ServicesPageTemplate({ demo, basePath }: { demo: Demo; basePath: string }) {
  const d = resolveDemo(demo);
  return (
    <>
      <section className="border-b border-border bg-paper">
        <div className={`${container} py-14 md:py-20`}>
          <nav aria-label="Breadcrumb" className="text-[13px] text-muted-foreground">
            <Link href={basePath} className="hover:text-foreground">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Treatments</span>
          </nav>
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            <h1 className="text-[clamp(2.6rem,6vw,4.5rem)] leading-[1.02] lg:col-span-7">Treatments at {d.businessName}</h1>
            <p className="self-end text-[17px] leading-relaxed text-muted-foreground lg:col-span-5">
              What each treatment involves, how long it takes and what to expect afterwards. Not sure what you need? Book a
              check-up and we&apos;ll explain your options.
            </p>
          </div>
        </div>
      </section>

      <div className={`${container} grid gap-12 py-16 md:py-20 lg:grid-cols-12`}>
        {/* Index */}
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-32">
            <p className="text-[12px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {d.services.length} treatments
            </p>
            <ol className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-0 lg:overflow-visible lg:border-t lg:border-border lg:pb-0">
              {d.services.map((s, i) => (
                <li key={`${s.title}-${i}`} className="shrink-0 lg:border-b lg:border-border">
                  <a
                    href={`#${slugify(s.title)}`}
                    className="block rounded-[3px] border border-border px-3 py-2 text-sm whitespace-nowrap hover:border-foreground lg:rounded-none lg:border-0 lg:px-0 lg:py-3 lg:text-[15px] lg:whitespace-normal lg:hover:text-primary-deep"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        {/* Detail blocks */}
        <div className="lg:col-span-9">
          {d.services.map((s, i) => {
            const wa = whatsappLink(d.whatsapp, `Assalam o Alaikum, I'd like to ask about ${s.title} at ${d.businessName}.`);
            return (
              <article
                key={`${s.title}-${i}`}
                id={slugify(s.title)}
                className="scroll-mt-32 border-t border-foreground/80 pt-8 pb-14 first:pt-8"
              >
                <div className="grid gap-6 md:grid-cols-[4rem_1fr]">
                  <span className="font-serif text-xl text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h2 className="text-[clamp(1.9rem,3.2vw,2.6rem)] leading-tight">{s.title}</h2>
                    {s.description && <p className="mt-3 text-[18px] leading-relaxed text-foreground/80">{s.description}</p>}
                    {s.details && s.details !== s.description && (
                      <div className="mt-6 max-w-[68ch] space-y-4 text-[16px] leading-relaxed text-muted-foreground">
                        {s.details.split(/\n{2,}/).map((p, j) => (
                          <p key={j}>{p}</p>
                        ))}
                      </div>
                    )}
                    <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
                      {wa ? (
                        <a href={wa} target="_blank" rel="noreferrer" className={btnPrimary}>
                          Ask about {s.title.length > 26 ? "this treatment" : s.title}
                        </a>
                      ) : (
                        <a href={telLink(d.phone)} className={btnPrimary}>
                          Call {d.phone}
                        </a>
                      )}
                      <Link href={`${basePath}#book`} className={textLink}>
                        Book a consultation
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
          {d.services.length === 0 && (
            <p className="text-muted-foreground">Call {d.phone} to ask about any treatment.</p>
          )}
        </div>
      </div>

      <section className="bg-ink text-ink-foreground">
        <div className={`${container} flex flex-col items-start justify-between gap-8 py-16 md:flex-row md:items-center`}>
          <div>
            <p className={eyebrowLight}>Not sure what you need?</p>
            <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] leading-tight text-white">Start with a check-up.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`${basePath}#book`} className={btnPrimary}>
              {d.ctaText}
            </Link>
            <a href={telLink(d.phone)} className={btnOutlineLight}>
              {d.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
