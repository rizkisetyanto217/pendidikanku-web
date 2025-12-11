// src/components/custom/common/buttons/CActionsButton.tsx
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type Props = {
    onEdit?: () => void;
    onDelete?: () => void;
    onCancel?: () => void;
    onSave?: () => void;
    loadingSave?: boolean;
    loadingDelete?: boolean;

    isModal?: boolean;
    closeModal?: () => void;

    noIcon?: boolean; // hide icon (untuk modal)
    className?: string;
};

export default function CActionsButton({
    onEdit,
    onDelete,
    onCancel,
    onSave,
    loadingSave = false,
    loadingDelete = false,
    isModal = false,
    closeModal,
    noIcon = false,
    className,
}: Props) {
    return (
        <div className="flex items-center gap-2">

            {/* EDIT BUTTON */}
            {onEdit && (
                <Button
                    onClick={onEdit}
                    className="
                        bg-[hsl(var(--warn-text))]
                        hover:bg-[hsl(var(--warn-text)/0.90)]
                        shadow-sm
                        text-black dark:text-white
                    "
                >
                    {!noIcon && (
                        <Pencil
                            size={16}
                            className="mr-2 text-black dark:text-white"
                        />
                    )}
                    Edit
                </Button>
            )}

            {/* DELETE BUTTON */}
            {onDelete && (
                <Button
                    onClick={onDelete}
                    disabled={loadingDelete}
                    className={cn(
                        `
                            bg-[hsl(var(--destructive))]
                            text-[hsl(var(--destructive-foreground))]
                            hover:bg-[hsl(var(--destructive)/0.90)]
                            shadow-sm
                            text-black dark:text-white
                        `,
                        className
                    )}
                >
                    {!noIcon && (
                        <Trash2
                            size={16}
                            className="mr-2 text-black dark:text-white"
                        />
                    )}
                    {loadingDelete ? "Menghapus..." : "Hapus"}
                </Button>
            )}

            {/* CANCEL (biasa) */}
            {onCancel && !isModal && (
                <Button
                    onClick={onCancel}
                    className="
                        bg-[hsl(var(--neutral-bg)/0.20)]
                        hover:bg-[hsl(var(--neutral-bg)/0.30)]
                        shadow-sm
                        text-black dark:text-white
                    "
                >
                    Batal
                </Button>
            )}

            {/* CANCEL khusus dalam modal */}
            {onCancel && isModal && (
                <AlertDialogCancel
                    onClick={closeModal}
                    className={cn(
                        `
                            bg-[hsl(var(--destructive))]
                            text-[hsl(var(--destructive-foreground))]
                            hover:bg-[hsl(var(--destructive)/0.90)]
                            shadow-sm
                            text-black dark:text-white
                        `,
                        noIcon && "min-w-[90px]",
                        className
                    )}
                >
                    Batal
                </AlertDialogCancel>
            )}

            {/* SAVE BUTTON */}
            {onSave && (
                <Button
                    onClick={onSave}
                    disabled={loadingSave}
                    className="
                        bg-green-600
                        hover:bg-green-700
                        text-black dark:text-white
                        shadow-sm"
                >
                    {loadingSave ? "Menyimpan..." : "Simpan"}
                </Button>
            )}

        </div>
    );
}
