import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslation } from "../../i18n/useTranslation";
import type { TranslationKey } from "../../i18n";

export function BackButton({ labelKey = "backToHome", to, state }: { labelKey?: TranslationKey; to: string; state?: unknown }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <Button size="sm" variant="outline" onClick={() => navigate(to, { state })} className="self-start">
      <ArrowLeft className="size-4" /> {t(labelKey)}
    </Button>
  );
}
