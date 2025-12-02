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

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

import { useState } from "react";

/** Tandai elemen agar tidak memicu onRowClick DataTable */
export const NO_ROW_CLICK_ATTR = "data-no-row-click";

type Mode = "menu" | "inline" | "both";
type Size = "sm" | "md";

export type RowActionsProps<T> = {
  mode?: Mode;
  row: T;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => Promise<void> | void;

  labels?: Partial<{ view: string; edit: string; delete: string }>;
  suppressView?: boolean;
  size?: Size;
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
      ? "text-sky-400 bg-sky-500/15 hover:bg-sky-500/25"
      : kind === "edit"
        ? "text-amber-400 bg-amber-500/15 hover:bg-amber-500/25"
        : "text-rose-400 bg-rose-500/15 hover:bg-rose-500/25";

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

export function CRowActions<T>({
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

  const [confirmOpen, setConfirmOpen] = useState(false);

  const openDeleteModal = () => setConfirmOpen(true);
  const handleConfirmDelete = async () => {
    await onDelete?.(row);
    setConfirmOpen(false);
  };

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
          onClick={openDeleteModal}
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

      <DropdownMenuContent align="end">
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

        {onDelete && (onEdit || onView) && <DropdownMenuSeparator />}

        {onDelete && (
          <DropdownMenuItem
            className="gap-2 text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteModal();
            }}
          >
            <Trash2 className="h-4 w-4" /> {text.delete}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {/* ROW ACTIONS */}
      {mode === "inline"
        ? inlinePart
        : mode === "both"
          ? (
            <div className="flex items-center gap-2">
              {inlinePart}
              {menuPart}
            </div>
          )
          : menuPart}

      {/* ALERT DIALOG (Global internal) */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Hapus item ini?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Item akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default CRowActions;
