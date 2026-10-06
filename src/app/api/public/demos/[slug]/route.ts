import { json } from "@/lib/api";
import { getDemoBySlug } from "@/lib/demo-service";

// GET /api/public/demos/:slug   (public) — published demos only
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const demo = await getDemoBySlug((await params).slug, true);
  return demo ? json({ demo }) : json({ error: "Not found" }, 404);
}
