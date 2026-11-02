import Link from "next/link";

import type { ResolvedDemo } from "@/lib/defaults";
import { slugify } from "@/lib/slug";
import { telLink, whatsappLink } from "@/lib/whatsapp";
import { Logo } from "./Logo";
import { container } from "./ui";

export function Footer({ data, basePath }: { data: ResolvedDemo; basePath: string }) {
  const socials = [
    { url: data.facebookUrl, label: "Facebook" },
    { url: data.instagramUrl, label: "Instagram" },
    { url: data.tiktokUrl, label: "TikTok" },
  ].filter((s) => s.url);
  const wa = whatsappLink(data.whatsapp);
  const head = "mb-5 text-[12px] font-semibold tracking-[0.14em] text-ink-foreground/45 uppercase";
  const link = "text-ink-foreground/75 transition-colors hover:text-white";

  return (
    <footer className="bg-ink pb-24 text-[15px] text-ink-foreground md:pb-0">
      <div className={`${container} grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12 lg:py-20`}>
        <div className="lg:col-span-4">
          <Logo demo={data} light />
          <p className="mt-6 max-w-xs leading-relaxed text-ink-foreground/60">
            {data.tagline ? `${data.tagline}. ` : ""}
            Modern dental care{data.city ? ` in ${data.city}` : ""} for the whole family.
          </p>
          {socials.length > 0 && (
            <div className="mt-6 flex gap-5">
              {socials.map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className={`${link} text-sm font-semibold`}>
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className={head}>Contact</div>
          <ul className="space-y-3">
            <li>
              <a href={telLink(data.phone)} className={link}>
                {data.phone}
              </a>
            </li>
            {wa && (
              <li>
                <a href={wa} target="_blank" rel="noreferrer" className={link}>
                  WhatsApp
                </a>
              </li>
            )}
            {data.email && (
              <li>
                <a href={`mailto:${data.email}`} className={`${link} break-all`}>
                  {data.email}
                </a>
              </li>
            )}
            {data.address && <li className="leading-relaxed whitespace-pre-line text-ink-foreground/60">{data.address}</li>}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <div className={head}>Treatments</div>
          <ul className="space-y-3">
            {data.services.slice(0, 6).map((s, i) => (
              <li key={`${s.title}-${i}`}>
                <Link href={`${basePath}/services#${slugify(s.title)}`} className={link}>
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <div className={head}>Hours</div>
          <p className="leading-relaxed whitespace-pre-line text-ink-foreground/75">{data.openingHours || "Call for timings"}</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className={`${container} flex flex-wrap justify-between gap-3 py-6 text-[13px] text-ink-foreground/45`}>
          <span>
            © {new Date().getFullYear()} {data.businessName}
            {data.city ? `, ${data.city}` : ""}
          </span>
          <a href="#" className="hover:text-white">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
