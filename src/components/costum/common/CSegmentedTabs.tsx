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
          // sama seperti student progress
          "flex w-full md:inline-flex md:w-auto items-center gap-1",
          "h-9 rounded-lg p-1",
          "bg-[#F1ECE3] dark:bg-[#3a312b]/80", // light & dark bg
          "text-muted-foreground text-sm",
          "transition-none",
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
                // ukuran mengikuti student progress
                "flex-1 md:flex-none px-3 py-1.5 text-sm",
                "rounded-md",
                "transition-none",
                "bg-transparent hover:bg-transparent active:bg-transparent",
                "focus-visible:ring-0 focus-visible:ring-offset-0",

                // ACTIVE STATE
                "data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
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
