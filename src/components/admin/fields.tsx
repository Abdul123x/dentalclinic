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

/** Uploads straight to Cloudinary using a server-issued signature. */
async function uploadToCloudinary(file: File, folder: string) {
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
  // Ask Cloudinary for auto format/quality to keep pages fast.
  return json.secure_url.replace("/upload/", "/upload/f_auto,q_auto/");
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  uploadsEnabled: boolean;
  folder: string;
  error?: string;
  hint?: string;
  aspect?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setUploadError("Please choose an image file.");
    if (file.size > 10 * 1024 * 1024) return setUploadError("Image must be under 10 MB.");
    setBusy(true);
    setUploadError("");
    try {
      onChange(await uploadToCloudinary(file, folder || "misc"));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex gap-3">
        <div className={`relative w-28 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border ${aspect}`}>
          {value ? (
            <img src={value} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-muted-foreground">
              <ImageIcon className="size-6" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://… (leave empty for default)"
            className={`${inputCls} ${error ? "ring-destructive" : ""}`}
          />
          <div className="flex flex-wrap gap-2">
            {uploadsEnabled && (
              <>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary-deep hover:bg-primary/20 disabled:opacity-60"
                >
                  {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  {busy ? "Uploading…" : "Upload"}
                </button>
              </>
            )}
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border hover:text-foreground"
              >
                <X className="size-3.5" /> Clear
              </button>
            )}
          </div>
          {(error || uploadError) && <p className="text-xs text-destructive">{error || uploadError}</p>}
          {!error && !uploadError && hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
