"use client";

import { useRef, useState, type ReactNode } from "react";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";

export const inputCls =
  "w-full rounded-xl bg-background px-3.5 py-2.5 text-sm ring-1 ring-border outline-none focus:ring-2 focus:ring-primary";

export function Section({ id, title, hint, children }: { id: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32 rounded-2xl bg-surface p-5 ring-1 ring-border md:p-6">
      <h2 className="font-semibold">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function Field({
  label,
  error,
  hint,
  full,
  children,
}: {
  label: string;
  error?: string;
  hint?: ReactNode;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-destructive">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  error,
  hint,
  full,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: ReactNode;
  full?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <Field label={label} error={error} hint={hint} full={full}>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={`${inputCls} ${error ? "ring-destructive" : ""}`}
      />
    </Field>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  error,
  hint,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: ReactNode;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <Field label={label} error={error} hint={hint} full>
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={`${inputCls} ${error ? "ring-destructive" : ""}`}
      />
    </Field>
  );
}

export function ColorInput({ label, value, onChange, error }: { label: string; value: string; onChange: (v: string) => void; error?: string }) {
  return (
    <Field label={label} error={error}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded-lg bg-background ring-1 ring-border"
        />
        <input value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} font-mono`} maxLength={7} />
      </div>
    </Field>
  );
}

/** Optional: uploads straight to Cloudinary when it's configured (server-issued signature). */
async function uploadToCloudinary(file: Blob, folder: string) {
  const signRes = await fetch("/api/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  if (!signRes.ok) throw new Error("Upload is not available");
  const s = (await signRes.json()) as { cloudName: string; apiKey: string; folder: string; timestamp: number; signature: string };
  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", s.apiKey);
  fd.append("timestamp", String(s.timestamp));
  fd.append("signature", s.signature);
  fd.append("folder", s.folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`, { method: "POST", body: fd });
  const json = (await res.json()) as { secure_url?: string; error?: { message: string } };
  if (!res.ok || !json.secure_url) throw new Error(json.error?.message ?? "Upload failed");
  return json.secure_url.replace("/upload/", "/upload/f_auto,q_auto/");
}

/** Default: stores the image in our own MongoDB — no extra account or links needed. */
async function uploadToDatabase(file: Blob, folder: string) {
  const fd = new FormData();
  fd.append("file", file, "image");
  fd.append("folder", folder);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (res.status === 401) throw new Error("Your login expired — please log in again.");
  if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed");
  return json.url;
}

/**
 * Shrinks a phone photo (often 5–10 MB) to a web-friendly size in the browser before uploading.
 * PNGs stay PNG (keeps logo transparency); everything else becomes JPEG.
 */
async function compressImage(file: File, maxDim: number): Promise<Blob> {
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("This image couldn't be read. Try a JPG or PNG."));
      el.src = url;
    });
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    const keepPng = file.type === "image/png";
    if (!keepPng) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, keepPng ? "image/png" : "image/jpeg", 0.84));
    if (!blob) return file;
    return blob.size < file.size || scale < 1 ? blob : file;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function ImageInput({
  label,
  value,
  onChange,
  uploadsEnabled,
  folder,
  error,
  hint,
  aspect = "aspect-[4/3]",
  maxDim = 1800,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  /** true when Cloudinary is configured; otherwise images are stored in MongoDB. */
  uploadsEnabled: boolean;
  folder: string;
  error?: string;
  hint?: string;
  aspect?: string;
  maxDim?: number;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setUploadError("Please choose a photo (JPG, PNG or WebP).");
    if (file.size > 25 * 1024 * 1024) return setUploadError("That photo is over 25 MB — please pick a smaller one.");
    setBusy(true);
    setUploadError("");
    try {
      const small = await compressImage(file, maxDim);
      if (small.size > 4 * 1024 * 1024) throw new Error("Image is still over 4 MB after compressing. Try another photo.");
      const url = uploadsEnabled ? await uploadToCloudinary(small, folder || "misc") : await uploadToDatabase(small, folder || "misc");
      onChange(url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const msg = error || uploadError;

  return (
    <div className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            onFile(e.dataTransfer.files?.[0]);
          }}
          title="Click or drop a photo"
          className={`group relative w-32 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 transition ${aspect} ${
            dragging ? "ring-2 ring-primary" : msg ? "ring-destructive" : "ring-border hover:ring-primary"
          }`}
        >
          {value ? (
            <>
              <img src={value} alt="" className="absolute inset-0 size-full object-cover" />
              <span className="absolute inset-0 grid place-items-center bg-black/45 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                Change
              </span>
            </>
          ) : (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2 text-center text-muted-foreground">
              <ImageIcon className="size-6" />
              <span className="text-[11px] leading-tight font-medium">Click or drop photo</span>
            </span>
          )}
          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-background/70">
              <Loader2 className="size-6 animate-spin text-primary" />
            </span>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
              {busy ? "Uploading…" : value ? "Replace photo" : "Choose photo"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground ring-1 ring-border hover:text-foreground"
              >
                <X className="size-3.5" /> Remove
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowLink((v) => !v)}
              className="px-1 py-2 text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              {showLink ? "Hide link" : "Use a link instead"}
            </button>
          </div>
          {showLink && (
            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://… (optional)"
              className={`${inputCls} ${error ? "ring-destructive" : ""}`}
            />
          )}
          {msg ? (
            <p className="text-xs text-destructive">{msg}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {hint ? `${hint} ` : ""}JPG or PNG from your phone or computer — it&apos;s resized automatically.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
