export const COOL_COLORS = [
  "#a78bfa",
  "#93c5fd",
  "#67e8f9",
  "#818cf8",
  "#34d399",
  "#22d3ee",
  "#38bdf8",
  "#c084fc",
  "#a5b4fc",
  "#c4b5fd",
  "#a6f3d8",
  "#7dd3fc",
  "#86efac",
  "#d8b4fe",
  "#99f6e4",
  "#bfdbfe",
  "#6ee7b7",
  "#e9d5ff",
  "#a5f3fc",
  "#bbf7d0",
];

export function getModelColor(index: number): string {
  return COOL_COLORS[index % COOL_COLORS.length]!;
}

export const getRankColor = (rank: number) => getModelColor(Math.max(1, rank) - 1);
