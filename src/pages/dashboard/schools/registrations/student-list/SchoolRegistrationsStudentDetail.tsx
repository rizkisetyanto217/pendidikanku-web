import * as React from "react";
import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

/* layout */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* shadcn */
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/* Icons */
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  FileText,
  User,
} from "lucide-react";

/* ================= Helpers ================= */

const fmtIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const fmtDateTime = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

/* ================= Types (sesuai contoh JSON) ================= */

type BundleItem = {
  idx: number;
  code: string;
  label: string;
  source?: string;
  class_id?: string;
  amount_idr: number;
};

type BundleMeta = {
  class_ids?: string[];
  per_items?: BundleItem[];
  enrollment_ids?: string[];
  per_shares_idr?: number[];
  total_amount_idr?: number;
};

type CustomerMeta = {
  City?: string;
  Email?: string;
  Phone?: string;
  Address?: string;
  Country?: string;
  LastName?: string;
  Postcode?: string;
  FirstName?: string;
};

type PaymentMeta = {
  bundle?: BundleMeta;
  customer?: CustomerMeta;
  fee_rule_id?: string;
  payer_user_id?: string;
  fee_rule_gbk_category_snapshot?: string;
};

type ApiPayment = {
  payment_id: string;
  payment_school_id: string;
  payment_user_id: string;
  payment_general_billing_kind_id: string | null;
  payment_amount_idr: number;
  payment_currency: string;
  payment_status: string;
  payment_method: string;
  payment_gateway_provider: string | null;
  payment_external_id: string | null;
  payment_gateway_reference: string | null;
  payment_checkout_url: string | null;
  payment_qr_string: string | null;
  payment_entry_type: string;
  payment_invoice_number: string | null;
  payment_invoice_due_date: string | null;
  payment_invoice_title: string | null;
  payment_user_name_snapshot: string | null;
  payment_full_name_snapshot: string | null;
  payment_email_snapshot: string | null;
  payment_donation_name_snapshot: string | null;
  payment_description: string | null;
  payment_note: string | null;
  payment_meta: PaymentMeta | null;
  payment_requested_at: string | null;
  payment_expires_at: string | null;
  payment_paid_at: string | null;
  payment_canceled_at: string | null;
  payment_failed_at: string | null;
  payment_refunded_at: string | null;
  payment_created_at: string;
  payment_updated_at: string;
};

type ApiPaymentDetailResponse = {
  success: boolean;
  message: string;
  data: ApiPayment;
};

/* ================= Small helpers ================= */

function statusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  const s = status.toLowerCase();
  if (s === "paid" || s === "success") return "default";
  if (s === "pending" || s === "awaiting_callback") return "secondary";
  if (s === "failed" || s === "canceled" || s === "refunded")
    return "destructive";
  return "outline";
}

function prettyStatus(status: string) {
  const s = status.toLowerCase();
  switch (s) {
    case "paid":
      return "Lunas";
    case "pending":
      return "Menunggu pembayaran";
    case "awaiting_callback":
      return "Menunggu konfirmasi";
    case "failed":
      return "Gagal";
    case "canceled":
      return "Dibatalkan";
    case "refunded":
      return "Dikembalikan";
    default:
      return status;
  }
}

function prettyMethod(method: string | null, provider: string | null) {
  if (!method) return "-";
  if (method === "gateway") {
    return provider ? `Gateway (${provider})` : "Gateway";
  }
  if (method === "manual") return "Manual";
  return method;
}

/* ================= Page Component ================= */

type Props = {
  showBack?: boolean;
  backTo?: string;
};

const SchoolRegistrationPaymentDetail: React.FC<Props> = ({
  showBack = true,
  backTo,
}) => {
  const navigate = useNavigate();
  const { schoolId } = useParams<{ schoolId: string }>();
  const [sp] = useSearchParams();

  // paymentId bisa dari route param atau query ?payment_id=
  const paymentIdParam = sp.get("payment_id");
  const paymentId = paymentIdParam || ""; // wajib ada

  const handleBack = () => {
    if (backTo) return navigate(backTo);
    return navigate(-1);
  };

  const { setHeader } = useDashboardHeader();
  React.useEffect(() => {
    setHeader({
      title: "Detail Pembayaran PMB",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Pendaftaran" },
        {
          label: "Murid",
          href: `/${schoolId}/pendaftaran/murid`,
        },
        { label: "Detail Pembayaran" },
      ],
      showBack,
    });
  }, [setHeader, schoolId, showBack]);

  /* ===== Query payment detail ===== */
  const paymentQ = useQuery<ApiPayment, Error>({
    queryKey: ["payment-detail", paymentId],
    enabled: !!paymentId,
    queryFn: async () => {
      const res = await api.get<ApiPaymentDetailResponse>("/api/u/payments", {
        params: { payment_id: paymentId },
      });
      return res.data.data;
    },
  });

  const payment = paymentQ.data ?? null;

  const bundleItems: BundleItem[] = useMemo(() => {
    const meta = payment?.payment_meta;
    if (!meta?.bundle?.per_items) return [];
    return meta.bundle.per_items;
  }, [payment]);

  const bundleTotal = payment?.payment_meta?.bundle?.total_amount_idr;

  /* ===== Loading / Error ===== */
  if (!paymentId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
        <div className="text-sm text-destructive">
          payment_id tidak ditemukan di URL.
        </div>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>
    );
  }

  if (paymentQ.isLoading) {
    return (
      <div className="flex items-center justify-center min-height-[60vh] gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat detail pembayaran…
      </div>
    );
  }

  if (paymentQ.isError || !payment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
        <div className="text-sm text-destructive">
          Gagal memuat detail pembayaran.
        </div>
        <div className="text-xs text-muted-foreground">
          {(paymentQ.error && paymentQ.error.message) ||
            "Terjadi kesalahan tidak diketahui."}
        </div>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>
    );
  }

  const customer = payment.payment_meta?.customer;
  const feeCategory = payment.payment_meta?.fee_rule_gbk_category_snapshot;

  return (
    <div className="space-y-4">
      {/* local header */}
      <div className="flex items-center gap-3 mb-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Detail Pembayaran PMB</h1>
          <p className="text-xs text-muted-foreground">
            ID Pembayaran:{" "}
            <span className="font-mono text-[11px]">{payment.payment_id}</span>
          </p>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid gap-3 md:grid-cols-3">
        {/* Amount & status */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4" />
              Ringkasan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <div className="text-2xl font-semibold">
              {fmtIDR(payment.payment_amount_idr)}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant={statusBadgeVariant(payment.payment_status)}>
                {prettyStatus(payment.payment_status)}
              </Badge>
              <span className="text-muted-foreground">
                {prettyMethod(
                  payment.payment_method,
                  payment.payment_gateway_provider
                )}
              </span>
            </div>
            {feeCategory && (
              <p className="text-[11px] text-muted-foreground">
                Kategori:{" "}
                <span className="font-medium capitalize">
                  {feeCategory.replace(/_/g, " ")}
                </span>
              </p>
            )}
            {payment.payment_entry_type && (
              <p className="text-[11px] text-muted-foreground">
                Tipe entri:{" "}
                <span className="font-mono">{payment.payment_entry_type}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Payer info */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              Pembayar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Nama akun</div>
              <div className="font-medium">
                {payment.payment_user_name_snapshot || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Nama lengkap</div>
              <div className="font-medium">
                {payment.payment_full_name_snapshot || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Email</div>
              <div className="font-mono text-xs">
                {payment.payment_email_snapshot || "-"}
              </div>
            </div>
            {customer && (
              <>
                <Separator className="my-1" />
                <div className="text-[11px] text-muted-foreground">
                  Data customer (Midtrans)
                </div>
                <div className="text-xs space-y-0.5">
                  {customer.FirstName || customer.LastName ? (
                    <div>
                      {customer.FirstName} {customer.LastName}
                    </div>
                  ) : null}
                  {customer.Phone && <div>Telp: {customer.Phone}</div>}
                  {customer.Address && <div>Alamat: {customer.Address}</div>}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0 text-xs">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Dibuat</span>
              <span>{fmtDateTime(payment.payment_created_at)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Diminta</span>
              <span>{fmtDateTime(payment.payment_requested_at)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Dibayar</span>
              <span>{fmtDateTime(payment.payment_paid_at)}</span>
            </div>
            {payment.payment_expires_at && (
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Kadaluarsa</span>
                <span>{fmtDateTime(payment.payment_expires_at)}</span>
              </div>
            )}
            {payment.payment_canceled_at && (
              <div className="flex justify-between gap-2 text-destructive">
                <span>Dibatalkan</span>
                <span>{fmtDateTime(payment.payment_canceled_at)}</span>
              </div>
            )}
            {payment.payment_failed_at && (
              <div className="flex justify-between gap-2 text-destructive">
                <span>Gagal</span>
                <span>{fmtDateTime(payment.payment_failed_at)}</span>
              </div>
            )}
            {payment.payment_refunded_at && (
              <div className="flex justify-between gap-2 text-destructive">
                <span>Dikembalikan</span>
                <span>{fmtDateTime(payment.payment_refunded_at)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bundle detail */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <CardTitle className="text-sm">
              Rincian Paket / Pendaftaran
            </CardTitle>
          </div>
          {payment.payment_checkout_url && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                window.open(payment.payment_checkout_url!, "_blank")
              }
            >
              Buka Link Pembayaran
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {bundleItems.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Tidak ada rincian paket pada meta.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="py-2 pr-2 text-left">Item</th>
                    <th className="py-2 px-2 text-left">Kode</th>
                    <th className="py-2 px-2 text-left">Sumber</th>
                    <th className="py-2 px-2 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {bundleItems.map((item) => (
                    <tr key={item.idx} className="border-b last:border-none">
                      <td className="py-1.5 pr-2">
                        <div className="font-medium">{item.label}</div>
                        {item.class_id && (
                          <div className="text-[11px] text-muted-foreground">
                            class_id:{" "}
                            <span className="font-mono">{item.class_id}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-1.5 px-2">{item.code}</td>
                      <td className="py-1.5 px-2">
                        {item.source ? item.source : "-"}
                      </td>
                      <td className="py-1.5 px-2 text-right tabular-nums">
                        {fmtIDR(item.amount_idr)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {bundleTotal != null && (
                  <tfoot>
                    <tr className="border-t">
                      <td
                        colSpan={3}
                        className="py-2 px-2 text-right font-medium"
                      >
                        Total
                      </td>
                      <td className="py-2 px-2 text-right font-semibold tabular-nums">
                        {fmtIDR(bundleTotal)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}

          {payment.payment_description && (
            <>
              <Separator />
              <div className="text-xs">
                <div className="text-muted-foreground mb-1">Keterangan</div>
                <p>{payment.payment_description}</p>
              </div>
            </>
          )}

          {payment.payment_note && (
            <div className="text-xs">
              <div className="text-muted-foreground mb-1">Catatan internal</div>
              <p>{payment.payment_note}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {payment.payment_status.toLowerCase() === "paid" && (
        <div className="flex items-center gap-2 text-xs text-emerald-500 mt-1">
          <CheckCircle2 className="h-4 w-4" />
          Pembayaran sudah dinyatakan lunas.
        </div>
      )}
      {payment.payment_status.toLowerCase() === "failed" && (
        <div className="flex items-center gap-2 text-xs text-destructive mt-1">
          <XCircle className="h-4 w-4" />
          Pembayaran gagal, mohon buat ulang permintaan pembayaran.
        </div>
      )}
    </div>
  );
};

export default SchoolRegistrationPaymentDetail;
