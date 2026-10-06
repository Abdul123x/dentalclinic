import { ExternalLink, Star } from "lucide-react";

import type { ResolvedDemo } from "@/lib/defaults";
import type { GoogleReviewsResult } from "@/lib/google-reviews";
import { Reveal } from "./Reveal";

function Stars({ value, size = "size-4" }: { value: number; size?: string }) {
  return (
    <span className="flex gap-0.5 text-accent" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${size} ${i <= Math.round(value) ? "fill-current" : "opacity-30"}`} />
      ))}
    </span>
  );
}

/**
 * Shows live Google reviews when the demo has a Google Place ID (and the server has an API key),
 * otherwise the testimonials entered in the admin. Hidden if there's nothing to show.
 */
export function Testimonials({ data, live }: { data: ResolvedDemo; live: GoogleReviewsResult }) {
  const reviews = live?.reviews.length
    ? live.reviews
    : data.testimonials.map((t) => ({ name: t.name, text: t.text, rating: t.rating, when: "", photo: undefined }));
  const rating = live?.rating || data.googleRating;
  const total = live?.total || data.googleReviewCount;
  const mapsUrl =
    live?.mapsUrl ||
    data.googleMapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${data.businessName} ${data.city || data.address}`)}`;

  if (!reviews.length && !rating) return null;

  return (
    <section id="reviews" className="scroll-mt-20 bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <Reveal>
          <div className="mb-10 grid items-end gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="mb-3 flex flex-wrap items-center gap-3 font-mono text-xs tracking-widest text-primary">
                PATIENT REVIEWS
                {live?.reviews.length ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2 py-0.5 text-[10px]">
                    <span className="size-1.5 animate-pulse rounded-full bg-primary" /> LIVE FROM GOOGLE
                  </span>
                ) : null}
              </div>
              <h2 className="text-balance font-display text-4xl tracking-tight md:text-5xl">What our patients say</h2>
            </div>
            {rating > 0 && (
              <div className="flex items-center gap-5 rounded-3xl bg-background/[0.06] p-5 ring-1 ring-background/10 lg:col-span-5">
                <div className="font-display text-6xl leading-none text-primary">{rating.toFixed(1)}</div>
                <div>
                  <Stars value={rating} size="size-5" />
                  {total > 0 && (
                    <div className="mt-1 text-sm text-background/70">
                      Based on <b className="text-background">{total}</b> Google reviews
                    </div>
                  )}
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    See all on Google <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {reviews.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => (
              <Reveal key={`${r.name}-${i}`} delay={i * 70}>
                <article className="flex h-full flex-col rounded-3xl bg-background/[0.06] p-6 ring-1 ring-background/10">
                  <div className="mb-4 flex items-center gap-3">
                    {r.photo ? (
                      <img src={r.photo} alt="" referrerPolicy="no-referrer" className="size-10 rounded-full object-cover" />
                    ) : (
                      <div className="grid size-10 place-items-center rounded-full bg-primary/25 font-bold text-primary">
                        {r.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{r.name}</div>
                      {r.when && <div className="text-xs text-background/60">{r.when}</div>}
                    </div>
                  </div>
                  <Stars value={r.rating} />
                  <p className="mt-3 line-clamp-6 flex-1 text-sm leading-relaxed text-background/85">{r.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-deep"
          >
            Read all reviews <ExternalLink className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
