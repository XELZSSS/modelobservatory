import { useSuspenseOpenRouterRankings } from "../../../shared/hooks/useQueries";
import { useModelLookup } from "../../../shared/hooks/useModelLookup";
import { OrDetailContent } from "./OrDetailContent";
import { NotFound } from "../../system/NotFound";

export function ORDetail({ decodedId }: { decodedId: string }) {
  const { data: orPayload } = useSuspenseOpenRouterRankings();
  const orData = orPayload?.tokenUsageRankings ?? [];
  const model = useModelLookup(orData, decodedId, "id");
  if (!model) return <NotFound />;
  return <OrDetailContent model={model} />;
}
