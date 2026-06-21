import { useSuspenseTtsLeaderboard } from "../../../shared/hooks/useQueries";
import { useModelLookup } from "../../../shared/hooks/useModelLookup";
import { TtsDetailContent } from "./TtsDetailContent";
import { NotFound } from "../../system/NotFound";

export function TTSDetail({ decodedId }: { decodedId: string }) {
  const { data } = useSuspenseTtsLeaderboard();
  const model = useModelLookup(data, decodedId, "id", "name");
  if (!model) return <NotFound />;
  return <TtsDetailContent model={model} />;
}
