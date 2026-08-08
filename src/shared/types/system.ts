export interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

export type NewsCategory = "industry" | "opensource" | "hardware" | "funding";

export interface HealthEntry {
  name: string;
  status: "ok" | "error";
  detail: string;
  responseTime: number;
  statusCode: number | null;
  url: string;
}

export interface SystemStats {
  runtime: "cloudflare" | "standard";
  cloudflare: null;
  uptime: number;
}

export type ThemeMode = "light" | "dark";