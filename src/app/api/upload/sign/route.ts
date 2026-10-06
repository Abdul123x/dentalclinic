import type { NextRequest } from "next/server";

import { guard, json } from "@/lib/api";
import { cloudinaryConfigured, signUpload } from "@/lib/cloudinary";

// POST /api/upload/sign  { folder: "sarah-dental" }   (admin)
export async function POST(req: NextRequest) {
  const denied = await guard();
  if (denied) return denied;
  if (!cloudinaryConfigured()) return json({ error: "Cloudinary is not configured" }, 501);
  const body = (await req.json().catch(() => ({}))) as { folder?: string };
  return json(signUpload(String(body.folder ?? "misc").slice(0, 80)));
}
