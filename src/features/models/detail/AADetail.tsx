import { useSuspenseArtificialRankings } from "../../../shared/hooks/useQueries";
import { useModelLookup } from "../../../shared/hooks/useModelLookup";
import { ModelDetailContent } from "../../../shared/components/composite/ModelDetailContent";
import { NotFound } from "../../system/NotFound";

export function AADetail({ decodedId }: { decodedId: string }) {
  const { data } = useSuspenseArtificialRankings();
  const model = useModelLookup(data, decodedId, "id", "slug");
  if (!model) return <NotFound />;
  return <ModelDetailContent model={model} />;
}
