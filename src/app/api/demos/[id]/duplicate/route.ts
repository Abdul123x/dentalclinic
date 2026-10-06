import { guard, json } from "@/lib/api";
import { duplicateDemo } from "@/lib/demo-service";

// POST /api/demos/:id/duplicate   (admin)
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard();
  if (denied) return denied;
  const demo = await duplicateDemo((await params).id);
  return demo ? json({ demo }, 201) : json({ error: "Not found" }, 404);
}
