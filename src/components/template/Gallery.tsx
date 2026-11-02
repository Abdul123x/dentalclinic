import { container, eyebrow } from "./ui";

/** One large image + smaller ones, like a printed brochure spread. */
export function Gallery({ images, businessName }: { images: string[]; businessName: string }) {
  if (!images.length) return null;
  const [first, ...rest] = images;
  const small = rest.slice(0, 4);
  return (
    <section id="gallery" className="border-t border-border bg-paper py-20 md:py-28">
      <div className={container}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className={eyebrow}>The clinic</p>
          <p className="max-w-md text-[15px] text-muted-foreground">
            A clean, calm space with sterilised instruments and modern equipment.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-[280px_280px]">
          <img
            src={first}
            alt={`${businessName} — photo 1`}
            loading="lazy"
            className="photo col-span-2 aspect-square w-full rounded-[4px] object-cover md:row-span-2 md:aspect-auto md:h-full"
          />
          {small.map((src, i) => (
            <img
              key={`${src}-${i}`}
              src={src}
              alt={`${businessName} — photo ${i + 2}`}
              loading="lazy"
              className={`photo aspect-square w-full rounded-[4px] object-cover md:aspect-auto md:h-full ${
                small.length === 3 && i === 2 ? "col-span-2 aspect-[2/1]" : ""
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
