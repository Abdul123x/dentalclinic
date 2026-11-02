import type { NextRequest } from "next/server";

import { guard, json } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { ImageModel } from "@/models/Image";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024; // Vercel's request limit is ~4.5 MB; the browser compresses well below this.

/** Detects the real file type from its first bytes (never trust the browser's label). */
function sniff(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (buf.toString("ascii", 0, 6) === "GIF87a" || buf.toString("ascii", 0, 6) === "GIF89a") return "image/gif";
  return null;
}

// POST /api/upload   (admin)  multipart: file, folder → { url: "/api/images/<id>" }
export async function POST(req: NextRequest) {
  const denied = await guard();
  if (denied) return denied;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof Blob)) return json({ error: "No file received." }, 400);
  if (file.size > MAX_BYTES) return json({ error: "Image is too large (max 4 MB)." }, 413);

  const buf = Buffer.from(await file.arrayBuffer());
  const contentType = sniff(buf);
  if (!contentType) return json({ error: "Only JPG, PNG, WebP or GIF images are allowed." }, 415);

  await connectDB();
  const folder = String(form?.get("folder") ?? "").replace(/[^a-z0-9-]/gi, "").slice(0, 80);
  const doc = await ImageModel.create({ data: buf, contentType, size: buf.length, folder });
  return json({ url: `/api/images/${doc._id}` }, 201);
}
