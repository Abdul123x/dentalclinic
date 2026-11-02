import type { ResolvedDemo } from "@/lib/defaults";

export function Logo({ demo, light = false }: { demo: ResolvedDemo; light?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      {demo.logo ? (
        <img src={demo.logo} alt={`${demo.businessName} logo`} className="size-10 shrink-0 object-contain" />
      ) : (
        <span
          className={`grid size-10 shrink-0 place-items-center border font-serif text-[22px] leading-none ${
            light ? "border-white/30 text-white" : "border-foreground/80 text-foreground"
          }`}
        >
          {demo.initial}
        </span>
      )}
      <span className="min-w-0 leading-tight">
        <span className={`block truncate font-serif text-[21px] ${light ? "text-white" : "text-foreground"}`}>
          {demo.businessName}
        </span>
        {(demo.tagline || demo.city) && (
          <span
            className={`block truncate text-[11px] font-medium tracking-[0.08em] uppercase ${
              light ? "text-white/60" : "text-muted-foreground"
            }`}
          >
            {demo.tagline || `Dental clinic · ${demo.city}`}
          </span>
        )}
      </span>
    </span>
  );
}
