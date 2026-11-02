import type { ResolvedDemo } from "@/lib/defaults";
import { container, eyebrow, h2 } from "./ui";

export function About({ data }: { data: ResolvedDemo }) {
  const paragraphs = data.aboutDescription.split(/\n{2,}|\r\n\r\n/);
  return (
    <section id="about" className="scroll-mt-24 border-t border-border bg-paper py-20 md:py-28">
      <div className={`${container} grid items-center gap-12 lg:grid-cols-12 lg:gap-16`}>
        <div className="lg:col-span-6">
          <img
            src={data.aboutImage}
            alt={`Inside ${data.businessName}`}
            loading="lazy"
            className="photo aspect-[5/4] w-full rounded-[4px] object-cover"
          />
        </div>
        <div className="lg:col-span-6">
          <p className={eyebrow}>About the clinic</p>
          <h2 className={`${h2} mt-5`}>{data.aboutTitle}</h2>
          <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-pretty text-muted-foreground">
            {paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? "text-foreground/85" : ""}>
                {p}
              </p>
            ))}
          </div>
          {(data.address || data.openingHours) && (
            <dl className="mt-10 grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
              {data.address && (
                <div>
                  <dt className="text-[12px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Find us</dt>
                  <dd className="mt-2 text-[15px] leading-relaxed whitespace-pre-line">{data.address}</dd>
                </div>
              )}
              {data.openingHours && (
                <div>
                  <dt className="text-[12px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Hours</dt>
                  <dd className="mt-2 text-[15px] leading-relaxed whitespace-pre-line">{data.openingHours}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}
