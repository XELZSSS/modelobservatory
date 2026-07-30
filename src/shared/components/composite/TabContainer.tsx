import { type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { TabButton } from "./TabButton";

export interface TabItem {
  id: string;
  label: string;
}

interface TabContainerProps {
  tabs: TabItem[];
  activeTab: string;
  className?: string;
  tabSize?: "sm" | "md";
  onTabChange: (tabId: string) => void;
  children: ((activeTab: string) => ReactNode) | ReactNode;
}

export function TabContainer({ tabs, activeTab, className, tabSize = "md", onTabChange, children }: TabContainerProps) {
  const content = typeof children === "function" ? children(activeTab) : children;

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex gap-1 p-1 rounded-lg bg-bg-secondary w-fit max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            size={tabSize}
            aria-controls={activeTab === tab.id ? `panel-${tab.id}` : undefined}
            id={`tab-${tab.id}`}
          >
            {tab.label}
          </TabButton>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {content}
      </div>
    </div>
  );
}
