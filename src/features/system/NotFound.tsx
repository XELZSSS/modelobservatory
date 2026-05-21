import { Link } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";

export function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-text-secondary">{t("notFound")}</p>
      <Link to="/" className="mt-4 text-accent hover:underline">
        {t("backToHome")}
      </Link>
    </div>
  );
}
