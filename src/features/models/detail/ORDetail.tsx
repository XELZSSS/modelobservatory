import { useSuspenseOpenRouterRankings } from "../../../shared/hooks/useQueries";
import { OrDetailContent } from "./OrDetailContent";
import { NotFound } from "../../system/NotFound";

export function ORDetail({ decodedId }: { decodedId: string }) {
  const { data: orPayload } = useSuspenseOpenRouterRankings();
  const orData = orPayload?.tokenUsageRankings ?? [];
  const model = orData.find((m) => m.id === decodedId);
  if (!model) return <NotFound />;
  return <OrDetailContent model={model} />;
}
