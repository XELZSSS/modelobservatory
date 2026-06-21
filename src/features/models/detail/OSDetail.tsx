import { useSuspenseOpenSourceReleases } from "../../../shared/hooks/useQueries";
import { useModelLookup } from "../../../shared/hooks/useModelLookup";
import { OsDetailContent } from "./OsDetailContent";
import { NotFound } from "../../system/NotFound";

export function OSDetail({ decodedId }: { decodedId: string }) {
  const { data } = useSuspenseOpenSourceReleases();
  const model = useModelLookup(data, decodedId, "id");
  if (!model) return <NotFound />;
  return <OsDetailContent model={model} />;
}
