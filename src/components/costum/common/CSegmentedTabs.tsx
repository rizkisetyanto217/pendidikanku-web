// src/components/costum/common/CSegmentedTabs.tsx
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type SegmentedTabItem = {
  value: string;
  label: string;
  icon?: LucideIcon;
};

type CSegmentedTabsProps = {
  value: string;
  onValueChange: (value: string) => void;
  tabs: SegmentedTabItem[];
  className?: string;
};

export function CSegmentedTabs({
  value,
  onValueChange,
  tabs,
  className,
}: CSegmentedTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList
        className={cn(
          "tabs-list",
          "flex w-full md:inline-flex md:w-auto items-center gap-1",
          "h-9 rounded-lg p-1 transition-none",
          className
        )}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                "tabs-trigger",
                "flex-1 md:flex-none px-3 py-1.5 text-sm",
                Icon ? "flex items-center gap-1" : ""
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>

  );
}
