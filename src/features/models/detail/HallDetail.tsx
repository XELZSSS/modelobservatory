import { useSuspenseArtificialRankings, useHallucinationRankings } from "../../../shared/hooks/useQueries";
import { useModelLookup } from "../../../shared/hooks/useModelLookup";
import { HallDetailContent } from "./HallDetailContent";
import { NotFound } from "../../system/NotFound";

export function HallDetail({ decodedId }: { decodedId: string }) {
  const { data: aaData } = useSuspenseArtificialRankings();
  const hallucinationRankings = useHallucinationRankings(aaData);
  const entry = useModelLookup(hallucinationRankings, decodedId, "id", "slug");
  const aaModel = useModelLookup(aaData, decodedId, "id", "slug");
  if (!entry) return <NotFound />;
  return <HallDetailContent model={entry} aaModel={aaModel} />;
}
