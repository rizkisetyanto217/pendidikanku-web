// src/pages/dashboard/unnasigned/details/UnnasignedPaymentFinish.tsx
import { useMemo } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Params = {
  school_slug: string;
};

function useQueryParams() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function UnnasignedPaymentFinish() {
  const navigate = useNavigate();
  const { school_slug } = useParams<Params>();
  const q = useQueryParams();

  const orderId = q.get("order_id") ?? "";
  const statusCode = q.get("status_code") ?? "";
  const transactionStatus = (q.get("transaction_status") ?? "").toLowerCase();

  // status yang dianggap sukses
  const isSuccess =
    transactionStatus === "settlement" || transactionStatus === "capture";

  const isPending = transactionStatus === "pending";

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

  const slug = school_slug ?? "sekolah";

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
          <Badge variant={badgeVariant as any} className="mt-1">
            {transactionStatus || "status-unknown"}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4 text-sm md:text-base">
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs md:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ID Transaksi</span>
              <span className="font-mono font-medium">{orderId || "-"}</span>
            </div>
            {statusCode && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-muted-foreground">Status code</span>
                <span className="font-mono text-xs">{statusCode}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              className="w-full md:w-auto"
              onClick={() => navigate(`/${slug}/user/dashboard`)}
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
