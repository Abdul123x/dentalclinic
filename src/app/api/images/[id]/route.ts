import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { ImageModel } from "@/models/Image";

export const runtime = "nodejs";

// GET /api/images/:id   (public) — serves an uploaded image with long-lived caching.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return new Response("Not found", { status: 404 });
  await connectDB();
  const img = await ImageModel.findById(id).lean();
  if (!img) return new Response("Not found", { status: 404 });
  const data = img.data as unknown as { buffer?: ArrayBuffer } | Buffer;
  const bytes = Buffer.isBuffer(data) ? data : Buffer.from((data as { buffer: ArrayBuffer }).buffer);
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": img.contentType,
      "Content-Length": String(bytes.length),
      // Each upload gets a new id, so the file at a URL never changes → cache forever.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
