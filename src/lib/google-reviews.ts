import "server-only";

export type GoogleReview = {
  name: string;
  text: string;
  rating: number;
  when: string;
  photo?: string;
};

export type GoogleReviewsResult = {
  rating: number;
  total: number;
  mapsUrl: string;
  reviews: GoogleReview[];
} | null;

/**
 * Live Google reviews for one demo via Places API (New).
 * Needs GOOGLE_PLACES_API_KEY (server env) + the demo's googlePlaceId.
 * Cached by Next.js for 1 hour per place. Google returns at most 5 reviews.
 */
export async function getGoogleReviews(placeId: string): Promise<GoogleReviewsResult> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key || !placeId) return null;
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsUri" },
      next: { revalidate: 3600, tags: [`reviews:${placeId}`] },
    });
    if (!res.ok) return null;
    const raw = (await res.json()) as {
      rating?: number;
      userRatingCount?: number;
      googleMapsUri?: string;
      reviews?: {
        rating: number;
        text?: { text: string };
        originalText?: { text: string };
        relativePublishTimeDescription?: string;
        authorAttribution?: { displayName?: string; photoUri?: string };
      }[];
    };
    return {
      rating: raw.rating ?? 0,
      total: raw.userRatingCount ?? 0,
      mapsUrl: raw.googleMapsUri ?? "",
      reviews: (raw.reviews ?? [])
        .map((r) => ({
          name: r.authorAttribution?.displayName ?? "Google user",
          text: r.originalText?.text ?? r.text?.text ?? "",
          rating: r.rating,
          when: r.relativePublishTimeDescription ?? "",
          photo: r.authorAttribution?.photoUri,
        }))
        .filter((r) => r.text),
    };
  } catch {
    return null;
  }
}
