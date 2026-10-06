import type { NextRequest } from "next/server";

import { guard, json } from "@/lib/api";
import { deleteDemo, getDemoById, SlugTakenError, updateDemo } from "@/lib/demo-service";
import { demoInputSchema, flattenErrors } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/demos/:id   (admin)
export async function GET(_req: NextRequest, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const demo = await getDemoById((await params).id);
  return demo ? json({ demo }) : json({ error: "Not found" }, 404);
}

// PUT /api/demos/:id   (admin) — full update
export async function PUT(req: NextRequest, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const parsed = demoInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Validation failed", fieldErrors: flattenErrors(parsed.error) }, 422);
  try {
    const demo = await updateDemo((await params).id, parsed.data);
    return demo ? json({ demo }) : json({ error: "Not found" }, 404);
  } catch (e) {
    if (e instanceof SlugTakenError) return json({ error: e.message, suggestion: e.suggestion }, 409);
    throw e;
  }
}

// DELETE /api/demos/:id   (admin)
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const res = await deleteDemo((await params).id);
  return res ? json({ ok: true }) : json({ error: "Not found" }, 404);
}
