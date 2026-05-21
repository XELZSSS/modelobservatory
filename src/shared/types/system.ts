export interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

export interface CloudflareInfo {
  colo: string;
  city: string | null;
  country: string | null;
  continent: string | null;
  latitude: string | null;
  longitude: string | null;
  postalCode: string | null;
  timezone: string | null;
  isEUCountry: string | null;
  httpProtocol: string | null;
  tlsVersion: string | null;
  tlsCipher: string | null;
  asOrganization: string | null;
  asn: number | null;
}

export interface SystemStats {
  runtime: "cloudflare" | "standard";
  cloudflare: CloudflareInfo | null;
  uptime: number;
}

export interface HealthEntry {
  name: string;
  status: "ok" | "error";
  detail: string;
  responseTime: number;
  statusCode: number | null;
  url: string;
}

export type ThemeMode = "light" | "dark";
