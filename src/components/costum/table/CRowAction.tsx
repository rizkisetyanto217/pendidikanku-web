"use client";

import { Eye, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

/** Tandai elemen agar tidak memicu onRowClick DataTable */
export const NO_ROW_CLICK_ATTR = "data-no-row-click";

type Mode = "menu" | "inline" | "both";
type Size = "sm" | "md";

export type RowActionsProps<T> = {
  /** Default: "menu" (titik-tiga). "both" = menu + ikon inline */
  mode?: Mode;
  row: T;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  labels?: Partial<{ view: string; edit: string; delete: string }>;
  suppressView?: boolean;
  size?: Size; // untuk ikon inline
  className?: string;
};

function PillIconButton(props: {
  kind: "view" | "edit" | "delete";
  label: string;
  onClick?: () => void;
  size?: Size;
}) {
  const { kind, label, onClick, size = "md" } = props;
  const Icon = kind === "view" ? Eye : kind === "edit" ? Pencil : Trash2;

  const base =
    "inline-flex items-center justify-center rounded-md transition-colors outline-none ring-0 focus-visible:ring-2 focus-visible:ring-offset-0";
  const h = size === "sm" ? "h-7 w-7" : "h-8 w-8";

  const color =
    kind === "view"
      ? "text-sky-400 bg-sky-500/15 hover:bg-sky-500/25 focus-visible:ring-sky-500/40"
      : kind === "edit"
      ? "text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 focus-visible:ring-amber-500/40"
      : "text-rose-400 bg-rose-500/15 hover:bg-rose-500/25 focus-visible:ring-rose-500/40";

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(base, h, color)}
      {...{ [NO_ROW_CLICK_ATTR]: "" }}
    >
      <Icon size={16} className="pointer-events-none" />
    </button>
  );
}

function ActionsMenuContent<T>({
  row,
  text,
  suppressView,
  onView,
  onEdit,
  onDelete,
}: {
  row: T;
  text: { view: string; edit: string; delete: string };
  suppressView?: boolean;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}) {
  return (
    <DropdownMenuContent
      align="end"
      className="z-50"
      {...{ [NO_ROW_CLICK_ATTR]: "" }}
    >
      {!suppressView && onView && (
        <DropdownMenuItem
          className="gap-2"
          onClick={(e) => {
            e.stopPropagation();
            onView(row);
          }}
        >
          <Eye className="h-4 w-4" /> {text.view}
        </DropdownMenuItem>
      )}

      {onEdit && (
        <DropdownMenuItem
          className="gap-2"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(row);
          }}
        >
          <Pencil className="h-4 w-4" /> {text.edit}
        </DropdownMenuItem>
      )}

      {onDelete && (onView || onEdit) ? <DropdownMenuSeparator /> : null}

      {onDelete && (
        <DropdownMenuItem
          className="gap-2 text-destructive focus:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(row);
          }}
        >
          <Trash2 className="h-4 w-4" /> {text.delete}
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  );
}

/** RowActions – default menu titik-tiga; bisa "inline" atau "both" */
export function RowActions<T>({
  mode = "menu",
  row,
  onView,
  onEdit,
  onDelete,
  labels,
  suppressView,
  size = "md",
  className,
}: RowActionsProps<T>) {
  const text = {
    view: labels?.view ?? "Lihat",
    edit: labels?.edit ?? "Edit",
    delete: labels?.delete ?? "Hapus",
  };

  const any =
    Boolean(!suppressView && onView) || Boolean(onEdit) || Boolean(onDelete);
  if (!any) return null;

  const inlinePart = (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {!suppressView && onView && (
        <PillIconButton
          kind="view"
          label={text.view}
          onClick={() => onView(row)}
          size={size}
        />
      )}
      {onEdit && (
        <PillIconButton
          kind="edit"
          label={text.edit}
          onClick={() => onEdit(row)}
          size={size}
        />
      )}
      {onDelete && (
        <PillIconButton
          kind="delete"
          label={text.delete}
          onClick={() => onDelete(row)}
          size={size}
        />
      )}
    </div>
  );

  const menuPart = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Aksi"
          {...{ [NO_ROW_CLICK_ATTR]: "" }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <ActionsMenuContent
        row={row}
        text={text}
        suppressView={suppressView}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </DropdownMenu>
  );

  if (mode === "inline") return inlinePart;
  if (mode === "both") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {inlinePart}
        {menuPart}
      </div>
    );
  }
  // default: "menu"
  return menuPart;
}

export default RowActions;
