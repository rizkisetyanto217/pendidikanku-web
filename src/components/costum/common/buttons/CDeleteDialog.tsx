import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog";

import CActionsButton from "@/components/costum/common/buttons/CActionsButton";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";


type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
    title?: string;
    description?: string;
};

export default function CDeleteDialog({
    open,
    onClose,
    onConfirm,
    loading = false,
    title = "Hapus data ini?",
    description = "Tindakan ini tidak dapat dibatalkan.",
}: Props) {
    return (
        <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel
                        className="
                            bg-[hsl(var(--neutral-bg)/0.35)]
                            text-[hsl(var(--neutral-text))]
                            hover:bg-[hsl(var(--neutral-bg)/0.55)]
                            shadow-sm
                        "
                    >
                        Batal
                    </AlertDialogCancel>



                    <CActionsButton
                        onDelete={onConfirm}
                        loadingDelete={loading}
                        noIcon={true}   // icon akan hilang di modal
                    />
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

