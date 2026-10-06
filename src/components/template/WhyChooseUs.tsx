import type { Feature } from "@/lib/validation";
import { Reveal } from "./Reveal";
import { SectionLabel } from "./SectionLabel";

export function WhyChooseUs({ data, businessName }: { data: Feature[]; businessName: string }) {
  if (!data.length) return null;
  return (
    <section id="why" className="mx-auto max-w-6xl px-5 py-16">
      <Reveal>
        <SectionLabel>Why {businessName}</SectionLabel>
        <h2 className="mb-8 text-balance font-display text-4xl tracking-tight md:text-5xl">
          A clinic that feels like a deep breath
        </h2>
      </Reveal>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((s, i) => (
          <Reveal key={`${s.title}-${i}`} delay={i * 70}>
            <div className="h-full rounded-3xl bg-surface p-6 ring-1 ring-border">
              <div className={`mb-2 font-display text-3xl ${i % 2 === 0 ? "text-primary" : "text-accent"}`}>{s.title}</div>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
