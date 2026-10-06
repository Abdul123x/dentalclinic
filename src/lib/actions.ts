"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { login, logout, requireAdmin } from "./auth";
import * as service from "./demo-service";
import { slugify } from "./slug";
import { demoInputSchema, flattenErrors, loginSchema } from "./validation";

/**
 * Server actions used by the admin UI. Every one re-checks the admin session and
 * validates input on the server — the browser is never trusted.
 */

export type ActionResult<T = unknown> =
  | ({ ok: true } & T)
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function refreshAdmin(slug?: string) {
  revalidatePath("/admin", "layout");
  if (slug) revalidatePath(`/demo/${slug}`, "layout");
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function loginAction(_prev: { error?: string; email?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").slice(0, 200);
  const parsed = loginSchema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) return { error: "Enter your email and password.", email };
  const res = await login(parsed.data.email, parsed.data.password);
  if (!res.ok) return { error: res.error, email };
  const next = String(formData.get("next") || "/admin");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

// ── Demos ────────────────────────────────────────────────────────────────────

export async function saveDemoAction(
  id: string | null,
  values: unknown,
  intent: "draft" | "publish" | "save",
): Promise<ActionResult<{ id: string; slug: string; isPublished: boolean }>> {
  await requireAdmin();

  const parsed = demoInputSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: flattenErrors(parsed.error) };
  }
  const input = parsed.data;
  if (intent === "draft") input.isPublished = false;
  if (intent === "publish") input.isPublished = true;

  try {
    const previous = id ? await service.getDemoById(id) : null;
    if (id && !previous) return { ok: false, error: "This demo no longer exists." };
    const saved = id ? await service.updateDemo(id, input) : await service.createDemo(input);
    if (!saved) return { ok: false, error: "Could not save the demo." };
    refreshAdmin(saved.slug);
    if (previous && previous.slug !== saved.slug) refreshAdmin(previous.slug);
    return { ok: true, id: saved.id, slug: saved.slug, isPublished: saved.isPublished };
  } catch (e) {
    if (e instanceof service.SlugTakenError) {
      return {
        ok: false,
        error: e.message,
        fieldErrors: { slug: `Already taken — try "${e.suggestion}"` },
      };
    }
    console.error("saveDemoAction", e);
    return { ok: false, error: "Something went wrong while saving. Please try again." };
  }
}

export async function deleteDemoAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const res = await service.deleteDemo(id);
  if (!res) return { ok: false, error: "Demo not found." };
  refreshAdmin(res.slug);
  return { ok: true };
}

export async function duplicateDemoAction(id: string): Promise<ActionResult<{ id: string; slug: string }>> {
  await requireAdmin();
  try {
    const copy = await service.duplicateDemo(id);
    if (!copy) return { ok: false, error: "Demo not found." };
    refreshAdmin();
    return { ok: true, id: copy.id, slug: copy.slug };
  } catch (e) {
    console.error("duplicateDemoAction", e);
    return { ok: false, error: "Could not duplicate the demo." };
  }
}

export async function setPublishedAction(id: string, isPublished: boolean): Promise<ActionResult<{ isPublished: boolean }>> {
  await requireAdmin();
  const demo = await service.setPublished(id, Boolean(isPublished));
  if (!demo) return { ok: false, error: "Demo not found." };
  refreshAdmin(demo.slug);
  return { ok: true, isPublished: demo.isPublished };
}

export async function checkSlugAction(slug: string, excludeId?: string) {
  await requireAdmin();
  const clean = slugify(String(slug || ""));
  if (!clean) return { slug: clean, available: false, suggestion: "" };
  const available = await service.isSlugAvailable(clean, excludeId);
  return { slug: clean, available, suggestion: available ? clean : await service.generateUniqueSlug(clean, excludeId) };
}
