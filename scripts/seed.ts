/**
 * Seeds example demos. Safe to run repeatedly — existing slugs are left untouched.
 *   npm run seed
 */
import { readFileSync } from "node:fs";
import mongoose from "mongoose";

import { DEFAULT_WHY, STARTER_SERVICES } from "../src/lib/defaults";
import { demoInputSchema, type DemoInput } from "../src/lib/validation";
import { DemoModel } from "../src/models/Demo";

// Load .env.local / .env when run outside Next.js
for (const file of [".env.local", ".env"]) {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]!]) process.env[m[1]!] = m[2]!.replace(/^["']|["']$/g, "");
    }
  } catch {}
}

const fullServices = JSON.parse(readFileSync(new URL("./data/full-services.json", import.meta.url), "utf8"));

const seeds: Partial<DemoInput>[] = [
  {
    businessName: "Mohsin Dental Clinic",
    slug: "mohsin-dental-clinic",
    tagline: "Aesthetic Dentistry & Implant Centre",
    city: "Kasur",
    phone: "0303 4060111",
    whatsapp: "923034060111",
    address:
      "Shop of Madrissa Jamia Islamia, A Division Police Station Rd, opposite Imam Bargah, near PTCL Exchange, Kasur 55050",
    openingHours: "Mon – Sat · 10:00 AM – 9:00 PM",
    heroTitle: "Beautiful smiles, built to last.",
    heroDescription:
      "Mohsin Dental Clinic — Kasur's Aesthetic Dentistry & Implant Centre. Honest, gentle care for the whole family, from routine cleanings to implants and full smile makeovers.",
    ctaText: "Book an appointment",
    services: fullServices,
    whyChooseUs: [
      { title: "5.0 ★", description: "Rated by 44 patients on Google — see what they say below." },
      { title: "Implants", description: "A dedicated implant centre for permanent, natural-looking tooth replacement." },
      { title: "Same-day", description: "Emergency slots for toothache, swelling and broken teeth." },
      { title: "Clear", description: "Treatment and cost explained before we begin — in Urdu or English." },
    ],
    googleRating: 5,
    googleReviewCount: 44,
    primaryColor: "#14b8a6",
    secondaryColor: "#f97349",
    isPublished: true,
  },
  {
    businessName: "Sarah Dental",
    slug: "sarah-dental",
    doctorName: "Dr. Sarah",
    doctorTitle: "BDS · Lead Dentist",
    tagline: "Gentle family dentistry",
    city: "Lahore",
    phone: "+92 309 9306446",
    whatsapp: "923099306446",
    address: "Lahore, Pakistan",
    openingHours: "Mon – Sat · 10:00 AM – 9:00 PM",
    services: STARTER_SERVICES,
    whyChooseUs: DEFAULT_WHY,
    primaryColor: "#2563eb",
    secondaryColor: "#f59e0b",
    isPublished: true,
  },
  {
    businessName: "Bright Smile Dental",
    slug: "bright-smile-dental",
    tagline: "Modern dental care",
    city: "Islamabad",
    phone: "+92 300 0000000",
    whatsapp: "923000000000",
    address: "Islamabad, Pakistan",
    heroTitle: "Healthy teeth, happy family.",
    services: STARTER_SERVICES.slice(0, 4),
    primaryColor: "#16a34a",
    secondaryColor: "#0ea5e9",
    isPublished: false,
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(uri);
  await DemoModel.syncIndexes();
  for (const seed of seeds) {
    const data = demoInputSchema.parse(seed);
    const res = await DemoModel.updateOne({ slug: data.slug }, { $setOnInsert: data }, { upsert: true });
    console.log(`${res.upsertedCount ? "created" : "exists "}  /demo/${data.slug}`);
  }
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
