// ======================================================
// src/pages/sekolahislamku/pages/finance/SchoolInvoiceDetail.shadcn.tsx
// ======================================================
import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  ArrowLeft,
  CreditCard,
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  Download,
  CheckCircle2,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ================= Types =================
export type InvoiceStatus = "unpaid" | "partial" | "paid" | "overdue";

export interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: number;
  method?: string;
  notes?: string;
  receipt_number?: string;
}

export interface InvoiceDetail {
  id: string;
  title: string;
  description?: string;
  student_id?: string;
  student_name?: string;
  class_name?: string;
  created_date: string;
  due_date: string;
  amount: number;
  paid_amount?: number;
  status: InvoiceStatus;
  type?: string;
  payment_history: PaymentHistoryItem[];
}

// ================= Helpers =================
const atLocalNoon = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
};
const toLocalNoonISO = (d: Date) => atLocalNoon(d).toISOString();
const normalizeISOToLocalNoon = (iso?: string) =>
  iso ? toLocalNoonISO(new Date(iso)) : undefined;

const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";
const hijriLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";
const idr = (n?: number) =>
  n == null
    ? "-"
    : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(n);
const dateFmt = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";
const timeFmt = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

// ================= Dummy Data =================
const dummyInvoiceDetail: InvoiceDetail = {
  id: "inv001",
  title: "SPP September 2025",
  description: "Pembayaran SPP untuk bulan September 2025 kelas 1A",
  student_id: "stu001",
  student_name: "Ahmad Fauzi",
  class_name: "1A",
  created_date: "2025-09-01T12:00:00.000Z",
  due_date: "2025-09-15T12:00:00.000Z",
  amount: 500000,
  paid_amount: 500000,
  status: "paid",
  type: "SPP",
  payment_history: [
    {
      id: "pay001",
      date: "2025-09-14T12:00:00.000Z",
      amount: 500000,
      method: "Transfer Bank",
      notes: "Transfer via BCA",
      receipt_number: "TRX20250914001",
    },
  ],
};

// ================= UI Bits =================
function StatusBadge({ status }: { status: InvoiceStatus }) {
  const map: Record<
    InvoiceStatus,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  > = {
    paid: { label: "Lunas", variant: "default" },
    partial: { label: "Sebagian", variant: "secondary" },
    unpaid: { label: "Belum Bayar", variant: "outline" },
    overdue: { label: "Terlambat", variant: "destructive" },
  };
  const it = map[status];
  return <Badge variant={it.variant}>{it.label}</Badge>;
}

function LoadingSpinner({ text = "Memuat..." }: { text?: string }) {
  return (
    <div className="py-12 text-center text-muted-foreground">
      <div className="inline-flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        {text}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="font-medium text-base mt-1 break-words">{value}</div>
      </div>
    </div>
  );
}

// ================= Receipt Export (Dialog) =================
function ReceiptExportDialog({
  open,
  onOpenChange,
  payments,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  payments: { value: string; label: string }[];
  onSubmit: (data: { paymentId?: string; format: "pdf" | "png" }) => void;
}) {
  const [paymentId, setPaymentId] = useState<string | undefined>(
    payments[0]?.value
  );
  const [format, setFormat] = useState<"pdf" | "png">("pdf");
  useEffect(() => {
    if (payments.length && !paymentId) setPaymentId(payments[0].value);
  }, [payments]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ekspor Kuitansi</DialogTitle>
          <DialogDescription>
            Pilih pembayaran dan format file.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Pembayaran</Label>
            <Select value={paymentId} onValueChange={(v) => setPaymentId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih pembayaran" />
              </SelectTrigger>
              <SelectContent>
                {payments.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as any)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={() => onSubmit({ paymentId, format })}
            className="inline-flex gap-2"
          >
            <Download className="h-4 w-4" /> Ekspor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ================= Main Page =================
export default function SchoolDetailBill() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { id } = useParams<{ id: string }>();

  const gregorianISO = toLocalNoonISO(new Date());

  const [openReceipt, setOpenReceipt] = useState(false);

  // ===== Query =====
  const invoiceQuery = useQuery({
    queryKey: ["invoice-detail", id],
    queryFn: async (): Promise<InvoiceDetail> => {
      return new Promise((resolve) =>
        setTimeout(() => resolve(dummyInvoiceDetail), 400)
      );
    },
    enabled: !!id,
  });
  const invoice = invoiceQuery.data;

  // ===== Mutations =====
  const markPaid = useMutation({
    mutationFn: async (_payload: { id: string; amount?: number }) => {
      await new Promise((r) => setTimeout(r, 600));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoice-detail", id] });
    },
  });


  // ===== Handlers =====
  const handleGoBack = () => navigate(-1);
  const handleMarkPaid = () => {
    if (!invoice) return;
    const remaining = invoice.amount - (invoice.paid_amount || 0);
    markPaid.mutate({ id: invoice.id, amount: remaining });
  };

  // --- Ubah handler ini ---
  const handleDownloadReceipt = (_paymentId: string) => {
    // sebelumnya: setSelectedPaymentId(paymentId);
    setOpenReceipt(true);
  };

  const handleExportReceipt = async ({
    paymentId,
    format,
  }: {
    paymentId?: string;
    format: "pdf" | "png";
  }) => {
    if (!paymentId || !invoice) return;
    const payment = invoice.payment_history.find((p) => p.id === paymentId);
    if (!payment) return;

    const el = document.getElementById(`receipt-${payment.id}`);
    if (!el) return;

    const canvas = await html2canvas(el, { scale: 2 });
    if (format === "png") {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `Kuitansi_${invoice.student_name}_${payment.receipt_number}.png`;
      link.click();
    } else {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `Kuitansi_${invoice.student_name}_${payment.receipt_number}.pdf`
      );
    }
  };

  const getPaymentMethodIcon = (method?: string) =>
    ({ "Transfer Bank": "🏦", Tunai: "💵", "E-Wallet": "📱" }[method || ""] ||
    "💳");

  if (invoiceQuery.isLoading) {
    return (
      <div className="min-h-screen w-full">
        <main className="w-full px-4 md:px-6 md:py-8">
          <div className="max-w-screen-2xl mx-auto">
            <LoadingSpinner text="Memuat detail tagihan..." />
          </div>
        </main>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen w-full">
        <main className="w-full px-4 md:px-6 md:py-8">
          <div className="max-w-screen-2xl mx-auto text-center py-16">
            <div className="text-4xl mb-3">❌</div>
            <div className="font-medium mb-1">Tagihan Tidak Ditemukan</div>
            <div className="text-sm text-muted-foreground mb-4">
              Tagihan dengan ID tersebut tidak ada atau telah dihapus
            </div>
            <Button onClick={handleGoBack}>Kembali ke Daftar Tagihan</Button>
          </div>
        </main>
      </div>
    );
  }

  const dueDate = normalizeISOToLocalNoon(invoice.due_date);
  const createdDate = normalizeISOToLocalNoon(invoice.created_date);
  const isOverdue = invoice.status === "overdue";
  const remainingAmount = invoice.amount - (invoice.paid_amount || 0);

  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-screen-2xl p-4 md:p-5 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            aria-label="Kembali"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base md:text-lg font-semibold truncate">
              {invoice.title}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              ID: {invoice.id} • {dateLong(gregorianISO)} /{" "}
              {hijriLong(gregorianISO)}
            </p>
          </div>
        </div>
      </div>

      <main className="w-full">
        <div className="max-w-screen-2xl mx-auto p-4 md:p-5 space-y-6">
          {/* Status Banner */}
          {isOverdue && (
            <div className="p-4 rounded-lg border-l-4 bg-amber-500/10 border-amber-500">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <div className="font-medium text-amber-700">
                    Tagihan Terlambat
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tagihan ini telah melewati batas waktu pembayaran pada{" "}
                    {dateFmt(dueDate)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Invoice Information */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Informasi Tagihan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow
                  icon={<User className="h-4 w-4" />}
                  label="Nama Siswa"
                  value={invoice.student_name || "-"}
                />
                <InfoRow
                  icon={<FileText className="h-4 w-4" />}
                  label="Kelas"
                  value={invoice.class_name || "-"}
                />
                <InfoRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Tanggal Dibuat"
                  value={dateFmt(createdDate)}
                />
                <InfoRow
                  icon={<Clock className="h-4 w-4" />}
                  label="Jatuh Tempo"
                  value={
                    <span
                      className={
                        isOverdue ? "text-red-600 font-semibold" : undefined
                      }
                    >
                      {dateFmt(dueDate)}
                    </span>
                  }
                />
                <InfoRow
                  icon={
                    <Badge variant="outline">{invoice.type || "Umum"}</Badge>
                  }
                  label="Jenis Tagihan"
                  value={<span />}
                />
                {invoice.description && (
                  <InfoRow
                    icon={<FileText className="h-4 w-4" />}
                    label="Keterangan"
                    value={invoice.description}
                  />
                )}
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5" /> Ringkasan Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Total Tagihan:</span>
                  <span className="font-bold text-xl">
                    {idr(invoice.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Sudah Dibayar:</span>
                  <span className="font-semibold text-lg text-primary">
                    {idr(invoice.paid_amount || 0)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Sisa Tagihan:</span>
                  <span
                    className={`font-bold text-xl ${
                      remainingAmount > 0 ? "text-red-600" : "text-primary"
                    }`}
                  >
                    {idr(remainingAmount)}
                  </span>
                </div>
                <div className="pt-1">
                  <StatusBadge status={invoice.status} />
                </div>
                {remainingAmount > 0 && (
                  <div className="pt-2">
                    <Button
                      onClick={handleMarkPaid}
                      disabled={markPaid.isPending}
                      className="w-full"
                    >
                      {markPaid.isPending ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />{" "}
                          Memproses...
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" /> Tandai Lunas
                        </span>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment History */}
          {invoice.payment_history.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Riwayat Pembayaran
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {invoice.payment_history.length} pembayaran tercatat
                </p>
              </CardHeader>
              <CardContent className="divide-y">
                {invoice.payment_history.map((payment) => {
                  const paymentDate = normalizeISOToLocalNoon(payment.date);
                  return (
                    <div key={payment.id} className="py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">
                              {getPaymentMethodIcon(payment.method)}
                            </span>
                            <div>
                              <div className="font-semibold text-lg">
                                {idr(payment.amount)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {dateFmt(paymentDate)} • {timeFmt(paymentDate)}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="text-muted-foreground">
                                Metode:{" "}
                              </span>
                              <span className="font-medium">
                                {payment.method || "Tidak diketahui"}
                              </span>
                            </div>
                            {payment.receipt_number && (
                              <div>
                                <span className="text-muted-foreground">
                                  No. Kuitansi:{" "}
                                </span>
                                <span className="font-mono text-sm">
                                  {payment.receipt_number}
                                </span>
                              </div>
                            )}
                            {payment.notes && (
                              <div>
                                <span className="text-muted-foreground">
                                  Catatan:{" "}
                                </span>
                                <span>{payment.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReceipt(payment.id)}
                            className="inline-flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Kuitansi</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Export Dialog */}
          <ReceiptExportDialog
            open={openReceipt}
            onOpenChange={setOpenReceipt}
            payments={invoice.payment_history.map((p) => ({
              value: p.id,
              label: `${idr(p.amount)} — ${
                p.method ?? "Metode tidak diketahui"
              }`,
            }))}
            onSubmit={(data) => handleExportReceipt(data)}
          />

          {/* Off-screen Receipt Templates */}
          {invoice.payment_history.map((payment) => (
            <div
              key={payment.id}
              id={`receipt-${payment.id}`}
              className="p-6 bg-white text-black w-[600px]"
              style={{
                position: "absolute",
                top: "-9999px",
                left: "-9999px",
                fontFamily: "Arial, sans-serif",
                border: "1px solid #ddd",
                borderRadius: 8,
              }}
            >
              <h2 className="font-bold text-center mb-2">
                KUITANSI PEMBAYARAN
              </h2>
              <p>
                <strong>Nama Siswa:</strong> {invoice.student_name}
              </p>
              <p>
                <strong>Nama Tagihan:</strong> {invoice.title}
              </p>
              <p>
                <strong>Kelas:</strong> {invoice.class_name}
              </p>
              <p>
                <strong>Jumlah Pembayaran:</strong> {idr(payment.amount)}
              </p>
              <p>
                <strong>Metode:</strong> {payment.method}
              </p>
              <p>
                <strong>No. Kuitansi:</strong> {payment.receipt_number}
              </p>
              <p>
                <strong>Tanggal:</strong> {dateFmt(payment.date)} •{" "}
                {timeFmt(payment.date)}
              </p>
              {payment.notes && (
                <p>
                  <strong>Catatan:</strong> {payment.notes}
                </p>
              )}
              <div className="mt-6 text-right">
                <p>Jakarta, {dateFmt(payment.date)}</p>
                <p>
                  <strong>Bendahara Sekolah</strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
