import { useState, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { TabButton } from "./TabButton";

export interface TabItem {
  id: string;
  label: string;
}

interface TabContainerProps {
  tabs: TabItem[];
  defaultTabId?: string;
  className?: string;
  tabSize?: "sm" | "md";
  onTabChange?: (tabId: string) => void;
  children: ((activeTab: string) => ReactNode) | ReactNode;
}

export function TabContainer({ tabs, defaultTabId, className, tabSize = "md", onTabChange, children }: TabContainerProps) {
  const [activeTab, setActiveTab] = useState(() => {
    if (defaultTabId && tabs.some((t) => t.id === defaultTabId)) return defaultTabId;
    return tabs[0]?.id ?? "";
  });

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const content = typeof children === "function" ? children(activeTab) : children;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap gap-2" role="tablist">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => handleTabClick(tab.id)}
            size={tabSize}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
          >
            {tab.label}
          </TabButton>
        ))}
      </div>
      {activeTab && (
        <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {content}
        </div>
      )}
    </div>
  );
}
