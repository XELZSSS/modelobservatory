import { useSuspenseTtsLeaderboard } from "../../../shared/hooks/useQueries";
import { TtsDetailContent } from "./TtsDetailContent";
import { NotFound } from "../../system/NotFound";

export function TTSDetail({ decodedId }: { decodedId: string }) {
  const { data: ttsData } = useSuspenseTtsLeaderboard();
  const model = ttsData.find((m) => m.id === decodedId || m.name === decodedId);
  if (!model) return <NotFound />;
  return <TtsDetailContent model={model} />;
}
