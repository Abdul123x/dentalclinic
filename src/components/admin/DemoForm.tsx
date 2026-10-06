"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Check, ExternalLink, Eye, Loader2, Plus, Star, Trash2, X } from "lucide-react";

import { checkSlugAction, saveDemoAction } from "@/lib/actions";
import { ICON_LABELS, ICON_NAMES, getIcon } from "@/lib/icons";
import { slugify } from "@/lib/slug";
import { demoInputSchema, flattenErrors, type DemoInput } from "@/lib/validation";
import { CopyUrlButton, publicUrl } from "./DemosTable";
import { ColorInput, Field, ImageInput, Section, TextArea, TextInput, inputCls } from "./fields";

const SECTIONS = [
  ["business", "Business"],
  ["hero", "Hero"],
  ["about", "About & Doctor"],
  ["services", "Services"],
  ["why", "Why us"],
  ["testimonials", "Testimonials"],
  ["gallery", "Gallery"],
  ["contact", "Contact & Google"],
  ["social", "Social"],
  ["design", "Design"],
  ["seo", "SEO"],
  ["publishing", "Publishing"],
] as const;

type Intent = "draft" | "publish" | "save";

function ListEditor<T>({
  items,
  onChange,
  make,
  addLabel,
  render,
  max,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  make: () => T;
  addLabel: string;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  max?: number;
}) {
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };
  return (
    <div className="space-y-3 sm:col-span-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl bg-background p-4 ring-1 ring-border">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[11px] tracking-widest text-muted-foreground">#{i + 1}</span>
            <div className="flex gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-md p-1.5 hover:bg-muted disabled:opacity-30" aria-label="Move up">
                <ArrowUp className="size-4" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="rounded-md p-1.5 hover:bg-muted disabled:opacity-30" aria-label="Move down">
                <ArrowDown className="size-4" />
              </button>
              <button type="button" onClick={() => onChange(items.filter((_, k) => k !== i))} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10" aria-label="Remove">
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {render(item, (patch) => onChange(items.map((it, k) => (k === i ? { ...it, ...patch } : it))), i)}
          </div>
        </div>
      ))}
      {(!max || items.length < max) && (
        <button
          type="button"
          onClick={() => onChange([...items, make()])}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-primary ring-1 ring-primary/30 hover:bg-primary/5"
        >
          <Plus className="size-4" /> {addLabel}
        </button>
      )}
    </div>
  );
}

export function DemoForm({
  initial,
  demoId,
  uploadsEnabled,
  siteUrl,
  updatedAt,
}: {
  initial: DemoInput;
  demoId: string | null;
  uploadsEnabled: boolean;
  siteUrl: string;
  updatedAt?: string;
}) {
  const router = useRouter();
  const [v, setV] = useState<DemoInput>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Intent | "preview" | null>(null);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  // Duplicated demos ("…-copy") keep auto-updating the slug from the new name until edited manually.
  const [slugTouched, setSlugTouched] = useState(Boolean(demoId) && !/-copy(-\d+)?$/.test(initial.slug));
  const [slugStatus, setSlugStatus] = useState<{ state: "idle" | "checking" | "ok" | "taken"; suggestion?: string }>({ state: "idle" });
  const [dirty, setDirty] = useState(false);
  const savedPublished = initial.isPublished;
  const firstRender = useRef(true);

  const set = <K extends keyof DemoInput>(key: K, value: DemoInput[K]) => {
    setV((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    if (errors[key as string]) setErrors(({ [key as string]: _drop, ...rest }) => (void _drop, rest));
  };
  const err = (k: string) => errors[k];

  // Auto-suggest the slug from the business name until the admin edits the slug manually.
  function onBusinessName(name: string) {
    set("businessName", name);
    if (!slugTouched) set("slug", slugify(name));
  }

  // Live slug availability check (debounced).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!v.slug) return setSlugStatus({ state: "idle" });
    setSlugStatus({ state: "checking" });
    const t = setTimeout(async () => {
      try {
        const r = await checkSlugAction(v.slug, demoId ?? undefined);
        setSlugStatus(r.available ? { state: "ok" } : { state: "taken", suggestion: r.suggestion });
      } catch {
        setSlugStatus({ state: "idle" });
      }
    }, 400);
    return () => clearTimeout(t);
  }, [v.slug, demoId]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const folder = useMemo(() => v.slug || "new-demo", [v.slug]);

  async function save(intent: Intent, openPreview = false) {
    setNotice(null);
    const check = demoInputSchema.safeParse(v);
    if (!check.success) {
      const fe = flattenErrors(check.error);
      setErrors(fe);
      setNotice({ kind: "error", text: "Please fix the highlighted fields." });
      const first = Object.keys(fe)[0]?.split(".")[0];
      const section = SECTION_OF[first ?? ""] ?? "business";
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    // Open the tab synchronously so popup blockers allow it; navigate it after saving.
    const previewWin = openPreview ? window.open("about:blank", "_blank") : null;
    setBusy(openPreview ? "preview" : intent);
    try {
      const res = await saveDemoAction(demoId, v, intent);
      if (!res.ok) {
        previewWin?.close();
        setErrors(res.fieldErrors ?? {});
        setNotice({ kind: "error", text: res.error });
        return;
      }
      setDirty(false);
      setErrors({});
      setV((p) => ({ ...p, isPublished: res.isPublished }));
      if (previewWin) previewWin.location.href = `/admin/preview/${res.id}`;
      setNotice({
        kind: "ok",
        text: res.isPublished ? "Saved and published." : intent === "draft" ? "Draft saved." : "Saved.",
      });
      if (!demoId) router.replace(`/admin/demos/${res.id}/edit?created=1`);
      else router.refresh();
    } catch {
      previewWin?.close();
      setNotice({ kind: "error", text: "Network error — please try again." });
    } finally {
      setBusy(null);
    }
  }

  const url = publicUrl(siteUrl, v.slug || "your-slug");

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Link href="/admin/demos" className="text-sm text-muted-foreground hover:text-foreground">
            ← All demos
          </Link>
          <h1 className="mt-1 truncate font-display text-4xl tracking-tight">
            {demoId ? v.businessName || "Edit demo" : "Create demo"}
          </h1>
          {updatedAt && <p className="text-xs text-muted-foreground">Last saved {new Date(updatedAt).toLocaleString()}</p>}
        </div>
        {demoId && savedPublished && (
          <div className="flex items-center gap-2">
            <a href={`/demo/${initial.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1 ring-border hover:bg-muted">
              <ExternalLink className="size-3.5" /> Open live
            </a>
            <CopyUrlButton slug={initial.slug} siteUrl={siteUrl} />
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        {/* Section nav */}
        <nav className="hidden lg:block">
          <ul className="sticky top-20 space-y-0.5 text-sm">
            {SECTIONS.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="block rounded-lg px-3 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-5">
          {/* 1. Business */}
          <Section id="business" title="1 · Business information">
            <TextInput label="Business name *" value={v.businessName} onChange={onBusinessName} error={err("businessName")} placeholder="Sarah Dental Clinic" />
            <Field
              label="Public URL slug *"
              error={err("slug")}
              hint={
                <>
                  {url}{" "}
                  {slugStatus.state === "checking" && <span>· checking…</span>}
                  {slugStatus.state === "ok" && <span className="text-primary-deep">· available ✓</span>}
                  {slugStatus.state === "taken" && (
                    <span className="text-destructive">
                      · taken —{" "}
                      <button type="button" className="underline" onClick={() => set("slug", slugStatus.suggestion ?? "")}>
                        use {slugStatus.suggestion}
                      </button>
                    </span>
                  )}
                </>
              }
            >
              <div className="flex items-center rounded-xl bg-background ring-1 ring-border focus-within:ring-2 focus-within:ring-primary">
                <span className="pl-3.5 font-mono text-xs text-muted-foreground">/demo/</span>
                <input
                  value={v.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-{2,}/g, "-"));
                  }}
                  onBlur={() => set("slug", slugify(v.slug))}
                  className="w-full bg-transparent py-2.5 pr-3.5 pl-1 font-mono text-sm outline-none"
                />
              </div>
            </Field>
            <TextInput label="Tagline" value={v.tagline} onChange={(x) => set("tagline", x)} placeholder="Aesthetic Dentistry & Implant Centre" />
            <TextInput label="City" value={v.city} onChange={(x) => set("city", x)} placeholder="Lahore" />
            <TextInput label="Phone *" value={v.phone} onChange={(x) => set("phone", x)} error={err("phone")} placeholder="+92 309 9306446" />
            <TextInput
              label="WhatsApp number"
              value={v.whatsapp}
              onChange={(x) => set("whatsapp", x)}
              error={err("whatsapp")}
              placeholder="923099306446"
              hint="International format, digits only. 03xx… is converted automatically. Empty = use phone."
            />
            <TextInput label="Email" type="email" value={v.email} onChange={(x) => set("email", x)} error={err("email")} />
            <TextInput label="Opening hours" value={v.openingHours} onChange={(x) => set("openingHours", x)} placeholder="Mon – Sat · 10 AM – 9 PM" />
            <TextArea label="Address" rows={2} value={v.address} onChange={(x) => set("address", x)} />
          </Section>

          {/* 2. Hero */}
          <Section id="hero" title="2 · Hero" hint="The first screen visitors see. Text after the first comma in the title is shown in the brand colour.">
            <TextInput label="Hero title" value={v.heroTitle} onChange={(x) => set("heroTitle", x)} placeholder="Bright smiles, done gently." />
            <TextInput label="CTA button text" value={v.ctaText} onChange={(x) => set("ctaText", x)} placeholder="Book an appointment" />
            <TextArea label="Hero description" value={v.heroDescription} onChange={(x) => set("heroDescription", x)} />
            <div className="sm:col-span-2">
              <ImageInput label="Hero image" value={v.heroImage} onChange={(x) => set("heroImage", x)} uploadsEnabled={uploadsEnabled} folder={folder} error={err("heroImage")} aspect="aspect-[4/5]" />
            </div>
          </Section>

          {/* 3. About + doctor */}
          <Section id="about" title="3 · About & lead dentist">
            <TextInput label="About title" value={v.aboutTitle} onChange={(x) => set("aboutTitle", x)} full />
            <TextArea label="About description" rows={5} value={v.aboutDescription} onChange={(x) => set("aboutDescription", x)} hint="Leave a blank line between paragraphs." />
            <div className="sm:col-span-2">
              <ImageInput label="About image" value={v.aboutImage} onChange={(x) => set("aboutImage", x)} uploadsEnabled={uploadsEnabled} folder={folder} error={err("aboutImage")} />
            </div>
            <TextInput label="Doctor name" value={v.doctorName} onChange={(x) => set("doctorName", x)} placeholder="Dr. Sarah Ahmed" hint="Leave empty to hide the doctor section." />
            <TextInput label="Doctor qualifications / role" value={v.doctorTitle} onChange={(x) => set("doctorTitle", x)} placeholder="BDS · Lead Dentist" />
            <TextArea label="Doctor bio" value={v.doctorBio} onChange={(x) => set("doctorBio", x)} />
            <div className="sm:col-span-2">
              <ImageInput label="Doctor photo" value={v.doctorImage} onChange={(x) => set("doctorImage", x)} uploadsEnabled={uploadsEnabled} folder={folder} aspect="aspect-[4/5]" hint="Empty = initials avatar." />
            </div>
          </Section>

          {/* 4. Services */}
          <Section id="services" title="4 · Services" hint="The first 6 appear on the home page; all appear on the Services page.">
            <ListEditor
              items={v.services}
              onChange={(x) => set("services", x)}
              make={() => ({ title: "", description: "", details: "", icon: "Sparkles" as const })}
              addLabel="Add service"
              max={40}
              render={(s, up, i) => {
                const Icon = getIcon(s.icon);
                return (
                  <>
                    <TextInput label="Title *" value={s.title} onChange={(x) => up({ title: x })} error={err(`services.${i}.title`)} />
                    <Field label="Icon">
                      <div className="flex items-center gap-2">
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary-deep">
                          <Icon className="size-5" />
                        </span>
                        <select value={s.icon} onChange={(e) => up({ icon: e.target.value as typeof s.icon })} className={inputCls}>
                          {ICON_NAMES.map((n) => (
                            <option key={n} value={n}>
                              {ICON_LABELS[n]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Field>
                    <TextArea label="Short description (card)" rows={2} value={s.description} onChange={(x) => up({ description: x })} />
                    <TextArea label="Full details (services page)" rows={3} value={s.details} onChange={(x) => up({ details: x })} />
                  </>
                );
              }}
            />
          </Section>

          {/* Why choose us */}
          <Section id="why" title="Why choose us" hint="Up to 8 short highlights. Empty = sensible defaults.">
            <ListEditor
              items={v.whyChooseUs}
              onChange={(x) => set("whyChooseUs", x)}
              make={() => ({ title: "", description: "" })}
              addLabel="Add highlight"
              max={8}
              render={(f, up, i) => (
                <>
                  <TextInput label="Headline *" value={f.title} onChange={(x) => up({ title: x })} error={err(`whyChooseUs.${i}.title`)} placeholder="Same-day" />
                  <TextInput label="Description" value={f.description} onChange={(x) => up({ description: x })} />
                </>
              )}
            />
          </Section>

          {/* 5. Testimonials */}
          <Section
            id="testimonials"
            title="5 · Testimonials"
            hint="Use real patient reviews (e.g. copied from the clinic's Google profile). If a Google Place ID is set below, live Google reviews are shown instead."
          >
            <ListEditor
              items={v.testimonials}
              onChange={(x) => set("testimonials", x)}
              make={() => ({ name: "", text: "", rating: 5 })}
              addLabel="Add testimonial"
              max={30}
              render={(t, up, i) => (
                <>
                  <TextInput label="Name *" value={t.name} onChange={(x) => up({ name: x })} error={err(`testimonials.${i}.name`)} />
                  <Field label="Rating">
                    <div className="flex gap-1 py-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button" onClick={() => up({ rating: n })} aria-label={`${n} stars`}>
                          <Star className={`size-6 ${n <= t.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
                        </button>
                      ))}
                    </div>
                  </Field>
                  <TextArea label="Review text *" value={t.text} onChange={(x) => up({ text: x })} error={err(`testimonials.${i}.text`)} />
                </>
              )}
            />
          </Section>

          {/* 6. Gallery */}
          <Section id="gallery" title="6 · Gallery" hint="Empty = 4 default clinic photos.">
            <div className="space-y-3 sm:col-span-2">
              {v.galleryImages.map((img, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex-1">
                    <ImageInput
                      label={`Image ${i + 1}`}
                      value={img}
                      onChange={(x) => set("galleryImages", v.galleryImages.map((g, k) => (k === i ? x : g)))}
                      uploadsEnabled={uploadsEnabled}
                      folder={folder}
                      error={err(`galleryImages.${i}`)}
                      aspect="aspect-square"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => set("galleryImages", v.galleryImages.filter((_, k) => k !== i))}
                    className="mt-6 rounded-md p-1.5 text-destructive hover:bg-destructive/10"
                    aria-label="Remove image"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              {v.galleryImages.length < 24 && (
                <button
                  type="button"
                  onClick={() => set("galleryImages", [...v.galleryImages, ""])}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-primary ring-1 ring-primary/30 hover:bg-primary/5"
                >
                  <Plus className="size-4" /> Add image
                </button>
              )}
            </div>
          </Section>

          {/* 7. Contact */}
          <Section id="contact" title="7 · Contact & Google" hint="Phone, WhatsApp, email and address are edited in section 1.">
            <TextInput
              label="Google Maps URL"
              value={v.googleMapsUrl}
              onChange={(x) => set("googleMapsUrl", x)}
              error={err("googleMapsUrl")}
              full
              placeholder="https://maps.app.goo.gl/…"
              hint="Used for “Get directions” and “Read reviews”. The embedded map uses the address."
            />
            <TextInput label="Google rating" type="number" step="0.1" min="0" max="5" value={String(v.googleRating)} onChange={(x) => set("googleRating", Number(x) || 0)} error={err("googleRating")} hint="0 = hide rating" />
            <TextInput label="Google review count" type="number" min="0" value={String(v.googleReviewCount)} onChange={(x) => set("googleReviewCount", Math.floor(Number(x)) || 0)} />
            <TextInput
              label="Google Place ID (optional — live reviews)"
              value={v.googlePlaceId}
              onChange={(x) => set("googlePlaceId", x)}
              full
              placeholder="ChIJ…"
              hint="Requires GOOGLE_PLACES_API_KEY on the server. Shows up to 5 live Google reviews."
            />
          </Section>

          {/* 8. Social */}
          <Section id="social" title="8 · Social media">
            <TextInput label="Facebook URL" value={v.facebookUrl} onChange={(x) => set("facebookUrl", x)} error={err("facebookUrl")} />
            <TextInput label="Instagram URL" value={v.instagramUrl} onChange={(x) => set("instagramUrl", x)} error={err("instagramUrl")} />
            <TextInput label="TikTok URL" value={v.tiktokUrl} onChange={(x) => set("tiktokUrl", x)} error={err("tiktokUrl")} />
          </Section>

          {/* 9. Design */}
          <Section id="design" title="9 · Design">
            <ColorInput label="Primary colour" value={v.primaryColor} onChange={(x) => set("primaryColor", x)} error={err("primaryColor")} />
            <ColorInput label="Secondary / accent colour" value={v.secondaryColor} onChange={(x) => set("secondaryColor", x)} error={err("secondaryColor")} />
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              {[
                ["Teal", "#14b8a6", "#f97349"],
                ["Blue", "#2563eb", "#f59e0b"],
                ["Green", "#16a34a", "#0ea5e9"],
                ["Purple", "#7c3aed", "#ec4899"],
                ["Navy", "#1e3a8a", "#06b6d4"],
                ["Rose", "#e11d48", "#0f766e"],
              ].map(([name, p, s]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    set("primaryColor", p!);
                    set("secondaryColor", s!);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-border hover:bg-muted"
                >
                  <span className="size-3 rounded-full" style={{ background: p }} />
                  <span className="size-3 rounded-full" style={{ background: s }} />
                  {name}
                </button>
              ))}
            </div>
            <div className="sm:col-span-2">
              <ImageInput label="Logo" value={v.logo} onChange={(x) => set("logo", x)} uploadsEnabled={uploadsEnabled} folder={folder} error={err("logo")} aspect="aspect-square" hint="Square PNG/SVG works best. Empty = first letter of the name." />
            </div>
            {/* Live colour preview */}
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-background p-4 ring-1 ring-border sm:col-span-2">
              <span className="rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: v.primaryColor }}>
                {v.ctaText || "Book an appointment"}
              </span>
              <span className="rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: v.secondaryColor }}>
                WhatsApp us
              </span>
              <span className="font-display text-2xl" style={{ color: v.primaryColor }}>
                {v.businessName || "Your clinic"}
              </span>
            </div>
          </Section>

          {/* SEO */}
          <Section id="seo" title="SEO (optional)" hint="Leave empty to auto-generate from the business name, tagline and hero text.">
            <TextInput label="Page title" value={v.metaTitle} onChange={(x) => set("metaTitle", x)} full />
            <TextArea label="Meta description" rows={2} value={v.metaDescription} onChange={(x) => set("metaDescription", x)} />
          </Section>

          {/* 10. Publishing */}
          <Section id="publishing" title="10 · Publishing">
            <div className="flex items-center justify-between gap-4 rounded-xl bg-background p-4 ring-1 ring-border sm:col-span-2">
              <div>
                <div className="font-semibold">{v.isPublished ? "Published" : "Draft"}</div>
                <div className="text-xs text-muted-foreground">
                  {v.isPublished ? `Anyone with the link can view ${url}` : "Only you can see it (via Preview)."}
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={v.isPublished}
                onClick={() => set("isPublished", !v.isPublished)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${v.isPublished ? "bg-primary" : "bg-muted-foreground/30"}`}
              >
                <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${v.isPublished ? "left-6" : "left-1"}`} />
              </button>
            </div>
          </Section>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3">
          <div className="mr-auto min-w-0 text-sm">
            {notice ? (
              <span className={notice.kind === "ok" ? "text-primary-deep" : "text-destructive"}>
                {notice.kind === "ok" && <Check className="mr-1 inline size-4" />}
                {notice.text}
              </span>
            ) : dirty ? (
              <span className="text-muted-foreground">Unsaved changes</span>
            ) : (
              <span className="text-muted-foreground">{v.isPublished ? "Published" : "Draft"}</span>
            )}
          </div>
          <button
            type="button"
            disabled={!!busy}
            onClick={() => save("save")}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold ring-1 ring-border hover:bg-muted disabled:opacity-60"
          >
            {(busy === "draft" || busy === "save") && <Loader2 className="size-4 animate-spin" />}
            {v.isPublished ? "Save changes" : "Save draft"}
          </button>
          <button
            type="button"
            disabled={!!busy}
            onClick={() => save("save", true)}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold ring-1 ring-border hover:bg-muted disabled:opacity-60"
          >
            {busy === "preview" ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />} Preview
          </button>
          {savedPublished && demoId ? (
            <button
              type="button"
              disabled={!!busy}
              onClick={() => save("draft")}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-destructive ring-1 ring-destructive/30 hover:bg-destructive/5 disabled:opacity-60"
            >
              Unpublish
            </button>
          ) : (
            <button
              type="button"
              disabled={!!busy}
              onClick={() => save("publish")}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-60"
            >
              {busy === "publish" && <Loader2 className="size-4 animate-spin" />} Publish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Maps a top-level field to the form section that contains it (for scroll-to-error). */
const SECTION_OF: Record<string, string> = {
  businessName: "business", slug: "business", phone: "business", whatsapp: "business", email: "business",
  heroImage: "hero", aboutImage: "about", doctorImage: "about", services: "services", whyChooseUs: "why",
  testimonials: "testimonials", galleryImages: "gallery", googleMapsUrl: "contact", googleRating: "contact",
  facebookUrl: "social", instagramUrl: "social", tiktokUrl: "social",
  primaryColor: "design", secondaryColor: "design", logo: "design",
};
