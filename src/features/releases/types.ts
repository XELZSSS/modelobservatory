import type { ArtificialAnalysisModel } from "../../shared/types";

export interface FeedEntry {
  id: string;
  name: string;
  date: string;
  ts: number;
  type: "new" | "update" | "opensource";
  source: "huggingface" | "artificial";
}

export interface DatedModel {
  model: ArtificialAnalysisModel;
  time: number;
}
