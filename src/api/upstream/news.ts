import { XMLParser } from "fast-xml-parser";
import { withCacheTtl } from "../cache";
import { fetchText } from "../http";
import type { NewsItem } from "../../shared/types";
import { rssConfig } from "../../shared/config/rss";
import { NEWS_TTL_MS } from "../../shared/config/cache";
import { decodeEntities, stripHtml } from "../parsers/feed";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

function parseFeed(xml: string, sourceUrl: string): NewsItem[] {
  const feed = parser.parse(xml);
  const channel = feed?.rss?.channel || feed?.feed;
  if (!channel) return [];
  const sourceName = channel.title || (() => { try { return new URL(sourceUrl).hostname; } catch { return "Unknown"; } })();
  let items = channel.item || channel.entry || [];
  if (!Array.isArray(items)) items = [items];
  return items.slice(0, 50).map((item: Record<string, unknown>) => {
    const title = item.title;
    const link = (item.link as Record<string, unknown>)?.href || item.link;
    if (!title || !link) return null;
    return {
      id: String((item.guid as Record<string, unknown>)?.["#text"] || item.guid || item.id || link),
      title: decodeEntities(stripHtml(String(title))),
      link: String(link),
      pubDate: String(item.pubDate || item.published || item.updated || "1970-01-01T00:00:00Z"),
      source: String(sourceName),
    };
  }).filter((x: NewsItem | null): x is NewsItem => x !== null);
}

export async function getNews(category: string = "official"): Promise<NewsItem[]> {
  const urls = rssConfig[category as keyof typeof rssConfig] ?? rssConfig.official;
  const fullTtl = NEWS_TTL_MS;
  const partialTtl = 60_000;

  return withCacheTtl(`news-${category}`, fullTtl, async () => {
    const results = await Promise.allSettled(
      urls.map(async (url) => parseFeed(await fetchText(url, { headers: { accept: "application/rss+xml,application/xml,text/xml,*/*" } }), url)),
    );
    const allItems: NewsItem[] = [];
    let failCount = 0;
    for (const r of results) {
      if (r.status === "fulfilled") allItems.push(...r.value);
      else failCount++;
    }
    if (failCount === results.length && results.length > 0) throw new Error(`All ${results.length} RSS feed(s) for "${category}" failed`);
    allItems.sort((a, b) => {
      const ta = new Date(a.pubDate).getTime() || 0;
      const tb = new Date(b.pubDate).getTime() || 0;
      return tb - ta;
    });
    return { data: allItems.slice(0, 50), ttl: failCount > 0 ? partialTtl : fullTtl };
  });
}
