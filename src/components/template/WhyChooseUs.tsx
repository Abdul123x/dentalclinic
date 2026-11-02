import type { Feature } from "@/lib/validation";
import { container } from "./ui";

/** Four short reasons, set as a quiet ruled strip under the hero. */
export function WhyChooseUs({ data }: { data: Feature[]; businessName: string }) {
  if (!data.length) return null;
  return (
    <section aria-label="Why patients choose us" className="border-b border-border bg-paper">
      <div className={container}>
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {data.slice(0, 4).map((f, i) => (
            <div key={`${f.title}-${i}`} className="bg-paper py-8 sm:px-6 lg:px-8 lg:py-10 lg:first:pl-0">
              <div className="font-serif text-sm text-primary-deep">0{i + 1}</div>
              <h3 className="mt-3 text-[22px] leading-tight">{f.title}</h3>
              {f.description && <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{f.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
