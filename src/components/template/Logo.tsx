import type { ResolvedDemo } from "@/lib/defaults";

export function Logo({ demo, small = false }: { demo: ResolvedDemo; small?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      {demo.logo ? (
        <img
          src={demo.logo}
          alt={`${demo.businessName} logo`}
          className={`shrink-0 object-contain ${small ? "size-7 rounded-lg" : "size-9 rounded-xl"}`}
        />
      ) : (
        <span
          className={`grid shrink-0 place-items-center bg-primary font-display text-primary-foreground ${
            small ? "size-7 rounded-lg text-sm" : "size-9 rounded-xl text-lg"
          }`}
        >
          {demo.initial}
        </span>
      )}
      <span className="min-w-0 leading-none">
        <span className={`block truncate font-display tracking-tight uppercase ${small ? "" : "text-lg"}`}>
          {demo.businessName}
        </span>
        {!small && (demo.tagline || demo.city) && (
          <span className="hidden truncate font-mono text-[10px] tracking-wider text-muted-foreground uppercase sm:block">
            {[demo.tagline, demo.city].filter(Boolean).join(" · ")}
          </span>
        )}
      </span>
    </span>
  );
}
