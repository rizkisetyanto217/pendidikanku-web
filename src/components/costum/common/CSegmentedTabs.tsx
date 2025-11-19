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
    <Tabs
      // ✅ FULLY CONTROLLED — nilai aktif dari parent
      value={value}
      onValueChange={onValueChange}
    >
      <TabsList
        className={cn(
          "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
          "w-full md:w-auto gap-1",
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
                "flex items-center gap-1 rounded-md px-3 py-1 text-xs md:text-sm",
                "data-[state=active]:bg-background data-[state=active]:text-foreground"
              )}
            >
              {Icon && <Icon className="h-3 w-3 md:h-4 md:w-4" />}
              <span>{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
