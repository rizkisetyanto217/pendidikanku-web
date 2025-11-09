// components/ui/CBaseModal.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";

type BaseModalProps = {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: React.ReactNode;
  /** opsional: max width container, default md (28rem) */
  maxWidthClassName?: string; // e.g. "max-w-md", "max-w-lg"
  /** opsional: tambahan className & style untuk konten */
  contentClassName?: string;
  contentStyle?: React.CSSProperties;
  /** kalau true: klik backdrop menutup modal (default true) */
  closeOnBackdrop?: boolean;
};

export default function CBaseModal({
  open,
  onClose,
  ariaLabel,
  children,
  maxWidthClassName = "max-w-md",
  contentClassName = "",
  contentStyle,
  closeOnBackdrop = true,
}: BaseModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : void 0)}>
      {/* custom overlay: blur + dim */}
      <DialogOverlay
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
        )}
      />

      <DialogContent
        aria-label={ariaLabel}
        onInteractOutside={(e) => {
          if (!closeOnBackdrop) e.preventDefault();
        }}
        className={cn(
          "z-50 w-[92vw] rounded-3xl bg-background p-6 text-foreground shadow-2xl",
          "border border-border",
          "data-[state=open]:animate-in data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:zoom-out-95",
          maxWidthClassName,
          contentClassName
        )}
        style={contentStyle}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}
