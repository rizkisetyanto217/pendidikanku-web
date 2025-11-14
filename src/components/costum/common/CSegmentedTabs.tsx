import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type SegmentedTabItem = {
  value: string;
  label: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export function CSegmentedTabs({
  value,
  onValueChange,
  tabs,
  className = "",
}: {
  value: string;
  onValueChange: (v: string) => void;
  tabs: SegmentedTabItem[];
  className?: string;
}) {
  return (
    <div className={`w-full sm:w-auto ${className}`}>
      <Tabs value={value} onValueChange={onValueChange}>
        <TabsList
          className="
            w-full sm:w-auto
            inline-flex items-center
            rounded-xl border border-primary/60
            bg-primary/10
            p-0.5
          "
        >
          {tabs.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="
                flex-1 sm:flex-none
                inline-flex items-center justify-center
                gap-1.5 px-4 py-1.5
                rounded-xl
                text-sm font-semibold
                text-muted-foreground
                data-[state=active]:bg-background
                data-[state=active]:text-primary
                data-[state=active]:shadow-sm
              "
            >
              {t.icon && <t.icon className="h-4 w-4" />}
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
