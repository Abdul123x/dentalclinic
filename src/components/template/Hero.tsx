import { Clock, Star } from "lucide-react";

import type { ResolvedDemo } from "@/lib/defaults";
import { telLink, whatsappLink } from "@/lib/whatsapp";

/** "Bright smiles, done gently." → first part dark, part after the first comma in brand colour. */
function splitTitle(title: string) {
  const i = title.indexOf(",");
  if (i === -1 || i === title.length - 1) return [title, ""] as const;
  return [title.slice(0, i + 1), title.slice(i + 1).trim()] as const;
}

export function Hero({ data }: { data: ResolvedDemo }) {
  const [first, second] = splitTitle(data.heroTitle);
  const wa = whatsappLink(data.whatsapp, `Assalam o Alaikum, I'd like to book an appointment at ${data.businessName}.`);
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-14 pb-16 lg:grid-cols-12">
        <div className="animate-rise lg:col-span-7">
          {data.openingHours && (
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border">
              <Clock className="size-3.5 text-primary" /> {data.openingHours}
            </div>
          )}
          <h1 className="text-balance font-display text-[clamp(3.25rem,10vw,7.5rem)] leading-[0.88] tracking-tight">
            {first}
            {second && (
              <>
                <br />
                <span className="text-primary">{second}</span>
              </>
            )}
          </h1>
          <p className="mt-6 max-w-[46ch] text-pretty text-lg text-muted-foreground">{data.heroDescription}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#book"
              className="rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-deep"
            >
              {data.ctaText}
            </a>
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-surface px-7 py-4 text-base font-semibold ring-1 ring-border transition-colors hover:ring-foreground/30"
              >
                WhatsApp us
              </a>
            ) : (
              <a
                href={telLink(data.phone)}
                className="rounded-full bg-surface px-7 py-4 text-base font-semibold ring-1 ring-border transition-colors hover:ring-foreground/30"
              >
                Call {data.phone}
              </a>
            )}
          </div>
          {data.googleRating > 0 && (
            <a href="#reviews" className="mt-8 flex items-center gap-3">
              <span className="flex gap-0.5 text-accent">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`size-4 ${i <= Math.round(data.googleRating) ? "fill-current" : "opacity-30"}`} />
                ))}
              </span>
              <span className="text-sm text-muted-foreground">
                Rated <b className="text-foreground">{data.googleRating.toFixed(1)}</b>
                {data.googleReviewCount > 0 && (
                  <>
                    {" "}from <b className="text-foreground">{data.googleReviewCount}</b> Google reviews
                  </>
                )}
              </span>
            </a>
          )}
        </div>
        <div className="animate-pop [animation-delay:120ms] lg:col-span-5">
          <div className="relative">
            <img
              src={data.heroImage}
              alt={`${data.businessName} clinic`}
              width={1024}
              height={1280}
              fetchPriority="high"
              className="aspect-[4/5] w-full rounded-[28px] object-cover"
            />
            {data.googleRating > 0 && (
              <div className="absolute bottom-8 -left-4 rounded-2xl bg-surface px-4 py-3 shadow-sm ring-1 ring-border">
                <div className="font-display text-2xl text-primary">{data.googleRating.toFixed(1)} ★</div>
                <div className="font-mono text-[10px] tracking-wider text-muted-foreground">
                  {data.googleReviewCount > 0 ? `${data.googleReviewCount} GOOGLE REVIEWS` : "PATIENT RATING"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
