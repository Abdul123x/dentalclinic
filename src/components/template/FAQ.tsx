import { Plus } from "lucide-react";

import type { ResolvedDemo } from "@/lib/defaults";
import { container, eyebrow, h2 } from "./ui";

export function FAQ({ data }: { data: ResolvedDemo }) {
  const faqs = [
    {
      q: "How much will my treatment cost?",
      a: "Every mouth is different, so we examine first and agree the cost with you before starting. Call or message us for an estimate for a specific treatment.",
    },
    {
      q: "Do I need an appointment?",
      a: `Appointments are recommended so you don't have to wait. For toothache, swelling or a broken tooth, call ${data.phone} and we'll try to see you the same day.`,
    },
    {
      q: "Will it hurt?",
      a: "Procedures that need it are done under local anaesthetic, and we explain each step as we go. Tell us if you feel anxious — we'll take it slowly.",
    },
    {
      q: "Can treatment be done in one visit?",
      a: "Check-ups, cleanings, fillings, whitening and many root canals are done in a single visit. Crowns, implants, dentures and braces need a few appointments.",
    },
    ...(data.address
      ? [{ q: "Where are you located?", a: `${data.address}${data.openingHours ? `. Opening hours: ${data.openingHours}.` : ""}` }]
      : []),
  ];
  return (
    <section id="faq" className="border-t border-border py-20 md:py-28">
      <div className={`${container} grid gap-12 lg:grid-cols-12`}>
        <div className="lg:col-span-4">
          <p className={eyebrow}>Questions</p>
          <h2 className={`${h2} mt-5`}>Before your visit</h2>
        </div>
        <div className="border-t border-foreground/80 lg:col-span-8">
          {faqs.map((f) => (
            <details key={f.q} className="group border-b border-border">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-serif text-[22px] leading-snug [&::-webkit-details-marker]:hidden">
                {f.q}
                <Plus className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-45" />
              </summary>
              <p className="max-w-[62ch] pb-7 text-[16px] leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
