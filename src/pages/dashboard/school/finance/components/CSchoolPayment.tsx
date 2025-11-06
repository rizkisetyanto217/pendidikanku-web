import * as React from "react";
import { useEffect, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type PaymentPayload = {
  date: string; // ISO (yyyy-mm-dd)
  payer_name: string;
  invoice_id?: string;
  invoice_title?: string;
  method: "cash" | "transfer" | "virtual_account" | "other";
  amount: number;
  notes?: string;
};

type Option = { value: string; label: string };

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentPayload) => void;
  /** optional: daftar tagihan utk dipilih */
  invoiceOptions?: Option[];
  /** optional: default tanggal (yyyy-mm-dd). default = hari ini */
  defaultDate?: string;
}

export default function SchoolPaymentModal({
  open,
  onClose,
  onSubmit,
  invoiceOptions = [],
  defaultDate,
}: PaymentModalProps) {
  const todayISO = useMemo(() => {
    if (defaultDate) return defaultDate;
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  }, [defaultDate]);

  const [date, setDate] = useState<string>(todayISO);
  const [payer, setPayer] = useState<string>("");
  const [invoiceId, setInvoiceId] = useState<string>("");
  const [invoiceTitle, setInvoiceTitle] = useState<string>("");
  const [method, setMethod] = useState<PaymentPayload["method"]>("cash");
  const [amountStr, setAmountStr] = useState<string>("0");
  const [notes, setNotes] = useState<string>("");

  // Reset form tiap buka
  useEffect(() => {
    if (!open) return;
    setDate(todayISO);
    setPayer("");
    setInvoiceId("");
    setInvoiceTitle("");
    setMethod("cash");
    setAmountStr("0");
    setNotes("");
  }, [open, todayISO]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(amountStr || "0");
    const payload: PaymentPayload = {
      date,
      payer_name: payer.trim(),
      invoice_id: invoiceId || undefined,
      invoice_title: invoiceId ? undefined : invoiceTitle.trim() || undefined,
      method,
      amount: Number.isFinite(amount) ? amount : 0,
      notes: notes.trim() || undefined,
    };
    onSubmit(payload);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Rekam Pembayaran</DialogTitle>
          <DialogDescription>
            Isi detail pembayaran berikut lalu simpan.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input
                id="tanggal"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="metode">Metode</Label>
              <Select
                value={method}
                onValueChange={(v) => setMethod(v as PaymentPayload["method"])}
              >
                <SelectTrigger id="metode">
                  <SelectValue placeholder="Pilih metode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Tunai</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="virtual_account">
                    Virtual Account
                  </SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="payer">Nama Pembayar</Label>
            <Input
              id="payer"
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
              placeholder="Nama orang tua / siswa"
              required
            />
          </div>

          {/* Pilih Tagihan ATAU isi judul manual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="invoice">Pilih Tagihan (opsional)</Label>
              <Select
                value={invoiceId}
                onValueChange={(v) => {
                  setInvoiceId(v);
                  if (v) setInvoiceTitle(""); // kosongkan manual jika memilih tagihan
                }}
              >
                <SelectTrigger id="invoice">
                  <SelectValue placeholder="— Tidak pilih —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">— Tidak pilih —</SelectItem>
                  {invoiceOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="title">Judul Tagihan (manual)</Label>
              <Input
                id="title"
                value={invoiceTitle}
                onChange={(e) => {
                  setInvoiceTitle(e.target.value);
                  if (e.target.value) setInvoiceId(""); // kosongkan pilihan jika manual
                }}
                placeholder="cth: SPP September - 6A"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="amount">Jumlah</Label>
            <Input
              id="amount"
              type="number"
              min={0}
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="notes">Catatan (opsional)</Label>
            <Textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nomor referensi/VA, keterangan tambahan…"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
