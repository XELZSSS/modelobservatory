import { useMemo, useState } from "react";
import { ExternalLink, Clock, Newspaper, Search } from "lucide-react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TranslationKey } from "../../shared/i18n";
import { SectionHeader } from "../../shared/components/composite/SectionHeader";
import { Card } from "../../shared/components/ui/card";
import { Pagination } from "../../shared/components/ui/pagination";
import { useNewsByCategory } from "../../shared/hooks/useQueries";
import { Spinner } from "../../shared/components/feedback/SuspenseQuery";
import { safeHref, formatRelativeTime } from "../../shared/utils/format";
import { COOL_COLORS } from "../../shared/components/rankColor";
import { secondaryTextClass } from "../../shared/utils/cssConstants";
import { cn } from "../../shared/utils/cn";
import { TabContainer, type TabItem } from "../../shared/components/composite/TabContainer";
import type { NewsItem } from "../../shared/types";
import { useIsMobile } from "../../shared/hooks/useIsMobile";

const CATEGORIES: { id: string; labelKey: TranslationKey; color: string }[] = [
  { id: "official", labelKey: "catOfficial", color: COOL_COLORS[0]! },
  { id: "industry", labelKey: "catIndustry", color: COOL_COLORS[1]! },
  { id: "research", labelKey: "catResearch", color: COOL_COLORS[2]! },
  { id: "agentic", labelKey: "catAgentic", color: COOL_COLORS[3]! },
  { id: "hardware", labelKey: "catHardware", color: COOL_COLORS[4]! },
  { id: "policy", labelKey: "catPolicy", color: COOL_COLORS[5]! },
  { id: "funding", labelKey: "catFunding", color: COOL_COLORS[6]! },
  { id: "opensource", labelKey: "catOpenSource", color: COOL_COLORS[7]! },
];

function NewsList({ news, color, isLoading, isError }: { news: NewsItem[]; color: string; isLoading: boolean; isError: boolean }) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  const itemsPerPage = isMobile ? 10 : 20;
  const totalPages = Math.max(1, Math.ceil(news.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const currentNews = news.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  if (isLoading) return <Spinner />;

  if (isError) {
    return (
      <Card className="text-sm p-4 text-center" style={{ color: "var(--destructive)" }}>
        {t("newsLoadFailed")}
      </Card>
    );
  }

  if (news.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-4 text-text-secondary">
        <Search size={24} className="mb-2 opacity-50" />
        <p className="text-sm">{t("noResults")}</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-[6px]">
      {currentNews.map((item) => (
        <a key={item.id} href={safeHref(item.link) ?? undefined} target="_blank" rel="noopener noreferrer" className="group block hover:border-text-primary" aria-label={`${item.title} - ${item.source}`}>
          <Card className="p-3" style={{ borderLeft: `3px solid ${color}` }}>
            <div className="flex flex-row items-start justify-between gap-4">
              <h3 className="text-sm font-bold text-text-primary leading-relaxed group-hover:underline">{item.title}</h3>
              <ExternalLink size={14} className="shrink-0 text-text-secondary mt-1" />
            </div>
            <div className="flex flex-row items-center gap-3 mt-2">
              <div className={cn("flex items-center gap-1", secondaryTextClass)}>
                <Newspaper size={12} />
                <span>{item.source}</span>
              </div>
              <div className={cn("flex items-center gap-1", secondaryTextClass)}>
                <Clock size={12} />
                <span>{formatRelativeTime(item.pubDate, t)}</span>
              </div>
            </div>
          </Card>
        </a>
      ))}
      {totalPages > 1 && (
        <div className="mt-2 mb-4 flex justify-center">
          <Pagination page={safePage} totalPages={totalPages} onChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}

function NewsCategoryContent({ categoryId, color }: { categoryId: string; color: string }) {
  const result = useNewsByCategory(categoryId);
  return <NewsList news={result.data || []} color={color} isLoading={result.isLoading} isError={result.isError} />;
}

export function NewsView() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("official");

  const activeColor = CATEGORIES.find((c) => c.id === activeCategory)?.color ?? COOL_COLORS[0]!;

  const tabs: TabItem[] = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        id: cat.id,
        label: t(cat.labelKey),
      })),
    [t],
  );

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader title={t("aiNews")} />
      <TabContainer tabs={tabs} defaultTabId="official" tabSize="sm" onTabChange={setActiveCategory}>
        <NewsCategoryContent categoryId={activeCategory} color={activeColor} />
      </TabContainer>
    </div>
  );
}
