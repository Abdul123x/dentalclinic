import type { Demo, DemoInput, Feature, Service } from "./validation";

/** Built-in placeholder images (in /public/defaults). Used whenever a demo leaves an image empty. */
export const DEFAULT_IMAGES = {
  hero: "/defaults/hero.jpg",
  about: "/defaults/about.jpg",
  gallery: ["/defaults/gallery-1.jpg", "/defaults/gallery-2.jpg", "/defaults/gallery-3.jpg", "/defaults/gallery-4.jpg"],
};

export const DEFAULT_WHY: Feature[] = [
  { title: "Gentle care", description: "Anxiety-friendly treatment, explained step by step in your language." },
  { title: "Clear pricing", description: "Treatment and cost agreed with you before anything begins." },
  { title: "Same-day", description: "Emergency slots for toothache, swelling and broken teeth." },
  { title: "Modern clinic", description: "Sterilised instruments, digital X-rays and a calm, clean space." },
];

/** Starter services pre-filled on every new demo — edit, remove or add more in the form. */
export const STARTER_SERVICES: Service[] = [
  {
    title: "Teeth Whitening",
    icon: "Sparkles",
    description: "In-clinic brightening for a visibly whiter smile in one visit.",
    details:
      "Professional whitening lifts stains from tea, coffee, paan, smoking and age. A dentist-applied gel is used with your gums protected, so results are faster, more even and safer than store-bought kits. Usually one 60–90 minute visit; mild sensitivity for a day or two is normal.",
  },
  {
    title: "Teeth Cleaning & Scaling",
    icon: "Brush",
    description: "Removes tartar and stains to keep gums healthy and breath fresh.",
    details:
      "Ultrasonic scaling and polishing removes hard tartar your brush can't reach, reducing bleeding gums and bad breath and preventing gum disease. Takes 30–45 minutes; recommended every 6 months.",
  },
  {
    title: "Root Canal Treatment",
    icon: "Activity",
    description: "Comfortable root canal treatment with modern rotary instruments.",
    details:
      "When the nerve inside a tooth is infected, root canal treatment removes the infection, cleans and seals the canals and saves your natural tooth. Done under local anaesthetic in 1–2 visits; most teeth then need a crown for protection.",
  },
  {
    title: "Dental Implants",
    icon: "Anchor",
    description: "Permanent, natural-looking replacements for missing teeth.",
    details:
      "A titanium post placed in the jawbone acts like a natural root, and a custom crown is fixed on top once it heals. Implants don't rely on neighbouring teeth, help preserve bone and can last many years. Typically 2–4 visits over 3–6 months.",
  },
  {
    title: "Braces & Clear Aligners",
    icon: "AlignHorizontalDistributeCenter",
    description: "Metal, ceramic and clear aligner options to straighten teeth.",
    details:
      "Orthodontic treatment gradually moves teeth into better positions to improve your smile and bite. Metal braces are the most economical, ceramic braces are tooth-coloured and clear aligners are nearly invisible. Usually 12–24 months with check-ups every 4–6 weeks.",
  },
  {
    title: "Emergency Dental Care",
    icon: "Siren",
    description: "Same-day relief for toothache, swelling and broken teeth.",
    details:
      "Severe toothache, facial swelling, a broken or knocked-out tooth, or a lost filling — call us and we'll do our best to see you the same day. For a knocked-out tooth, keep it in milk and come in immediately.",
  },
];

/** Every field's default. Old documents missing a new field get these values on read. */
export const DEMO_DEFAULTS: DemoInput = {
  businessName: "",
  slug: "",
  doctorName: "",
  doctorTitle: "",
  doctorBio: "",
  doctorImage: "",
  tagline: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  city: "",
  openingHours: "",
  heroTitle: "",
  heroDescription: "",
  heroImage: "",
  ctaText: "",
  aboutTitle: "",
  aboutDescription: "",
  aboutImage: "",
  services: [],
  whyChooseUs: [],
  testimonials: [],
  galleryImages: [],
  googleMapsUrl: "",
  googlePlaceId: "",
  googleRating: 0,
  googleReviewCount: 0,
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  primaryColor: "#14b8a6",
  secondaryColor: "#f97349",
  logo: "",
  metaTitle: "",
  metaDescription: "",
  isPublished: false,
};

/** Values the "Create demo" form starts with. */
export function newDemoFormValues(): DemoInput {
  return {
    ...DEMO_DEFAULTS,
    openingHours: "Mon – Sat · 10:00 AM – 9:00 PM",
    ctaText: "Book an appointment",
    services: STARTER_SERVICES.map((s) => ({ ...s })),
    whyChooseUs: DEFAULT_WHY.map((w) => ({ ...w })),
  };
}

/**
 * Resolves every optional field to something sensible so template components never
 * have to deal with empty strings. Components receive this object via props.
 */
export function resolveDemo(demo: Demo) {
  const city = demo.city || "";
  const where = city ? ` in ${city}` : "";
  return {
    ...demo,
    heroTitle: demo.heroTitle || "Bright smiles, done gently.",
    heroDescription:
      demo.heroDescription ||
      `${demo.businessName}${where}. Honest, gentle dentistry for the whole family — from cleanings to full smile makeovers.`,
    heroImage: demo.heroImage || DEFAULT_IMAGES.hero,
    ctaText: demo.ctaText || "Book an appointment",
    aboutTitle: demo.aboutTitle || `About ${demo.businessName}`,
    aboutDescription:
      demo.aboutDescription ||
      `At ${demo.businessName} we believe a dental visit should feel calm, not scary. We take the time to explain every option, and we never rush.`,
    aboutImage: demo.aboutImage || DEFAULT_IMAGES.about,
    galleryImages: demo.galleryImages.filter(Boolean).length ? demo.galleryImages.filter(Boolean) : DEFAULT_IMAGES.gallery,
    whyChooseUs: demo.whyChooseUs.length ? demo.whyChooseUs : DEFAULT_WHY,
    whatsapp: demo.whatsapp || demo.phone.replace(/\D/g, "").replace(/^0(?=3)/, "92"),
    initial: demo.businessName.trim().charAt(0).toUpperCase() || "D",
  };
}

export type ResolvedDemo = ReturnType<typeof resolveDemo>;
