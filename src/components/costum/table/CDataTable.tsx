// src/components/dataview/DataTable.tsx
"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  Plus,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Table as TableIcon,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/* =========================
   Types
========================= */
export type Align = "left" | "center" | "right";
export type ViewMode = "table" | "card";

/** Meta info untuk cell renderer */
export type CellMeta = {
  pageIndex: number;
  absoluteIndex: number;
  rowId: string;
  isCard: boolean;
};

export type ColumnDef<T> = {
  id: string;
  header: React.ReactNode;
  cell?: (row: T, meta?: CellMeta) => React.ReactNode;
  minW?: string;
  align?: Align;
  className?: string;
  headerClassName?: string;
};

export type ActionsConfig<T> = {
  mode: "menu" | "inline";
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  labels?: Partial<{ view: string; edit: string; delete: string }>;
  headerLabel?: string;
};

export type DataTableProps<T> = {
  title?: string;
  onBack?: () => void;

  defaultQuery?: string;
  onQueryChange?: (q: string) => void;
  searchByKeys?: Array<keyof T>;
  filterer?: (row: T, query: string) => boolean;
  searchPlaceholder?: string;

  onAdd?: () => void;
  addLabel?: string;
  rightControls?: React.ReactNode; // deprecated, fallback
  rightSlot?: React.ReactNode;
  controlsPlacement?: "header" | "above";
  statsSlot?: React.ReactNode;
  emptySlot?: React.ReactNode;

  loading?: boolean;
  error?: string | null;
  columns: ColumnDef<T>[];
  rows: T[];
  getRowId: (row: T) => string;

  enableActions?: boolean; // default true
  actions?: ActionsConfig<T>;
  renderActions?: (row: T) => React.ReactNode;

  stickyHeader?: boolean;
  zebra?: boolean;

  pageSize?: number;
  pageSizeOptions?: number[];

  defaultAlign?: Align;

  viewModes?: ViewMode[];
  defaultView?: ViewMode;
  storageKey?: string;
  onViewModeChange?: (m: ViewMode) => void;

  renderCard?: (row: T) => React.ReactNode;
  cardColsClass?: string;
  cardGapClass?: string;

  /** Klik pada baris/card untuk primary action (lihat/detail) */
  onRowClick?: (row: T) => void;

  /** Tampilkan efek hover pada baris/kartu (default: true) */
  rowHover?: boolean;

  className?: string;
};

/** Attribute untuk elemen yang tidak memicu onRowClick */
export const NO_ROW_CLICK_ATTR = "data-no-row-click";

/* =========================
   Component
========================= */
export function CDataTable<T>({
  title,
  onBack,
  defaultQuery = "",
  onQueryChange,
  searchByKeys,
  filterer,
  searchPlaceholder = "Cari…",
  onAdd,
  addLabel = "Tambah",
  rightControls,
  rightSlot,
  controlsPlacement = "header",
  statsSlot,
  emptySlot,

  loading,
  error,
  columns,
  rows,
  getRowId,
  enableActions = true,
  actions,
  renderActions,

  stickyHeader = false,
  zebra = false,

  pageSize = 30,
  pageSizeOptions = [20, 30, 50],

  defaultAlign = "center",
  viewModes = ["table", "card"],
  defaultView = "table",
  storageKey,
  onViewModeChange,
  renderCard,
  cardColsClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  cardGapClass = "gap-4",

  onRowClick,
  rowHover = true,
  className = "",
}: DataTableProps<T>) {
  /* ========== Search ========== */
  const [query, setQuery] = React.useState(defaultQuery);
  React.useEffect(() => setQuery(defaultQuery), [defaultQuery]);

  const handleQueryChange = React.useCallback(
    (v: string) => {
      setQuery(v);
      onQueryChange?.(v);
    },
    [onQueryChange]
  );

  const filteredRows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    if (filterer) return rows.filter((r) => filterer(r, q));

    const keys = searchByKeys?.length ? searchByKeys : undefined;
    return rows.filter((r: any) => {
      if (keys)
        return keys.some((k) =>
          String(r[k] ?? "")
            .toLowerCase()
            .includes(q)
        );
      for (const k in r) {
        const v = (r as any)[k];
        if (v == null) continue;
        if (typeof v === "string" && v.toLowerCase().includes(q)) return true;
        if (typeof v === "number" && String(v).includes(q)) return true;
      }
      return false;
    });
  }, [rows, query, searchByKeys, filterer]);

  /* ========== Pagination ========== */
  const [limit, setLimit] = React.useState(pageSize);
  React.useEffect(() => setLimit(pageSize), [pageSize]);

  const [offset, setOffset] = React.useState(0);
  React.useEffect(() => setOffset(0), [query, limit]);

  const total = filteredRows.length;
  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(offset + limit, total);
  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  const onPrev = React.useCallback(() => {
    if (!canPrev) return;
    setOffset((v) => Math.max(0, v - limit));
  }, [canPrev, limit]);

  const onNext = React.useCallback(() => {
    if (!canNext) return;
    setOffset((v) =>
      Math.min(v + limit, Math.max(0, total - (total % limit || limit)))
    );
  }, [canNext, limit, total]);

  const pageRows = React.useMemo(
    () => filteredRows.slice(offset, Math.min(offset + limit, total)),
    [filteredRows, offset, limit, total]
  );

  /* ========== View Mode + persistence ========== */
  const STORAGE_KEY =
    storageKey || `CDataTable:view:${title ? String(title) : "default"}`;
  const allowed = React.useMemo(
    () => new Set<ViewMode>(viewModes),
    [viewModes]
  );

  const [view, setView] = React.useState<ViewMode>(() =>
    allowed.has((safeLSGet(STORAGE_KEY) as ViewMode) || defaultView)
      ? (safeLSGet(STORAGE_KEY) as ViewMode) || defaultView
      : defaultView
  );

  React.useEffect(() => {
    if (!allowed.has(view)) {
      const fallback = allowed.has(defaultView) ? defaultView : "table";
      setView(fallback);
      safeLSSet(STORAGE_KEY, fallback);
      onViewModeChange?.(fallback);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewModes.join(",")]);

  const changeView = React.useCallback(
    (m: ViewMode) => {
      if (!allowed.has(m)) return;
      setView(m);
      safeLSSet(STORAGE_KEY, m);
      onViewModeChange?.(m);
    },
    [allowed, STORAGE_KEY, onViewModeChange]
  );

  /* ========== Hover classes ========== */
  const hoverCls = rowHover
    ? "hover:bg-muted/60 dark:hover:bg-muted/30 transition-colors"
    : "";
  const cellHoverCls = rowHover
    ? "transition-colors group-hover/row:bg-muted/60 dark:group-hover/row:bg-muted/30"
    : "";

  /* ========== Controls ========== */
  const ControlsRow = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex-1 min-w-0">
        <Input
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="h-10"
        />
      </div>

      <div className="flex items-center gap-2">
        {viewModes.length > 1 && (
          <div className="flex rounded-md border">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Tabel"
              aria-pressed={view === "table"}
              className={cn(
                "rounded-none",
                view === "table" && "bg-muted text-foreground"
              )}
              onClick={() => changeView("table")}
            >
              <TableIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Kartu"
              aria-pressed={view === "card"}
              className={cn(
                "rounded-none",
                view === "card" && "bg-muted text-foreground"
              )}
              onClick={() => changeView("card")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        )}

        {rightSlot ?? rightControls}

        {pageSizeOptions?.length ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Baris/hal</span>
            <Select
              value={String(limit)}
              onValueChange={(v) => setLimit(Number(v))}
            >
              <SelectTrigger className="h-9 w-[84px] text-sm" data-interactive>
                <SelectValue placeholder={String(limit)} />
              </SelectTrigger>
              <SelectContent align="end">
                {pageSizeOptions.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {onAdd && (
          <Button variant="outline" className="gap-1" onClick={onAdd}>
            <Plus size={16} /> {addLabel}
          </Button>
        )}
      </div>
    </div>
  );

  /* ========== Abaikan klik pada elemen interaktif ========== */
  const shouldIgnoreRowInteraction = (e: React.SyntheticEvent) => {
    const el = e.target as HTMLElement | null;
    if (!el) return false;
    return Boolean(
      el.closest(
        [
          "button",
          "a",
          "input",
          "select",
          "textarea",
          "label",
          `[${NO_ROW_CLICK_ATTR}]`,
          "[data-interactive]",
          ".badge",
          "[data-badge]",
        ].join(",")
      )
    );
  };

  /* ===================== Actions (colored icon pills) ===================== */
  function ActionIconButton(
    props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
      kind: "view" | "edit" | "delete";
      label: string;
      Icon: React.ComponentType<{ size?: number; className?: string }>;
    }
  ) {
    const { kind, label, Icon, className, onClick, ...rest } = props;

    const color =
      kind === "view"
        ? "text-sky-400 bg-sky-500/15 hover:bg-sky-500/25 focus:ring-sky-500/40"
        : kind === "edit"
        ? "text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 focus:ring-amber-500/40"
        : "text-rose-400 bg-rose-500/15 hover:bg-rose-500/25 focus:ring-rose-500/40";

    return (
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(e);
        }}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md",
          "transition-colors outline-none ring-0 focus-visible:ring-2 focus-visible:ring-offset-0",
          color,
          className
        )}
        {...rest}
      >
        <Icon size={16} className="pointer-events-none" />
      </button>
    );
  }

  /* ========== Built-in Actions ========== */
  const suppressView = Boolean(onRowClick);

  const renderBuiltInActions = React.useCallback(
    (row: T) => {
      if (!actions) return null;

      const {
        mode,
        onView,
        onEdit,
        onDelete,
        labels = { view: "Lihat", edit: "Edit", delete: "Hapus" },
      } = actions;

      const hasAny = Boolean(onView || onEdit || onDelete);
      if (!hasAny) return null;

      if (mode === "inline") {
        return (
          <div className="flex items-center justify-center gap-2">
            {onView && !suppressView && (
              <ActionIconButton
                kind="view"
                label={labels.view || "Lihat"}
                Icon={Eye}
                onClick={() => onView(row)}
              />
            )}
            {onEdit && (
              <ActionIconButton
                kind="edit"
                label={labels.edit || "Edit"}
                Icon={Pencil}
                onClick={() => onEdit(row)}
              />
            )}
            {onDelete && (
              <ActionIconButton
                kind="delete"
                label={labels.delete || "Hapus"}
                Icon={Trash2}
                onClick={() => onDelete(row)}
              />
            )}
          </div>
        );
      }

      // mode === "menu"
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Aksi">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && !suppressView && (
              <DropdownMenuItem className="gap-2" onClick={() => onView(row)}>
                <Eye className="h-4 w-4" /> {labels.view || "Lihat"}
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem className="gap-2" onClick={() => onEdit(row)}>
                <Pencil className="h-4 w-4" /> {labels.edit || "Edit"}
              </DropdownMenuItem>
            )}
            {!suppressView && onView && (onEdit || onDelete) ? (
              <DropdownMenuSeparator />
            ) : null}
            {onDelete && (
              <DropdownMenuItem
                className="gap-2 text-destructive focus:text-destructive"
                onClick={() => onDelete(row)}
              >
                <Trash2 className="h-4 w-4" /> {labels.delete || "Hapus"}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    [actions, suppressView]
  );

  /* ===== Kolom Aksi: opsional ===== */
  const anyActionHandlers =
    Boolean(
      actions && (actions.onView || actions.onEdit || actions.onDelete)
    ) || Boolean(renderActions);

  const hasActionsColumn = Boolean(enableActions && anyActionHandlers);
  const actionsHeaderLabel = actions?.headerLabel ?? "Aksi";

  /* ========== Default Card Renderer (meta-aware) ========== */
  const DefaultCard = (row: T, meta: CellMeta) => (
    <div
      onClick={
        onRowClick
          ? (e) => {
              if (shouldIgnoreRowInteraction(e)) return;
              onRowClick(row);
            }
          : undefined
      }
      className={cn(
        "rounded-xl border p-4 space-y-2",
        hoverCls,
        onRowClick && "cursor-pointer"
      )}
      role={onRowClick ? "button" : undefined}
      tabIndex={onRowClick ? 0 : undefined}
      onKeyDown={
        onRowClick
          ? (e) => {
              if (shouldIgnoreRowInteraction(e)) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onRowClick?.(row);
              }
            }
          : undefined
      }
    >
      {columns.map((c) => (
        <div
          key={c.id}
          className="flex items-start justify-between gap-3 text-sm"
        >
          <div className="text-muted-foreground">{c.header}</div>
          <div className="font-medium text-right">
            {c.cell ? c.cell(row, meta) : String((row as any)[c.id] ?? "")}
          </div>
        </div>
      ))}
      {hasActionsColumn && (
        <div className="pt-2 flex justify-end">
          {actions ? renderBuiltInActions(row) : renderActions?.(row)}
        </div>
      )}
    </div>
  );

  /* ========== Render ========== */
  return (
    <div className={cn("w-full flex flex-col gap-4 lg:gap-6", className)}>
      {/* Header / Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="hidden md:flex items-center gap-2 font-semibold">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              aria-label="Kembali"
            >
              <ChevronLeft size={18} />
            </Button>
          )}
          {title && <h1 className="text-lg">{title}</h1>}
        </div>
        {controlsPlacement === "header" && ControlsRow}
      </div>

      {typeof statsSlot !== "undefined" && (
        <CardContent className="p-5">{statsSlot}</CardContent>
      )}

      {controlsPlacement === "above" && (
        <div className="px-0 md:px-5">{ControlsRow}</div>
      )}

      {/* Data area */}
      <div className="px-0 md:px-5">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="animate-spin" size={16} /> Memuat…
          </div>
        ) : error ? (
          <div className="rounded-xl border p-4 text-sm space-y-2">
            <div className="flex items-center gap-2">
              <Info size={16} /> Gagal memuat data.
            </div>
            <pre className="text-xs opacity-70 overflow-auto">{error}</pre>
          </div>
        ) : pageRows.length === 0 ? (
          <div className="rounded-xl border p-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
            {emptySlot ?? (
              <>
                <Info size={16} /> Belum ada data.
              </>
            )}
          </div>
        ) : view === "table" ? (
          /* ===== TABLE MODE ===== */
          <>
            <div className="overflow-auto rounded-xl border">
              <Table>
                <TableHeader
                  className={cn(
                    stickyHeader &&
                      "sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-transparent"
                  )}
                >
                  <TableRow className="bg-primary/10">
                    {columns.map((col) => (
                      <TableHead
                        key={col.id}
                        className={cn(
                          "text-primary font-semibold",
                          col.headerClassName,
                          alignToHeader(col.align ?? defaultAlign)
                        )}
                        style={col.minW ? { minWidth: col.minW } : undefined}
                      >
                        {col.header}
                      </TableHead>
                    ))}
                    {hasActionsColumn && (
                      <TableHead
                        className={cn(
                          "min-w-[80px] text-primary font-semibold",
                          alignToHeader(defaultAlign)
                        )}
                      >
                        {actionsHeaderLabel}
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {pageRows.map((row, idx) => {
                    const rid = getRowId(row);
                    const meta: CellMeta = {
                      pageIndex: idx,
                      absoluteIndex: offset + idx,
                      rowId: rid,
                      isCard: false,
                    };
                    return (
                      <TableRow
                        key={rid}
                        onClick={
                          onRowClick
                            ? (e) => {
                                if (shouldIgnoreRowInteraction(e)) return;
                                onRowClick(row);
                              }
                            : undefined
                        }
                        className={cn(
                          "group/row", // <— penting untuk cell-hover
                          zebra &&
                            idx % 2 === 1 &&
                            "bg-muted/30 dark:bg-muted/20",
                          hoverCls,
                          onRowClick && "cursor-pointer"
                        )}
                        role={onRowClick ? "button" : undefined}
                        tabIndex={onRowClick ? 0 : undefined}
                        onKeyDown={
                          onRowClick
                            ? (e) => {
                                if (shouldIgnoreRowInteraction(e)) return;
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  onRowClick?.(row);
                                }
                              }
                            : undefined
                        }
                      >
                        {columns.map((col) => (
                          <TableCell
                            key={col.id}
                            className={cn(
                              col.className,
                              alignToCell(col.align ?? defaultAlign),
                              cellHoverCls // <— warna ikut saat row di-hover
                            )}
                          >
                            {col.cell
                              ? col.cell(row, meta)
                              : String((row as any)[col.id] ?? "")}
                          </TableCell>
                        ))}

                        {hasActionsColumn && (
                          <TableCell
                            className={cn(
                              alignToCell(defaultAlign),
                              cellHoverCls
                            )}
                          >
                            {actions
                              ? renderBuiltInActions(row)
                              : renderActions?.(row)}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <PaginationFooter
              pageStart={pageStart}
              pageEnd={pageEnd}
              total={total}
              canPrev={canPrev}
              canNext={canNext}
              onPrev={onPrev}
              onNext={onNext}
            />
          </>
        ) : (
          /* ===== CARD MODE ===== */
          <>
            <div className={cn("grid", cardColsClass, cardGapClass)}>
              {pageRows.map((row, idx) => {
                const rid = getRowId(row);
                const meta: CellMeta = {
                  pageIndex: idx,
                  absoluteIndex: offset + idx,
                  rowId: rid,
                  isCard: true,
                };
                return (
                  <div key={rid}>
                    {renderCard ? renderCard(row) : DefaultCard(row, meta)}
                  </div>
                );
              })}
            </div>

            <PaginationFooter
              pageStart={pageStart}
              pageEnd={pageEnd}
              total={total}
              canPrev={canPrev}
              canNext={canNext}
              onPrev={onPrev}
              onNext={onNext}
            />
          </>
        )}
      </div>
    </div>
  );
}

/* =========================
   Small subcomponent: Pagination
========================= */
function PaginationFooter(props: {
  pageStart: number;
  pageEnd: number;
  total: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { pageStart, pageEnd, total, canPrev, canNext, onPrev, onNext } = props;
  return (
    <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted-foreground">
      <div>
        Menampilkan{" "}
        <span className="font-medium text-foreground">{pageStart}</span>–
        <span className="font-medium text-foreground">{pageEnd}</span> dari{" "}
        <span className="font-medium text-foreground">{total}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={!canPrev}
          onClick={onPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={!canNext}
          onClick={onNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* =========================
   Utils
========================= */
function alignToHeader(a: Align = "center") {
  if (a === "center") return "text-center";
  if (a === "right") return "text-right";
  return "text-left";
}
function alignToCell(a: Align = "center") {
  if (a === "center") return "text-center";
  if (a === "right") return "text-right";
  return "text-left";
}

function safeLSGet(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeLSSet(key: string, value: string) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

/* Re-export */
export { CDataTable as DataTable };