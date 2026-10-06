import type { NextRequest } from "next/server";

import { guard, json } from "@/lib/api";
import { createDemo, listDemos, SlugTakenError } from "@/lib/demo-service";
import { demoInputSchema, flattenErrors } from "@/lib/validation";

// GET /api/demos?q=&status=all|published|draft   (admin)
export async function GET(req: NextRequest) {
  const denied = await guard();
  if (denied) return denied;
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const s = req.nextUrl.searchParams.get("status");
  const status = s === "published" || s === "draft" ? s : "all";
  return json({ demos: await listDemos({ q, status }) });
}

// POST /api/demos   (admin) — create
export async function POST(req: NextRequest) {
  const denied = await guard();
  if (denied) return denied;
  const parsed = demoInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Validation failed", fieldErrors: flattenErrors(parsed.error) }, 422);
  try {
    return json({ demo: await createDemo(parsed.data) }, 201);
  } catch (e) {
    if (e instanceof SlugTakenError) return json({ error: e.message, suggestion: e.suggestion }, 409);
    throw e;
  }
}
