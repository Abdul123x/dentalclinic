import type { ResolvedDemo } from "@/lib/defaults";
import { Reveal } from "./Reveal";
import { SectionLabel } from "./SectionLabel";

/** Lead dentist profile. Hidden when no doctor name is set. */
export function Doctors({ data }: { data: ResolvedDemo }) {
  if (!data.doctorName) return null;
  const initials = data.doctorName
    .replace(/^dr\.?\s*/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <section id="doctor" className="border-y border-border bg-surface">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          {data.doctorImage ? (
            <img
              src={data.doctorImage}
              alt={data.doctorName}
              loading="lazy"
              className="aspect-[4/5] w-full rounded-[28px] object-cover"
            />
          ) : (
            <div className="grid aspect-[4/5] w-full place-items-center rounded-[28px] bg-primary/12 font-display text-8xl text-primary">
              {initials}
            </div>
          )}
        </Reveal>
        <Reveal delay={100} className="lg:col-span-7">
          <SectionLabel>Meet your dentist</SectionLabel>
          <h2 className="font-display text-4xl tracking-tight md:text-6xl">{data.doctorName}</h2>
          {data.doctorTitle && (
            <div className="mt-2 font-mono text-xs tracking-wider text-primary uppercase">{data.doctorTitle}</div>
          )}
          <p className="mt-5 max-w-[55ch] text-pretty text-muted-foreground">
            {data.doctorBio ||
              "“I believe a dental visit should feel calm, not scary. We take the time to explain, and we never rush.”"}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
