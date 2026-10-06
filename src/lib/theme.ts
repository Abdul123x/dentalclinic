import type { CSSProperties } from "react";

function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0]! + 0.7152 * ch[1]! + 0.0722 * ch[2]!;
}

/** White text on dark brand colours, dark text on light ones (WCAG contrast). */
function readableOn(hex: string) {
  const L = luminance(hex);
  const contrastWhite = 1.05 / (L + 0.05);
  const contrastDark = (L + 0.05) / 0.0503; // ~#1b2733
  return contrastWhite >= contrastDark ? "#ffffff" : "#13202b";
}

const safeHex = (v: string, fallback: string) => (/^#[0-9a-f]{6}$/i.test(v) ? v : fallback);

/**
 * Brand colours → CSS variables. Applied as an inline style on the template's root element,
 * so every component using bg-primary / text-accent / ring-primary picks up the client's colours.
 */
export function themeVars(primaryColor: string, secondaryColor: string): CSSProperties {
  const primary = safeHex(primaryColor, "#14b8a6");
  const accent = safeHex(secondaryColor, "#f97349");
  return {
    "--primary": primary,
    "--primary-foreground": readableOn(primary),
    "--primary-deep": `color-mix(in oklch, ${primary} 78%, black)`,
    "--accent": accent,
    "--accent-foreground": readableOn(accent),
    "--ring": primary,
  } as CSSProperties;
}
