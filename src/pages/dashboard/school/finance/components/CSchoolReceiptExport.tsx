import { useEffect, useState } from "react";
import { Download } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { paymentId?: string; format: "pdf" }) => void;
  paymentOptions: { value: string; label: string }[];
};

export default function SchoolReceiptExport({
  open,
  onClose,
  onSubmit,
  paymentOptions,
}: Props) {
  const [selectedPayment, setSelectedPayment] = useState<string | undefined>(
    paymentOptions[0]?.value
  );

  useEffect(() => {
    // reset/default ketika daftar berubah atau dialog dibuka
    if (open) setSelectedPayment(paymentOptions[0]?.value);
  }, [open, paymentOptions]);

  const handlePrint = () => {
    if (!selectedPayment) return;
    onSubmit({ paymentId: selectedPayment, format: "pdf" });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? null : onClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cetak Kuitansi Pembayaran</DialogTitle>
          <DialogDescription>
            Pilih pembayaran untuk mengunduh kuitansi dalam format PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="payment">Pilih Pembayaran</Label>
            <Select
              value={selectedPayment}
              onValueChange={(v) => setSelectedPayment(v)}
            >
              <SelectTrigger id="payment">
                <SelectValue placeholder="-- Pilih Pembayaran --" />
              </SelectTrigger>
              <SelectContent>
                {paymentOptions.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            onClick={handlePrint}
            disabled={!selectedPayment}
            className="inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Cetak PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
