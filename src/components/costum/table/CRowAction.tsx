import { Eye, Pencil, Trash2, MoreHorizontal, Download, ExternalLink } from "lucide-react";
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

export const NO_ROW_CLICK_ATTR = "data-no-row-click";

type Mode = "menu" | "inline" | "both";
type Size = "sm" | "md";

export type RowActionsProps<T> = {
  mode?: Mode;
  row: T;

  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => Promise<void> | void;

  /** ⬇ NEW */
  onDownload?: (row: T) => void;
  onOpenLink?: (row: T) => void;

  labels?: Partial<{ view: string; edit: string; delete: string; download: string; link: string }>;
  suppressView?: boolean;
  size?: Size;
  className?: string;

  forceMenu?: boolean;
};

/* ---------------- ICON BUTTON WITH COLORS ---------------- */
function PillIconButton(props: {
  kind: "view" | "edit" | "delete" | "download" | "link";
  label: string;
  onClick?: () => void;
  size?: Size;
}) {
  const { kind, label, onClick, size = "md" } = props;

  const Icon =
    kind === "view" ? Eye :
      kind === "edit" ? Pencil :
        kind === "delete" ? Trash2 :
          kind === "download" ? Download :
            ExternalLink;

  const base = "inline-flex items-center justify-center rounded-md transition-colors";
  const h = size === "sm" ? "h-7 w-7" : "h-8 w-8";

  const color =
    kind === "view" ? "text-sky-400 bg-sky-500/15 hover:bg-sky-500/25" :
      kind === "edit" ? "text-amber-400 bg-amber-500/15 hover:bg-amber-500/25" :
        kind === "delete" ? "text-rose-400 bg-rose-500/15 hover:bg-rose-500/25" :
          kind === "download" ? "text-blue-400 bg-blue-500/15 hover:bg-blue-500/25" :
            "text-violet-400 bg-violet-500/15 hover:bg-violet-500/25";

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

/* ---------------- MAIN COMPONENT ---------------- */
export function CRowActions<T>({
  mode = "menu",
  forceMenu = false,
  row,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onOpenLink,
  labels,
  suppressView,
  size = "md",
  className,
}: RowActionsProps<T>) {

  const text = {
    view: labels?.view ?? "Lihat",
    edit: labels?.edit ?? "Edit",
    delete: labels?.delete ?? "Hapus",
    download: labels?.download ?? "Unduh File",
    link: labels?.link ?? "Buka Tautan",
  };

  const effectiveMode: Mode = forceMenu ? "menu" : mode;

  const [confirmOpen, setConfirmOpen] = useState(false);

  const openDeleteModal = () => setConfirmOpen(true);
  const handleConfirmDelete = async () => {
    await onDelete?.(row);
    setConfirmOpen(false);
  };

  /* ---------------- INLINE MODE ---------------- */
  const inlinePart = (
    <div className={cn("flex items-center justify-center gap-2", className)}>

      {onDownload && (
        <PillIconButton
          kind="download"
          label={text.download}
          size={size}
          onClick={() => onDownload(row)}
        />
      )}

      {onOpenLink && (
        <PillIconButton
          kind="link"
          label={text.link}
          size={size}
          onClick={() => onOpenLink(row)}
        />
      )}

      {!suppressView && onView && (
        <PillIconButton
          kind="view"
          label={text.view}
          size={size}
          onClick={() => onView(row)}
        />
      )}

      {onEdit && (
        <PillIconButton
          kind="edit"
          label={text.edit}
          size={size}
          onClick={() => onEdit(row)}
        />
      )}

      {onDelete && (
        <PillIconButton
          kind="delete"
          label={text.delete}
          size={size}
          onClick={openDeleteModal}
        />
      )}
    </div>
  );

  /* ---------------- DROPDOWN MENU ---------------- */
  const menuPart = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" {...{ [NO_ROW_CLICK_ATTR]: "" }}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="border-0 shadow-lg p-1 bg-popover"
      >

        {/* UNDUH FILE */}
        {onDownload && (
          <DropdownMenuItem
            className="gap-2 hover:bg-muted/20"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(row);
            }}
          >
            <Download className="h-4 w-4" /> {text.download}
          </DropdownMenuItem>
        )}

        {/* BUKA LINK */}
        {onOpenLink && (
          <DropdownMenuItem
            className="gap-2 hover:bg-muted/20"
            onClick={(e) => {
              e.stopPropagation();
              onOpenLink(row);
            }}
          >
            <ExternalLink className="h-4 w-4" /> {text.link}
          </DropdownMenuItem>
        )}

        {/* EDIT */}
        {onEdit && (
          <DropdownMenuItem
            className="gap-2 hover:bg-muted/20"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row);
            }}
          >
            <Pencil className="h-4 w-4" /> {text.edit}
          </DropdownMenuItem>
        )}

        {/* === SEPARATOR HANYA SEBELUM HAPUS === */}
        {onDelete && (onDownload || onOpenLink || onEdit) && (
          <DropdownMenuSeparator className="my-1 bg-border" />
        )}

        {/* HAPUS */}
        {onDelete && (
          <DropdownMenuItem
            className="gap-2 text-destructive hover:bg-destructive/10"
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
      {effectiveMode === "inline" ? inlinePart :
        effectiveMode === "both" ? <div className="flex gap-2">{inlinePart}{menuPart}</div> :
          menuPart}

      {/* ALERT DELETE */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus item ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={handleConfirmDelete}
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
