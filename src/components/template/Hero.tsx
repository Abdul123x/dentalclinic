import { Star } from "lucide-react";

import type { ResolvedDemo } from "@/lib/defaults";
import { telLink } from "@/lib/whatsapp";
import { btnPrimary, container, textLink } from "./ui";

export function Hero({ data }: { data: ResolvedDemo }) {
  const facts = [
    data.googleRating > 0 && {
      value: (
        <span className="flex items-center gap-1.5">
          {data.googleRating.toFixed(1)}
          <Star className="size-4 fill-[#e3a43a] text-[#e3a43a]" />
        </span>
      ),
      label: data.googleReviewCount ? `${data.googleReviewCount} Google reviews` : "Google rating",
    },
    data.services.length > 0 && { value: String(data.services.length), label: "Treatments offered" },
    { value: "Same day", label: "Emergency appointments" },
  ].filter(Boolean) as { value: React.ReactNode; label: string }[];

  return (
    <section id="top" className="border-b border-border">
      <div className={`${container} grid gap-10 py-12 md:py-16 lg:grid-cols-12 lg:gap-14 lg:py-20`}>
        <div className="flex flex-col justify-center lg:col-span-6">
          <p className="mb-6 text-[13px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {data.tagline || "Dental clinic"}
            {data.city ? ` — ${data.city}` : ""}
          </p>
          <h1 className="text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.02] text-balance">{data.heroTitle}</h1>
          <p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-pretty text-muted-foreground">
            {data.heroDescription}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a href="#book" className={btnPrimary}>
              {data.ctaText}
            </a>
            <a href={telLink(data.phone)} className={textLink}>
              or call {data.phone}
            </a>
          </div>

          {facts.length > 0 && (
            <dl className={`mt-12 grid border-t border-border pt-6 ${facts.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
              {facts.map((f, i) => (
                <div key={f.label} className={i > 0 ? "border-l border-border pl-3 sm:pl-6" : "pr-3"}>
                  <dt className="sr-only">{f.label}</dt>
                  <dd className="font-serif text-[22px] leading-none whitespace-nowrap sm:text-3xl">{f.value}</dd>
                  <dd className="mt-2 text-[13px] leading-snug text-muted-foreground">{f.label}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="lg:col-span-6">
          <figure className="relative h-full">
            <img
              src={data.heroImage}
              alt={`${data.businessName}${data.city ? `, ${data.city}` : ""}`}
              fetchPriority="high"
              className="photo aspect-[4/3] w-full rounded-[4px] object-cover lg:aspect-auto lg:h-full lg:min-h-[520px]"
            />
            {data.openingHours && (
              <figcaption className="absolute bottom-0 left-0 max-w-[85%] bg-background px-5 py-4 text-sm">
                <span className="block text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Opening hours
                </span>
                <span className="mt-1 block font-medium">{data.openingHours}</span>
              </figcaption>
            )}
          </figure>
        </div>
      </div>
    </section>
  );
}
