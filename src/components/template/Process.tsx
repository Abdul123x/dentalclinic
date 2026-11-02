import type { ResolvedDemo } from "@/lib/defaults";
import { container, eyebrowLight, h2 } from "./ui";

/** "Your first visit" — what patients want to know before they call. Generic and true for any clinic. */
export function Process({ data }: { data: ResolvedDemo }) {
  const steps = [
    {
      title: "Get in touch",
      body: `Call ${data.phone}${data.whatsapp ? ", send a WhatsApp message" : ""} or use the form below. We'll find a time that suits you.`,
    },
    {
      title: "Examination & plan",
      body: "A full check of your teeth and gums, X-rays if needed, and a clear explanation of what we find — with options and costs before anything starts.",
    },
    {
      title: "Treatment & aftercare",
      body: "Treatment at a pace you're comfortable with, written aftercare advice, and follow-up visits to make sure everything has settled.",
    },
  ];
  return (
    <section className="bg-ink py-20 text-ink-foreground md:py-28">
      <div className={container}>
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className={eyebrowLight}>Your first visit</p>
            <h2 className={`${h2} mt-5 text-white`}>What to expect at {data.businessName}</h2>
          </div>
        </div>
        <ol className="mt-14 grid gap-px bg-white/12 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="bg-ink py-8 md:px-8 md:first:pl-0">
              <div className="font-serif text-5xl text-white/25">{i + 1}</div>
              <h3 className="mt-6 text-2xl text-white">{s.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-foreground/65">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
