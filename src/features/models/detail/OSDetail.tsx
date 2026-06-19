import { useSuspenseOpenSourceReleases } from "../../../shared/hooks/useQueries";
import { OsDetailContent } from "./OsDetailContent";
import { NotFound } from "../../system/NotFound";

export function OSDetail({ decodedId }: { decodedId: string }) {
  const { data: osData } = useSuspenseOpenSourceReleases();
  const model = osData.find((m) => m.id === decodedId);
  if (!model) return <NotFound />;
  return <OsDetailContent model={model} />;
}
