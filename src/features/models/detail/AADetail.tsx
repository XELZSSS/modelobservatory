import { useSuspenseArtificialRankings } from "../../../shared/hooks/useQueries";
import { ModelDetailContent } from "../../../shared/components/composite/ModelDetailContent";
import { NotFound } from "../../system/NotFound";

export function AADetail({ decodedId }: { decodedId: string }) {
  const { data: aaData } = useSuspenseArtificialRankings();
  const model = aaData.find((m) => m.id === decodedId || m.slug === decodedId);
  if (!model) return <NotFound />;
  return <ModelDetailContent model={model} />;
}
