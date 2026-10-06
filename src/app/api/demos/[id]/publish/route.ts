import { guard, json } from "@/lib/api";
import { setPublished } from "@/lib/demo-service";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/demos/:id/publish     (admin) — publish
export async function POST(_req: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const demo = await setPublished((await params).id, true);
  return demo ? json({ demo }) : json({ error: "Not found" }, 404);
}

// DELETE /api/demos/:id/publish   (admin) — unpublish
export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const demo = await setPublished((await params).id, false);
  return demo ? json({ demo }) : json({ error: "Not found" }, 404);
}
