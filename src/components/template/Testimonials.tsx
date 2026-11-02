import { ArrowUpRight, Star } from "lucide-react";

import type { ResolvedDemo } from "@/lib/defaults";
import type { GoogleReviewsResult } from "@/lib/google-reviews";
import { container, eyebrow, h2, textLink } from "./ui";

const GOLD = "fill-[#e3a43a] text-[#e3a43a]";

function Stars({ value, size = "size-4" }: { value: number; size?: string }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${size} ${i <= Math.round(value) ? GOLD : "text-foreground/15"}`} />
      ))}
    </span>
  );
}

/**
 * Live Google reviews when a Place ID + API key exist, otherwise the testimonials entered in admin.
 * Hidden when there's nothing real to show.
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
    <section id="reviews" className="scroll-mt-24 border-t border-border py-20 md:py-28">
      <div className={container}>
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className={eyebrow}>Patient reviews</p>
            <h2 className={`${h2} mt-5`}>What our patients say</h2>
          </div>
          {rating > 0 && (
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="group flex items-center gap-5">
              <span className="font-serif text-6xl leading-none">{rating.toFixed(1)}</span>
              <span>
                <Stars value={rating} size="size-5" />
                <span className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground group-hover:text-foreground">
                  {total > 0 ? `${total} reviews on Google` : "Google rating"} <ArrowUpRight className="size-3.5" />
                </span>
              </span>
            </a>
          )}
        </div>

        {reviews.length > 0 ? (
          <div className="mt-14 grid gap-px border-y border-border bg-border md:grid-cols-3">
            {reviews.slice(0, 6).map((r, i) => (
              <figure key={`${r.name}-${i}`} className="flex flex-col bg-background py-8 md:px-8 md:[&:nth-child(3n+1)]:pl-0">
                <Stars value={r.rating} />
                <blockquote className="mt-5 flex-1 font-serif text-[19px] leading-relaxed text-foreground/90">
                  <p className="line-clamp-[8]">“{r.text}”</p>
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 text-sm">
                  {r.photo ? (
                    <img src={r.photo} alt="" referrerPolicy="no-referrer" className="size-9 rounded-full object-cover" />
                  ) : (
                    <span className="grid size-9 place-items-center rounded-full bg-paper font-semibold">{r.name.charAt(0)}</span>
                  )}
                  <span>
                    <span className="block font-semibold">{r.name}</span>
                    <span className="block text-muted-foreground">{r.when || "Google review"}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className="mt-10 max-w-xl text-[17px] text-muted-foreground">
            Read what patients{data.city ? ` in ${data.city}` : ""} say about their treatment on our Google profile.
          </p>
        )}

        <a href={mapsUrl} target="_blank" rel="noreferrer" className={`${textLink} mt-10`}>
          Read all reviews on Google
        </a>
      </div>
    </section>
  );
}
