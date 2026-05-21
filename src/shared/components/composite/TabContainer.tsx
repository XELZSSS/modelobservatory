import { useState, type ReactNode } from "react";
import { TabButton } from "./TabButton";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabContainerProps {
  tabs: TabItem[];
  defaultTabId?: string;
  className?: string;
  tabSize?: "sm" | "md";
  onTabChange?: (tabId: string) => void;
}

export function TabContainer({ tabs, defaultTabId, className = "", tabSize = "md", onTabChange }: TabContainerProps) {
  const [activeTab, setActiveTab] = useState(() => {
    if (defaultTabId && tabs.some((t) => t.id === defaultTabId)) return defaultTabId;
    return tabs[0]?.id ?? "";
  });

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex flex-wrap gap-2" role="tablist">
        {tabs.map((tab) => (
          <TabButton key={tab.id} active={activeTab === tab.id} onClick={() => handleTabClick(tab.id)} size={tabSize}>
            {tab.label}
          </TabButton>
        ))}
      </div>
      <div role="tabpanel">{activeContent}</div>
    </div>
  );
}
