// src/components/StatsCardGrid.tsx
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatCardItem = {
  label: React.ReactNode;
  metric: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  to?: string;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
};

type StatsCardGridProps = {
  items: StatCardItem[];
  loading?: boolean;
  /** Lebar minimal kartu (px, rem, dll). Default: "14rem" (~224px) */
  minCardWidth?: number | string;
  className?: string;
  formatMetric?: (n: number) => string;
  emptyMetricPlaceholder?: React.ReactNode;
  /** Jumlah kolom di mobile (<md). Default: 1 (backward-compatible). Set 2 untuk 2-2. */
  mobileCols?: 1 | 2 | 3 | 4;
};

export function StatsCardGrid({
  items,
  loading = false,
  minCardWidth = "14rem",
  className,
  formatMetric,
  emptyMetricPlaceholder = "—",
  mobileCols = 1,
}: StatsCardGridProps) {
  const navigate = useNavigate();

  const renderMetric = (m: React.ReactNode) => {
    if (loading) return "…";
    if (typeof m === "number")
      return formatMetric ? formatMetric(m) : m.toLocaleString();
    if (m === null || m === undefined || m === "")
      return emptyMetricPlaceholder;
    return m;
  };

  const mw =
    typeof minCardWidth === "number"
      ? `${minCardWidth}px`
      : String(minCardWidth);

  // kelas kolom untuk mobile
  const mobileColsClass =
    mobileCols === 4
      ? "grid-cols-4"
      : mobileCols === 3
      ? "grid-cols-3"
      : mobileCols === 2
      ? "grid-cols-2"
      : "grid-cols-1";

  return (
    <div
      className={cn(
        "grid gap-3",
        mobileColsClass, // mobile: grid-cols-1/2/3/4
        // md+: auto-fit + minmax pakai CSS var --mw (tidak perlu md:grid-cols-none)
        "md:[grid-template-columns:repeat(auto-fit,minmax(var(--mw),1fr))]",
        className
      )}
      style={
        {
          // CSS var agar nilai minCardWidth bisa dipakai di Tailwind arbitrary prop di atas
          ["--mw" as any]: mw,
        } as React.CSSProperties
      }
    >
      {items.map((it, idx) => {
        const disabled = loading || it.disabled;
        const canClick = !disabled && (it.onClick || it.to);

        const handleClick = () => {
          if (disabled) return;
          if (it.onClick) return it.onClick();
          if (it.to) return navigate(it.to);
        };

        return (
          <Card
            key={idx}
            role={canClick ? "button" : undefined}
            aria-label={it.ariaLabel}
            aria-disabled={disabled || undefined}
            tabIndex={canClick ? 0 : -1}
            onClick={canClick ? handleClick : undefined}
            onKeyDown={(e) => {
              if (!canClick) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick();
              }
            }}
            className={cn(
              "transition",
              canClick && "hover:shadow-md cursor-pointer focus:outline-none",
              it.className
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {it.label}
                  </div>
                  <div className="text-xl font-semibold">
                    {renderMetric(it.metric)}
                  </div>
                  {it.hint ? (
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {it.hint}
                    </div>
                  ) : null}
                </div>
                {it.icon ?? null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* alias kompatibilitas */
export { StatsCardGrid as StatsGrid };
export type { StatCardItem as StatItem };