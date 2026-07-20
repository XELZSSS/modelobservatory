export const COOL_COLORS = [
  "#818cf8",
  "#22d3ee",
  "#fbbf24",
  "#34d399",
  "#f472b6",
  "#a78bfa",
  "#fb923c",
  "#2dd4bf",
  "#facc15",
  "#a3e635",
];

export function getModelColor(index: number): string {
  return COOL_COLORS[index % COOL_COLORS.length]!;
}
