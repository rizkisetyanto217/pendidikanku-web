import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

import CActionsButton from "@/components/costum/common/buttons/CActionsButton";
import { Button } from "@/components/ui/button";

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
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-sm px-8 pt-10">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col-reverse gap-2 md:flex-row md:justify-end md:gap-2">

                    {/* Batal */}
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="w-full md:w-auto bg-muted/40 hover:bg-muted"
                    >
                        Batal
                    </Button>

                    {/* Hapus */}
                    <CActionsButton
                        onDelete={onConfirm}
                        loadingDelete={loading}
                        noIcon={true}
                        className="w-full md:w-auto"
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
