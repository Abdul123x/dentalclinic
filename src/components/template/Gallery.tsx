import { Reveal } from "./Reveal";
import { SectionLabel } from "./SectionLabel";

export function Gallery({ images, businessName }: { images: string[]; businessName: string }) {
  if (!images.length) return null;
  return (
    <section id="gallery" className="mx-auto max-w-6xl px-5 py-16">
      <Reveal>
        <SectionLabel className="mb-6">Inside the clinic</SectionLabel>
      </Reveal>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {images.map((src, i) => (
          <Reveal key={`${src}-${i}`} delay={(i % 4) * 70}>
            <img
              src={src}
              alt={`${businessName} — photo ${i + 1}`}
              loading="lazy"
              className="aspect-square w-full rounded-2xl object-cover transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.03]"
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
