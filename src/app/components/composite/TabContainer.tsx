import { type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../../../shared/utils/cn";
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

  const handleTablistKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < 0) return;
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    }
    if (nextIndex == null) return;
    event.preventDefault();
    onTabChange(tabs[nextIndex]!.id);
    document.getElementById(`tab-${tabs[nextIndex]!.id}`)?.focus();
  };

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div
        className="flex gap-1 p-1 rounded-lg bg-bg-secondary w-fit max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        onKeyDown={handleTablistKeyDown}
      >
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            size={tabSize}
            tabIndex={activeTab === tab.id ? 0 : -1}
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