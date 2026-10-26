import {
  Activity,
  BookOpen,
  Brain,
  Droplet,
  Eye,
  FileText,
  HeartPulse,
  Microscope,
  Scan,
  Scissors,
  ShieldCheck,
  Stethoscope,
  Target,
  Video,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Icons an administrator can choose for a content entry, by name. Keeping the
 * registry here means a new clinical application created in the panel can pick
 * its own icon instead of falling back to a single default.
 */
export const CONTENT_ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  book: BookOpen,
  brain: Brain,
  droplet: Droplet,
  eye: Eye,
  file: FileText,
  heart: HeartPulse,
  microscope: Microscope,
  scan: Scan,
  scissors: Scissors,
  shield: ShieldCheck,
  stethoscope: Stethoscope,
  target: Target,
  video: Video,
  waves: Waves,
};

/** The names offered in the admin editor, in a stable order. */
export const CONTENT_ICON_NAMES = Object.keys(CONTENT_ICONS);

/**
 * Resolves a stored icon name, falling back to a per-slug default and finally
 * to a neutral icon, so content without an icon still renders.
 */
export function resolveContentIcon(
  name: unknown,
  slugFallbacks: Record<string, LucideIcon> = {},
  slug = "",
): LucideIcon {
  if (typeof name === "string") {
    const icon = CONTENT_ICONS[name.trim().toLowerCase()];
    if (icon) return icon;
  }
  return slugFallbacks[slug] ?? Target;
}
