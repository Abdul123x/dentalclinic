import type { ResolvedDemo } from "@/lib/defaults";
import { Reveal } from "./Reveal";
import { SectionLabel } from "./SectionLabel";

export function About({ data }: { data: ResolvedDemo }) {
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16">
      <div className="grid items-center gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-6">
          <img
            src={data.aboutImage}
            alt={`Inside ${data.businessName}`}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-[28px] object-cover"
          />
        </Reveal>
        <Reveal delay={100} className="lg:col-span-6">
          <SectionLabel>About us</SectionLabel>
          <h2 className="mb-5 text-balance font-display text-4xl tracking-tight md:text-5xl">{data.aboutTitle}</h2>
          <div className="space-y-4 text-pretty text-muted-foreground">
            {data.aboutDescription.split(/\n{2,}|\r\n\r\n/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
