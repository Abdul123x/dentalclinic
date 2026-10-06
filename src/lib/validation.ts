import { z } from "zod";

import { ICON_NAMES } from "./icons";
import { isValidSlug } from "./slug";

/**
 * Single source of truth for what a demo looks like.
 * - The admin form validates with it in the browser (instant feedback).
 * - Every server action / API route validates with it again (authoritative).
 * Adding a field? Add it here (with a default) and in models/Demo.ts — see README.
 */

const trimmed = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) => trimmed(max).optional().default("");

// Accepts http(s) URLs or site-relative paths such as /defaults/hero.jpg. Empty = use default.
const imageUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || /^https?:\/\//i.test(v) || v.startsWith("/"), "Must be a valid image URL")
  .optional()
  .default("");

const linkUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "Must start with https://")
  .optional()
  .default("");

const hexColor = z
  .string()
  .trim()
  .regex(/^#([0-9a-f]{6})$/i, "Use a 6-digit hex colour like #14b8a6");

/** Keeps digits only and converts Pakistani local format (03xx…) to international (923xx…). */
export function normalizeWhatsapp(input: string) {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("03")) digits = "92" + digits.slice(1);
  return digits;
}

export const serviceSchema = z.object({
  title: trimmed(80).min(1, "Service title is required"),
  description: optionalText(400),
  details: optionalText(3000),
  icon: z.enum(ICON_NAMES).catch("Sparkles").default("Sparkles"),
});

export const testimonialSchema = z.object({
  name: trimmed(80).min(1, "Name is required"),
  text: trimmed(1500).min(1, "Review text is required"),
  rating: z.coerce.number().int().min(1).max(5).default(5),
});

export const featureSchema = z.object({
  title: trimmed(60).min(1, "Title is required"),
  description: optionalText(300),
});

export const demoInputSchema = z.object({
  // 1. Business
  businessName: trimmed(120).min(2, "Business name is required"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Slug is required")
    .max(80)
    .refine(isValidSlug, "Use lowercase letters, numbers and single hyphens only"),
  doctorName: optionalText(120),
  doctorTitle: optionalText(120),
  doctorBio: optionalText(1000),
  doctorImage: imageUrl,
  tagline: optionalText(160),
  phone: trimmed(40).min(5, "Phone number is required"),
  whatsapp: z
    .string()
    .trim()
    .max(40)
    .optional()
    .default("")
    .transform(normalizeWhatsapp)
    .refine((v) => v === "" || (v.length >= 10 && v.length <= 15), "Enter a full number, e.g. 923001234567"),
  email: z.string().trim().max(200).email("Invalid email").or(z.literal("")).optional().default(""),
  address: optionalText(300),
  city: optionalText(80),
  openingHours: optionalText(200),

  // 2. Hero
  heroTitle: optionalText(120),
  heroDescription: optionalText(400),
  heroImage: imageUrl,
  ctaText: optionalText(40),

  // 3. About
  aboutTitle: optionalText(120),
  aboutDescription: optionalText(2000),
  aboutImage: imageUrl,

  // 4–6. Content blocks
  services: z.array(serviceSchema).max(40).default([]),
  whyChooseUs: z.array(featureSchema).max(8).default([]),
  testimonials: z.array(testimonialSchema).max(30).default([]),
  galleryImages: z.array(imageUrl).max(24).default([]),

  // 7. Contact / Google
  googleMapsUrl: linkUrl,
  googlePlaceId: optionalText(200),
  googleRating: z.coerce.number().min(0).max(5).optional().default(0),
  googleReviewCount: z.coerce.number().int().min(0).max(100000).optional().default(0),

  // 8. Social
  facebookUrl: linkUrl,
  instagramUrl: linkUrl,
  tiktokUrl: linkUrl,

  // 9. Design
  primaryColor: hexColor.default("#14b8a6"),
  secondaryColor: hexColor.default("#f97349"),
  logo: imageUrl,

  // SEO (optional overrides)
  metaTitle: optionalText(120),
  metaDescription: optionalText(300),

  // 10. Publishing
  isPublished: z.boolean().default(false),
});

export type DemoInput = z.infer<typeof demoInputSchema>;
export type DemoFormValues = z.input<typeof demoInputSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;
export type Feature = z.infer<typeof featureSchema>;

/** A demo as returned from the database (plain, serialisable object). */
export type Demo = DemoInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

/** Turns a ZodError into { "services.0.title": "Service title is required", ... } */
export function flattenErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(200),
});
