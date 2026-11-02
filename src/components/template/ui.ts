/** Shared class names for the clinic template. One place to tweak the look of every demo. */
export const container = "mx-auto w-full max-w-[1200px] px-5 md:px-8";

const btn =
  "inline-flex items-center justify-center gap-2 h-12 px-6 text-[15px] font-semibold rounded-[3px] transition-colors whitespace-nowrap";
export const btnPrimary = `${btn} bg-primary text-primary-foreground hover:bg-primary-deep`;
export const btnInk = `${btn} bg-ink text-ink-foreground hover:bg-ink/85`;
export const btnOutline = `${btn} border border-foreground/25 text-foreground hover:border-foreground`;
export const btnOutlineLight = `${btn} border border-white/30 text-white hover:border-white`;

const eyebrowBase =
  "flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.14em] before:h-px before:w-7 before:bg-current";
export const eyebrow = `${eyebrowBase} text-primary-deep`;
export const eyebrowLight = `${eyebrowBase} text-ink-foreground/55`;

export const h2 = "text-[clamp(2rem,4vw,3rem)] leading-[1.05]";

export const textLink =
  "inline-flex items-center gap-1.5 font-semibold text-foreground underline decoration-foreground/25 underline-offset-[6px] transition-colors hover:decoration-primary";
