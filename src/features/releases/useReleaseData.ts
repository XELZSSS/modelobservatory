import { useMemo } from "react";
import type { OpenSourceModelEntry, ArtificialAnalysisModel } from "../../shared/types";
import type { FeedEntry, DatedModel } from "./types";

export function useReleaseFeedEntries(openSourceReleases: OpenSourceModelEntry[]): FeedEntry[] {
  return useMemo(() => {
    const seen = new Map<string, FeedEntry>();
    for (const m of openSourceReleases) {
      const name = m.id.split("/").pop() || m.id;
      if (m.createdAt) {
        const ts = Date.parse(m.createdAt);
        if (Number.isFinite(ts)) {
          const key = `${m.id}|opensource|${ts}`;
          if (!seen.has(key)) seen.set(key, { id: m.id, name, date: new Date(ts).toLocaleDateString(), ts, type: "opensource", source: "huggingface" });
        }
      }
      if (m.lastModified && m.lastModified !== m.createdAt) {
        const ts = Date.parse(m.lastModified);
        if (Number.isFinite(ts)) {
          const key = `${m.id}_mod|update|${ts}`;
          if (!seen.has(key)) seen.set(key, { id: m.id + "_mod", name, date: new Date(ts).toLocaleDateString(), ts, type: "update", source: "huggingface" });
        }
      }
    }
    return Array.from(seen.values()).sort((a, b) => b.ts - a.ts);
  }, [openSourceReleases]);
}

export function useReleaseDateRows(artificialRankings: ArtificialAnalysisModel[]): DatedModel[] {
  return useMemo(
    () =>
      artificialRankings
        .map((model) => ({ model, time: model.release_date ? Date.parse(`${model.release_date}T00:00:00Z`) : NaN }))
        .filter((item): item is DatedModel => Number.isFinite(item.time))
        .sort((a, b) => b.time - a.time),
    [artificialRankings],
  );
}
