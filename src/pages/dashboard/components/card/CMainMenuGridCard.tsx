// src/dashboard/components/card/CMainMenuGridCard.tsx
import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

/* ==================== Types ==================== */
export type CMenuItem = {
    key: string;
    label: string;
    icon: ReactNode;
    to?: string;
    note?: string;
    requiresParam?: boolean;
};

export type CMainMenuGridCardProps = {
    title?: string;
    items: CMenuItem[];
    columns?: {
        base?: number;
        sm?: number;
        md?: number;
        xl?: number;
    };
};

/* ==================== Component ==================== */
export default function CMainMenuGridCard({
    title = "Menu Utama",
    items,
    columns = { base: 4, sm: 4, md: 4, xl: 5 },
}: CMainMenuGridCardProps) {
    const gridClass = [
        `grid grid-cols-${columns.base ?? 3}`,
        columns.sm ? `sm:grid-cols-${columns.sm}` : "",
        columns.md ? `md:grid-cols-${columns.md}` : "",
        columns.xl ? `xl:grid-cols-${columns.xl}` : "",
        "gap-3 md:gap-4",
    ].join(" ");

    return (
        <div className="w-full bg-background text-foreground">
            <div className="pb-6">
                <h2 className="text-lg font-semibold md:text-xl">{title}</h2>
            </div>

            <div className={gridClass}>
                {items.map((it) => (
                    <CMenuTile key={it.key} item={it} />
                ))}
            </div>
        </div>
    );
}

/* ==================== Tile ==================== */
function CMenuTile({ item }: { item: CMenuItem }) {
    const content = (
        <>
            {/* === Tampilan Desktop (pakai Card) === */}
            <Card
                className={[
                    "hidden md:block h-full w-full rounded-2xl bg-card text-card-foreground transition-colors",
                    item.requiresParam
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-accent/50",
                ].join(" ")}
                title={
                    item.requiresParam
                        ? item.note ?? "Halaman ini memerlukan parameter"
                        : undefined
                }
                aria-disabled={item.requiresParam ? true : undefined}
            >
                <CardContent className="p-3 md:p-4 flex flex-col items-center justify-center text-center gap-2">
                    <span className="h-12 w-12 md:h-14 md:w-14 grid place-items-center rounded-xl bg-primary/10 text-primary">
                        <span className="size-6 md:size-7">{item.icon}</span>
                    </span>
                    <div className="text-xs md:text-sm font-medium leading-tight line-clamp-2">
                        {item.label}
                    </div>
                    {item.note && (
                        <div className="text-[11px] md:text-xs text-muted-foreground">
                            {item.note}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* === Tampilan Mobile (tanpa Card) === */}
            <div
                className={[
                    "md:hidden flex flex-col items-center justify-center gap-2 p-2 rounded-xl transition-colors",
                    item.requiresParam
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-accent/30",
                ].join(" ")}
                title={
                    item.requiresParam
                        ? item.note ?? "Halaman ini memerlukan parameter"
                        : undefined
                }
            >
                <div className="h-14 w-14 rounded-xl bg-primary/10 text-primary grid place-items-center">
                    <span className="size-6">{item.icon}</span>
                </div>
                <div className="text-xs font-medium text-center leading-tight">
                    {item.label}
                </div>
            </div>
        </>
    );

    if (item.requiresParam || !item.to) {
        return <div className="block rounded-xl">{content}</div>;
    }

    return (
        <Link
            to={item.to}
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
        >
            {content}
        </Link>
    );
}
