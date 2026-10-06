import "server-only";
import { cache } from "react";
import mongoose from "mongoose";

import { connectDB } from "./db";
import { DEMO_DEFAULTS } from "./defaults";
import { escapeRegex } from "./slug";
import type { Demo, DemoInput } from "./validation";
import { DemoModel } from "@/models/Demo";

/**
 * Data-access layer. Server actions and API routes call these functions;
 * nothing else talks to MongoDB directly. Callers are responsible for auth + validation.
 */

export class SlugTakenError extends Error {
  constructor(public slug: string, public suggestion: string) {
    super(`The URL "/demo/${slug}" is already used by another demo.`);
  }
}

const isId = (id: string) => mongoose.isValidObjectId(id);

/** Converts a Mongo document into a plain object, filling in defaults for any missing fields. */
function toDemo(doc: Record<string, unknown> | null): Demo | null {
  if (!doc) return null;
  const { _id, __v, createdAt, updatedAt, ...rest } = doc as Record<string, unknown> & {
    _id: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  };
  void __v;
  return JSON.parse(
    JSON.stringify({
      ...DEMO_DEFAULTS,
      ...rest,
      id: String(_id),
      createdAt: createdAt ? new Date(createdAt).toISOString() : "",
      updatedAt: updatedAt ? new Date(updatedAt).toISOString() : "",
    }),
  ) as Demo;
}

// ── Reads ────────────────────────────────────────────────────────────────────

export type DemoListItem = Pick<
  Demo,
  "id" | "businessName" | "slug" | "city" | "phone" | "isPublished" | "updatedAt" | "primaryColor" | "logo"
>;

export async function listDemos(opts: { q?: string; status?: "all" | "published" | "draft" } = {}) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (opts.status === "published") filter.isPublished = true;
  if (opts.status === "draft") filter.isPublished = false;
  const q = opts.q?.trim();
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ businessName: rx }, { slug: rx }, { city: rx }, { phone: rx }, { doctorName: rx }];
  }
  const docs = await DemoModel.find(filter)
    .select("businessName slug city phone isPublished updatedAt createdAt primaryColor logo")
    .sort({ updatedAt: -1 })
    .limit(500)
    .lean();
  return docs.map((d) => toDemo(d as unknown as Record<string, unknown>)!) as DemoListItem[];
}

export async function getDemoStats() {
  await connectDB();
  const [total, published] = await Promise.all([
    DemoModel.countDocuments({}),
    DemoModel.countDocuments({ isPublished: true }),
  ]);
  return { total, published, drafts: total - published };
}

export async function getDemoById(id: string) {
  if (!isId(id)) return null;
  await connectDB();
  return toDemo((await DemoModel.findById(id).lean()) as Record<string, unknown> | null);
}

/**
 * Direct indexed lookup — never loads other demos.
 * Wrapped in React `cache` so generateMetadata + page share one query per request.
 */
export const getDemoBySlug = cache(async (slug: string, publishedOnly = true) => {
  await connectDB();
  const filter: Record<string, unknown> = { slug: slug.toLowerCase() };
  if (publishedOnly) filter.isPublished = true;
  return toDemo((await DemoModel.findOne(filter).lean()) as Record<string, unknown> | null);
});

// ── Slugs ────────────────────────────────────────────────────────────────────

export async function isSlugAvailable(slug: string, excludeId?: string) {
  await connectDB();
  const filter: Record<string, unknown> = { slug };
  if (excludeId && isId(excludeId)) filter._id = { $ne: excludeId };
  return !(await DemoModel.exists(filter));
}

/** base → base, base-2, base-3 … (one query: fetch only the slugs that share the prefix). */
export async function generateUniqueSlug(base: string, excludeId?: string) {
  await connectDB();
  const filter: Record<string, unknown> = { slug: new RegExp(`^${escapeRegex(base)}(-\\d+)?$`) };
  if (excludeId && isId(excludeId)) filter._id = { $ne: excludeId };
  const taken = new Set((await DemoModel.find(filter).select("slug").lean()).map((d) => d.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

function isDuplicateKey(e: unknown) {
  return typeof e === "object" && e !== null && (e as { code?: number }).code === 11000;
}

// ── Writes ───────────────────────────────────────────────────────────────────

export async function createDemo(input: DemoInput) {
  await connectDB();
  if (!(await isSlugAvailable(input.slug))) {
    throw new SlugTakenError(input.slug, await generateUniqueSlug(input.slug));
  }
  try {
    const doc = await DemoModel.create(input);
    return toDemo(doc.toObject() as unknown as Record<string, unknown>)!;
  } catch (e) {
    // Race condition: someone took the slug between the check and the insert.
    if (isDuplicateKey(e)) throw new SlugTakenError(input.slug, await generateUniqueSlug(input.slug));
    throw e;
  }
}

export async function updateDemo(id: string, input: DemoInput) {
  if (!isId(id)) return null;
  await connectDB();
  if (!(await isSlugAvailable(input.slug, id))) {
    throw new SlugTakenError(input.slug, await generateUniqueSlug(input.slug, id));
  }
  try {
    const doc = await DemoModel.findByIdAndUpdate(id, { $set: input }, { new: true, runValidators: true }).lean();
    return toDemo(doc as Record<string, unknown> | null);
  } catch (e) {
    if (isDuplicateKey(e)) throw new SlugTakenError(input.slug, await generateUniqueSlug(input.slug, id));
    throw e;
  }
}

export async function deleteDemo(id: string) {
  if (!isId(id)) return null;
  await connectDB();
  const doc = await DemoModel.findByIdAndDelete(id).lean();
  return doc ? { slug: doc.slug } : null;
}

export async function setPublished(id: string, isPublished: boolean) {
  if (!isId(id)) return null;
  await connectDB();
  const doc = await DemoModel.findByIdAndUpdate(id, { $set: { isPublished } }, { new: true }).lean();
  return toDemo(doc as Record<string, unknown> | null);
}

/** Copies every field into a new draft with a unique "-copy" slug. */
export async function duplicateDemo(id: string) {
  const source = await getDemoById(id);
  if (!source) return null;
  const { id: _id, createdAt, updatedAt, ...data } = source;
  void _id;
  void createdAt;
  void updatedAt;
  const slug = await generateUniqueSlug(`${source.slug}-copy`.slice(0, 75));
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const doc = await DemoModel.create({
        ...data,
        slug: attempt === 0 ? slug : await generateUniqueSlug(`${source.slug}-copy`.slice(0, 75)),
        businessName: `${source.businessName} (Copy)`,
        isPublished: false,
      });
      return toDemo(doc.toObject() as unknown as Record<string, unknown>)!;
    } catch (e) {
      if (!isDuplicateKey(e)) throw e;
    }
  }
  throw new Error("Could not generate a unique slug for the copy. Please try again.");
}
