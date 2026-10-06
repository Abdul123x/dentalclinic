import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * One document = one clinic demo. All demos share the same template; only this data differs.
 *
 * Forward-compatibility rule: every field has a default. Old documents that are missing a
 * newly added field simply get the default when read, so existing demos never break.
 */

const ServiceSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    details: { type: String, default: "" },
    icon: { type: String, default: "Sparkles" },
  },
  { _id: false },
);

const TestimonialSchema = new Schema(
  {
    name: { type: String, required: true },
    text: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
  },
  { _id: false },
);

const FeatureSchema = new Schema(
  { title: { type: String, required: true }, description: { type: String, default: "" } },
  { _id: false },
);

const str = { type: String, default: "" };

const DemoSchema = new Schema(
  {
    businessName: { type: String, required: true, trim: true },
    // Unique index → O(log n) lookup by slug and a hard guarantee against duplicates.
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    doctorName: str,
    doctorTitle: str,
    doctorBio: str,
    doctorImage: str,
    tagline: str,
    phone: str,
    whatsapp: str,
    email: str,
    address: str,
    city: str,
    openingHours: str,

    heroTitle: str,
    heroDescription: str,
    heroImage: str,
    ctaText: str,

    aboutTitle: str,
    aboutDescription: str,
    aboutImage: str,

    services: { type: [ServiceSchema], default: [] },
    whyChooseUs: { type: [FeatureSchema], default: [] },
    testimonials: { type: [TestimonialSchema], default: [] },
    galleryImages: { type: [String], default: [] },

    googleMapsUrl: str,
    googlePlaceId: str,
    googleRating: { type: Number, default: 0 },
    googleReviewCount: { type: Number, default: 0 },

    facebookUrl: str,
    instagramUrl: str,
    tiktokUrl: str,

    primaryColor: { type: String, default: "#14b8a6" },
    secondaryColor: { type: String, default: "#f97349" },
    logo: str,

    metaTitle: str,
    metaDescription: str,

    isPublished: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, minimize: false },
);

// Dashboard list is sorted by most recently edited.
DemoSchema.index({ updatedAt: -1 });

export type DemoDoc = InferSchemaType<typeof DemoSchema> & { _id: mongoose.Types.ObjectId };

export const DemoModel: Model<DemoDoc> =
  (mongoose.models.Demo as Model<DemoDoc>) || mongoose.model<DemoDoc>("Demo", DemoSchema);
