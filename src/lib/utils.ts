/** Minimal classnames joiner (no external dep). Falsy values are skipped. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function dashArray(
  style: "solid" | "dashed" | "dotted",
  w = 2,
): string | undefined {
  if (style === "dashed") return `${w * 3} ${w * 2}`;
  if (style === "dotted") return `${w} ${w * 1.6}`;
  return undefined;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
