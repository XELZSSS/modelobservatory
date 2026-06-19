import { useSuspenseArtificialRankings, useHallucinationRankings } from "../../../shared/hooks/useQueries";
import { HallDetailContent } from "./HallDetailContent";
import { NotFound } from "../../system/NotFound";

export function HallDetail({ decodedId }: { decodedId: string }) {
  const { data: aaData } = useSuspenseArtificialRankings();
  const hallucinationRankings = useHallucinationRankings(aaData);
  const entry = hallucinationRankings.find((m) => m.id === decodedId || m.slug === decodedId);
  const aaModel = aaData.find((m) => m.id === decodedId || m.slug === decodedId);
  if (!entry) return <NotFound />;
  return <HallDetailContent model={entry} aaModel={aaModel} />;
}
