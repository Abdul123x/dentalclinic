import {
  Activity,
  AlignHorizontalDistributeCenter,
  Anchor,
  Baby,
  Brush,
  Crown,
  HeartPulse,
  Layers,
  Link2,
  MessageCircle,
  ScanLine,
  Scissors,
  ShieldCheck,
  Siren,
  Smile,
  Snowflake,
  Sparkles,
  Stethoscope,
  Syringe,
  Wand2,
  type LucideIcon,
} from "lucide-react";

/** Icons an admin can pick for a service. Stored in the DB by name. */
export const ICONS = {
  Sparkles,
  Brush,
  Activity,
  Anchor,
  AlignHorizontalDistributeCenter,
  Siren,
  Crown,
  Link2,
  Smile,
  Syringe,
  Scissors,
  ShieldCheck,
  Stethoscope,
  ScanLine,
  HeartPulse,
  Snowflake,
  Baby,
  Layers,
  Wand2,
  MessageCircle,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as [IconName, ...IconName[]];

export const ICON_LABELS: Record<IconName, string> = {
  Sparkles: "Sparkle (whitening)",
  Brush: "Brush (cleaning)",
  Activity: "Pulse (root canal)",
  Anchor: "Anchor (implants)",
  AlignHorizontalDistributeCenter: "Align (braces)",
  Siren: "Siren (emergency)",
  Crown: "Crown",
  Link2: "Link (bridges)",
  Smile: "Smile (cosmetic)",
  Syringe: "Syringe (extraction)",
  Scissors: "Scissors (surgery)",
  ShieldCheck: "Shield (prevention)",
  Stethoscope: "Stethoscope",
  ScanLine: "Scan (X-ray)",
  HeartPulse: "Heart (gums)",
  Snowflake: "Snowflake (sensitivity)",
  Baby: "Baby (kids/prenatal)",
  Layers: "Layers (dentures)",
  Wand2: "Wand (bonding)",
  MessageCircle: "Chat (consultation)",
};

export function getIcon(name: string | undefined): LucideIcon {
  return (name && ICONS[name as IconName]) || Sparkles;
}
