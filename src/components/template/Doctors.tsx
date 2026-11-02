import type { ResolvedDemo } from "@/lib/defaults";
import { whatsappLink } from "@/lib/whatsapp";
import { btnInk, container, eyebrow, textLink } from "./ui";

/** Lead dentist profile. Hidden when no doctor name is set. */
export function Doctors({ data }: { data: ResolvedDemo }) {
  if (!data.doctorName) return null;

  const plainName = data.doctorName.replace(/^dr\.?\s*/i, "").trim();
  const initials = plainName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const specialties = (
    data.doctorSpecialties.filter(Boolean).length
      ? data.doctorSpecialties.filter(Boolean)
      : data.services.slice(0, 4).map((s) => s.title)
  ).slice(0, 8);
  const bio =
    data.doctorBio ||
    `${data.doctorName} leads the team at ${data.businessName}${data.city ? ` in ${data.city}` : ""}, providing modern, careful dentistry for the whole family — from routine check-ups to cosmetic and restorative treatment. Every option, and its cost, is explained clearly before treatment begins.`;
  // Only show a quote the clinic actually gave us — never put invented words in a real doctor's mouth.
  const quote = data.doctorQuote.replace(/^["“]|["”]$/g, "");
  const wa = whatsappLink(data.whatsapp, `Assalam o Alaikum, I'd like to book an appointment with ${data.doctorName}.`);

  const facts = [
    data.doctorTitle && { label: "Qualifications", value: data.doctorTitle },
    data.doctorExperience && { label: "Experience", value: data.doctorExperience },
    specialties.length > 0 && { label: "Special interests", value: specialties.join(" · ") },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <section id="doctor" className="scroll-mt-24 py-20 md:py-28">
      <div className={`${container} grid gap-12 lg:grid-cols-12 lg:gap-16`}>
        <div className="lg:col-span-5">
          {data.doctorImage ? (
            <img
              src={data.doctorImage}
              alt={data.doctorName}
              loading="lazy"
              className="photo aspect-[4/5] w-full rounded-[4px] object-cover object-top"
            />
          ) : (
            <div className="grid aspect-[4/5] w-full place-items-center rounded-[4px] bg-paper font-serif text-[120px] text-foreground/20">
              {initials}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center lg:col-span-7">
          <p className={eyebrow}>Meet your dentist</p>
          <h2 className="mt-5 text-[clamp(2.6rem,5vw,4rem)] leading-none">{data.doctorName}</h2>

          {quote && (
            <blockquote className="mt-8 border-l-2 border-primary pl-6 font-serif text-[clamp(1.35rem,2.2vw,1.75rem)] leading-snug text-foreground/90 italic">
              “{quote}”
            </blockquote>
          )}

          <div className="mt-8 space-y-4 text-[16px] leading-relaxed text-pretty text-muted-foreground">
            {bio.split(/\n{2,}/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {facts.length > 0 && (
            <dl className="mt-10 divide-y divide-border border-y border-border">
              {facts.map((f) => (
                <div key={f.label} className="grid gap-1 py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
                  <dt className="text-[12px] font-semibold tracking-[0.12em] text-muted-foreground uppercase sm:pt-0.5">
                    {f.label}
                  </dt>
                  <dd className="text-[15px] font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a href="#book" className={btnInk}>
              Book with {data.doctorName}
            </a>
            {wa && (
              <a href={wa} target="_blank" rel="noreferrer" className={textLink}>
                Ask a question on WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
