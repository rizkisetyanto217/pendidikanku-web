// src/pages/dashboard/unnasigned/details/UnnasignedPaymentFinish.tsx
import { useMemo } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import api, { forceRefreshSession } from "@/lib/axios"; // ⬅️ tambah forceRefreshSession

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Params = {
  school_slug: string;
};

type ApiPayment = {
  payment_id: string;
  payment_amount_idr: number;
  payment_status: string;
  payment_method: string;
  payment_gateway_provider: string | null;
  payment_external_id: string | null;
  payment_created_at: string;
  payment_updated_at: string;
  payment_meta: any | null;
};

type ApiPaymentDetailResponse = {
  success: boolean;
  message: string;
  data: ApiPayment;
};

function useQueryParams() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function formatRupiah(amount: number | null | undefined): string {
  if (!amount || amount <= 0) return "-";
  return amount.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
}

function mapInternalStatusToLabel(status: string) {
  const s = status.toLowerCase();
  if (s === "paid") return "Lunas";
  if (s === "pending") return "Menunggu pembayaran";
  if (s === "awaiting_callback") return "Menunggu konfirmasi";
  if (s === "expired") return "Kedaluwarsa";
  if (s === "canceled") return "Dibatalkan";
  if (s === "failed") return "Gagal";
  if (s === "refunded") return "Dikembalikan";
  return status;
}

function mapInternalStatusToBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  const s = status.toLowerCase();
  if (s === "paid") return "default";
  if (s === "pending" || s === "awaiting_callback") return "secondary";
  if (s === "expired" || s === "canceled" || s === "failed")
    return "destructive";
  return "outline";
}

export default function UnnasignedStudentPaymentFinish() {
  const navigate = useNavigate();
  const { school_slug } = useParams<Params>();
  const q = useQueryParams();

  const slug = school_slug ?? "sekolah";

  // === Query param dari Midtrans / kita sendiri ===
  const orderId = q.get("order_id") ?? "";
  const statusCode = q.get("status_code") ?? "";
  const transactionStatus = (q.get("transaction_status") ?? "").toLowerCase();
  const paymentIdQuery = q.get("payment_id") ?? q.get("payment-id") ?? "";

  // status yang dianggap sukses dari sisi Midtrans
  const isSuccessMidtrans =
    transactionStatus === "settlement" || transactionStatus === "capture";

  const isPendingMidtrans = transactionStatus === "pending";

  // === Fetch detail payment dari backend (jika punya payment_id) ===
  const {
    data: paymentResp,
    isLoading: isPaymentLoading,
    isError: isPaymentError,
  } = useQuery({
    queryKey: ["payment-detail", paymentIdQuery],
    enabled: !!paymentIdQuery,
    queryFn: async () => {
      const res = await api.get<ApiPaymentDetailResponse>("/u/payments", {
        params: { payment_id: paymentIdQuery },
      });
      return res.data;
    },
  });

  const payment = paymentResp?.data ?? null;

  // Combine status: kita bisa pakai status internal sebagai "kebenaran" utama
  const internalStatus = payment?.payment_status?.toLowerCase() ?? "";
  const isPaidInternal = internalStatus === "paid";

  // Kalau internal sudah paid, anggap sukses walaupun query midtrans misalnya pending (ada delay).
  const isSuccess = isPaidInternal || isSuccessMidtrans;
  const isPending =
    !isSuccess &&
    (isPendingMidtrans ||
      internalStatus === "pending" ||
      internalStatus === "awaiting_callback");

  const title = isSuccess
    ? "Pembayaran Berhasil"
    : isPending
    ? "Menunggu Pembayaran"
    : "Pembayaran Gagal / Dibatalkan";

  const description = isSuccess
    ? "Terima kasih, pembayaran kamu sudah kami terima. Data pendaftaran akan segera diproses oleh admin sekolah."
    : isPending
    ? "Transaksi kamu masih menunggu penyelesaian. Silakan selesaikan pembayaran sesuai instruksi pada metode yang kamu pilih."
    : "Transaksi tidak berhasil diselesaikan. Jika kamu merasa ini adalah kesalahan, silakan coba lagi atau hubungi admin sekolah.";

  const Icon = isSuccess ? CheckCircle2 : isPending ? Clock : XCircle;
  const iconClass = isSuccess
    ? "text-emerald-500"
    : isPending
    ? "text-amber-500"
    : "text-red-500";

  const badgeVariant = isSuccess
    ? "default"
    : isPending
    ? "secondary"
    : "destructive";

  // Beberapa ringkasan dari payment_meta (kalau ada)
  const bundle = payment?.payment_meta?.bundle ?? null;
  const perItems: Array<any> = bundle?.per_items ?? [];
  const totalAmount =
    payment?.payment_amount_idr ?? bundle?.total_amount_idr ?? 0;

  // ⬇️ Handler: ambil refresh token dulu baru ke dashboard murid
  const handleGoDashboard = async () => {
    try {
      // Paksa refresh session → hit /auth/refresh-token
      await forceRefreshSession();
    } catch (err) {
      console.error(
        "[UnnasignedPaymentFinish] forceRefreshSession error:",
        err
      );
      // kalau gagal, tetap kita lanjut navigate biar UX-nya nggak mentok
    } finally {
      navigate(`/${slug}/murid/dashboard`);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 md:py-14 md:px-6">
      <div className="mb-4">
        <Link
          to={`/${slug}/user/pendaftaran`}
          className="text-xs text-muted-foreground hover:underline"
        >
          ← Kembali ke daftar program
        </Link>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Icon className={`w-7 h-7 ${iconClass}`} />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-lg md:text-2xl font-semibold">
              {title}
            </CardTitle>
            <p className="text-xs md:text-sm text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center items-center mt-1">
            <Badge variant={badgeVariant as any}>
              {transactionStatus || "status-unknown"}
            </Badge>

            {payment && (
              <Badge
                variant={mapInternalStatusToBadgeVariant(internalStatus) as any}
              >
                Sistem: {mapInternalStatusToLabel(payment.payment_status)}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-sm md:text-base">
          {/* Info dari Midtrans */}
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs md:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                ID Transaksi (order_id)
              </span>
              <span className="font-mono font-medium">{orderId || "-"}</span>
            </div>
            {statusCode && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-muted-foreground">Status code</span>
                <span className="font-mono text-xs">{statusCode}</span>
              </div>
            )}
            {paymentIdQuery && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-muted-foreground">
                  Payment ID (sistem)
                </span>
                <span className="font-mono text-[11px]">{paymentIdQuery}</span>
              </div>
            )}
          </div>

          {/* Ringkasan payment dari backend */}
          <div className="pt-1 space-y-2">
            {isPaymentLoading && paymentIdQuery && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Mengambil rincian pembayaran dari sistem...
              </p>
            )}

            {isPaymentError && (
              <p className="text-xs text-destructive">
                Gagal mengambil rincian pembayaran. Jika ragu, hubungi admin
                sekolah.
              </p>
            )}

            {payment && (
              <div className="rounded-md border bg-background px-3 py-3 space-y-2 text-xs md:text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Nominal</span>
                  <span className="font-semibold">
                    {formatRupiah(totalAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Metode</span>
                  <span className="font-medium">
                    {payment.payment_method === "gateway"
                      ? payment.payment_gateway_provider || "gateway"
                      : payment.payment_method}
                  </span>
                </div>

                {perItems.length > 0 && (
                  <div className="pt-2 border-t border-border/60 space-y-1">
                    <p className="text-[11px] text-muted-foreground mb-1">
                      Rincian pendaftaran:
                    </p>
                    <ul className="space-y-1">
                      {perItems.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex-1">
                            <p className="text-xs font-medium">
                              {item.label || item.code || "Pilihan"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {item.class_id ? `Kelas: ${item.class_id}` : null}
                            </p>
                          </div>
                          <span className="text-xs font-semibold">
                            {formatRupiah(item.amount_idr)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {payment.payment_meta?.fee_rule_gbk_category_snapshot && (
                  <p className="text-[11px] text-muted-foreground pt-1">
                    Kategori:{" "}
                    {String(
                      payment.payment_meta.fee_rule_gbk_category_snapshot
                    ).toUpperCase()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Tombol navigasi */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              className="w-full md:w-auto"
              onClick={handleGoDashboard} // ⬅️ pakai handler baru
            >
              Pergi ke Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              variant="outline"
              className="w-full md:w-auto"
              onClick={() => navigate(`/${slug}/user/pendaftaran`)}
            >
              Lihat Program Lain
            </Button>
          </div>

          <p className="mt-2 text-[11px] text-muted-foreground">
            Jika halaman ini tidak sesuai dengan status pembayaran terakhir
            kamu, silakan tunggu beberapa saat lalu cek kembali atau hubungi
            admin sekolah.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
