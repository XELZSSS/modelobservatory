import { useParams } from "react-router-dom";
import { MODEL_SOURCES, type ModelSource } from "../../shared/constants";

export function useModelSourceParams(): { src: ModelSource | null; decodedId: string } {
  const { source, "*": splat } = useParams<{ source: string; "*": string }>();
  const src = (source && source in MODEL_SOURCES ? source : null) as ModelSource | null;
  const decodedId = splat ? decodeURIComponent(splat) : "";
  return { src, decodedId };
}
