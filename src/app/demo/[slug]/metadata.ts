import type { Metadata } from "next";

import { resolveDemo } from "@/lib/defaults";
import type { Demo } from "@/lib/validation";

/** Per-demo SEO: title, description, Open Graph image, canonical URL. */
export function demoMetadata(demo: Demo, path = ""): Metadata {
  const d = resolveDemo(demo);
  const place = d.city ? ` in ${d.city}` : "";
  const title = d.metaTitle || `${d.businessName}${d.tagline ? ` — ${d.tagline}` : place ? ` — Dentist${place}` : ""}`;
  const description =
    d.metaDescription ||
    `${d.businessName}${place}. ${d.heroDescription}`.slice(0, 300) + (d.phone ? ` Call ${d.phone}.` : "");
  const url = `/demo/${d.slug}${path}`;
  const image = d.heroImage;
  return {
    title: path ? `Services — ${d.businessName}` : title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: d.businessName, images: [{ url: image }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    icons: d.logo ? { icon: d.logo } : undefined,
    robots: { index: true, follow: true },
  };
}

export function demoJsonLd(demo: Demo) {
  const d = resolveDemo(demo);
  return {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: d.businessName,
    description: d.metaDescription || d.heroDescription,
    telephone: d.phone,
    email: d.email || undefined,
    image: d.heroImage,
    address: d.address ? { "@type": "PostalAddress", streetAddress: d.address, addressLocality: d.city || undefined } : undefined,
    aggregateRating:
      d.googleRating > 0 && d.googleReviewCount > 0
        ? { "@type": "AggregateRating", ratingValue: d.googleRating.toFixed(1), reviewCount: String(d.googleReviewCount) }
        : undefined,
    sameAs: [d.facebookUrl, d.instagramUrl, d.tiktokUrl].filter(Boolean),
  };
}
