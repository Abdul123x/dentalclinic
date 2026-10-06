import type { ResolvedDemo } from "@/lib/defaults";
import { Logo } from "./Logo";

export function Footer({ data }: { data: ResolvedDemo }) {
  const socials = [
    { kind: "facebook" as const, url: data.facebookUrl, label: "Facebook" },
    { kind: "instagram" as const, url: data.instagramUrl, label: "Instagram" },
    { kind: "tiktok" as const, url: data.tiktokUrl, label: "TikTok" },
  ].filter((s) => s.url);
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
        <Logo demo={data} small />
        {socials.length > 0 && (
          <div className="flex gap-2">
            {socials.map((s) => (
              <a
                key={s.kind}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-border transition-colors hover:bg-primary hover:text-primary-foreground hover:ring-primary"
              >
                {s.label}
              </a>
            ))}
          </div>
        )}
        <p className="text-center font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
          © {new Date().getFullYear()} {data.businessName}
          {data.city ? ` · ${data.city}` : ""}
        </p>
      </div>
    </footer>
  );
}
