import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { slugify } from "@/lib/slug";
import type { Service } from "@/lib/validation";
import { container, eyebrow, h2, textLink } from "./ui";

/** Editorial numbered list instead of an icon-card grid. */
export function Services({ data, basePath }: { data: Service[]; basePath: string }) {
  if (!data.length) return null;
  const list = data.slice(0, 6);
  return (
    <section id="services" className="scroll-mt-24 py-20 md:py-28">
      <div className={`${container} grid gap-12 lg:grid-cols-12`}>
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <p className={eyebrow}>Treatments</p>
            <h2 className={`${h2} mt-5`}>Complete dental care under one roof</h2>
            <p className="mt-5 text-[16px] leading-relaxed text-muted-foreground">
              From routine check-ups to implants and cosmetic work, every treatment starts with an examination and a
              clear explanation of your options and costs.
            </p>
            <Link href={`${basePath}/services`} className={`${textLink} mt-8`}>
              View all {data.length} treatments
            </Link>
          </div>
        </div>
        <ol className="border-t border-foreground/80 lg:col-span-8">
          {list.map((s, i) => (
            <li key={`${s.title}-${i}`} className="border-b border-border">
              <Link
                href={`${basePath}/services#${slugify(s.title)}`}
                className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 py-7 sm:grid-cols-[3.5rem_1fr_auto] md:py-8"
              >
                <span className="font-serif text-[15px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block font-serif text-[26px] leading-tight transition-colors group-hover:text-primary-deep md:text-[30px]">
                    {s.title}
                  </span>
                  {s.description && (
                    <span className="mt-2 block max-w-[52ch] text-[15px] leading-relaxed text-muted-foreground">
                      {s.description}
                    </span>
                  )}
                </span>
                <ArrowUpRight className="size-5 self-center text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
