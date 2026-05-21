import { useState } from "react";
import { Clock, Building2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { TabButton } from "../composite/TabButton";
import { numberTextClass, secondaryTextClass } from "../../utils/cssConstants";
import { COOL_COLORS } from "../rankColor";
import { approxEq } from "../../utils/math";
import { useTranslation } from "../../i18n/useTranslation";
import type { ModelPrediction, ReleasePrediction, ProviderPrediction, PredictionsPayload } from "../../types";
import { ExternalLinkButton } from "../composite/ExternalLinkButton";

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

function EmptyPredictions() {
  const { t } = useTranslation();
  return <p className={`${secondaryTextClass} py-4 text-center`}>{t("noPredictions")}</p>;
}

function ModelRankingTab({ items }: { items: ModelPrediction[] }) {
  if (items.length === 0) return <EmptyPredictions />;

  const sorted = [...items].sort((a, b) => b.probability - a.probability);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {sorted.map((item, i) => (
        <Card key={item.id} className={i >= 2 ? "hidden sm:block" : ""}>
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-extrabold w-5 text-center shrink-0" style={{ color: COOL_COLORS[i % COOL_COLORS.length] }}>
                  #{i + 1}
                </span>
                <span className="text-sm font-bold truncate">{item.company}</span>
              </div>
              <ExternalLinkButton href={item.url} iconSize={12} />
            </div>
            <p className={`${secondaryTextClass} mb-2 line-clamp-2`}>{item.question}</p>
            <div className="flex items-center justify-between">
              <span className={`text-lg font-extrabold ${numberTextClass}`} style={{ color: COOL_COLORS[i % COOL_COLORS.length] }}>
                {(item.probability * 100).toFixed(1)}%
              </span>
              <div className="text-right text-xs text-text-tertiary">
                <div>{formatVolume(item.volume)}</div>
                {item.deadline && <div>{item.deadline}</div>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ReleasesTab({ items }: { items: ReleasePrediction[] }) {
  if (items.length === 0) return <EmptyPredictions />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.map((item, i) => {
        const topProb = item.predictions.reduce((max, p) => Math.max(max, p.probability), 0);
        return (
          <Card key={item.id} className={i >= 2 ? "hidden sm:block" : ""}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Clock size={14} className="shrink-0" style={{ color: COOL_COLORS[(i + 3) % COOL_COLORS.length] }} />
                  <span className="text-sm font-bold truncate">{item.model}</span>
                </div>
                <ExternalLinkButton href={item.url} iconSize={12} />
              </div>
              <p className={`${secondaryTextClass} mb-2 line-clamp-2`}>{item.question}</p>
              <div className="flex flex-col gap-1">
                {item.predictions.map((p, j) => (
                  <div key={j} className="flex items-center justify-between gap-2">
                    <span className={`${secondaryTextClass} truncate`}>{p.window}</span>
                    <span
                      className={`text-sm font-bold shrink-0 ${numberTextClass}`}
                      style={{ color: p.probability === topProb || (topProb > 0 && approxEq(p.probability, topProb)) ? COOL_COLORS[(i + 3) % COOL_COLORS.length] : "var(--text-tertiary)" }}
                    >
                      {(p.probability * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-text-tertiary">{formatVolume(item.volume)}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ProvidersTab({ items }: { items: ProviderPrediction[] }) {
  if (items.length === 0) return <EmptyPredictions />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {items.map((item, i) => {
        const topProb = item.options.reduce((max, o) => Math.max(max, o.probability), 0);
        return (
          <Card key={item.id} className={i >= 2 ? "hidden sm:block" : ""}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Building2 size={14} className="shrink-0" style={{ color: COOL_COLORS[(i + 6) % COOL_COLORS.length] }} />
                  <span className="text-sm font-bold truncate">{item.provider}</span>
                </div>
                <ExternalLinkButton href={item.url} iconSize={12} />
              </div>
              <p className={`${secondaryTextClass} mb-2 line-clamp-2`}>{item.question}</p>
              <div className="flex flex-col gap-1">
                {item.options.slice(0, 3).map((opt, j) => (
                  <div key={j} className="flex items-center justify-between gap-2">
                    <span className={`${secondaryTextClass} truncate`}>{opt.label}</span>
                    <span
                      className={`text-sm font-bold shrink-0 ${numberTextClass}`}
                      style={{ color: opt.probability === topProb || (topProb > 0 && approxEq(opt.probability, topProb)) ? COOL_COLORS[(i + 6) % COOL_COLORS.length] : "var(--text-tertiary)" }}
                    >
                      {(opt.probability * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-text-tertiary">
                <span>{formatVolume(item.volume)}</span>
                {item.deadline && <span>{item.deadline}</span>}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

type TabKey = "rankings" | "releases" | "providers";

export function PredictionsSection({ data }: { data: PredictionsPayload }) {
  const { t } = useTranslation();
  const [active, setActive] = useState<TabKey>("rankings");

  const hasData = data.modelRankings.length > 0 || data.releases.length > 0 || data.providers.length > 0;
  if (!hasData) return null;

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "rankings", label: t("modelRankingPredictions"), count: data.modelRankings.length },
    { key: "releases", label: t("releasePredictions"), count: data.releases.length },
    { key: "providers", label: t("providerPredictions"), count: data.providers.length },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-bold">{t("predictions")}</p>
          <p className={`${secondaryTextClass} shrink-0`}>{t("predictionsSource")}</p>
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <TabButton key={tab.key} size="sm" active={active === tab.key} onClick={() => setActive(tab.key)}>
              <span className="whitespace-nowrap">
                {tab.label} ({tab.count})
              </span>
            </TabButton>
          ))}
        </div>
      </div>
      {active === "rankings" && <ModelRankingTab items={data.modelRankings} />}
      {active === "releases" && <ReleasesTab items={data.releases} />}
      {active === "providers" && <ProvidersTab items={data.providers} />}
    </div>
  );
}
