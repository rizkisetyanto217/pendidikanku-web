// src/pages/student/StudentReEnrollmentPage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  RefreshCcw,
  Wallet,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

/* Import untuk breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

/* ============================================
   Types
============================================ */

type ReEnrollmentStatus = "unpaid" | "partial" | "paid" | "expired";

type ReEnrollmentItem = {
  id: string;
  oldClassName: string;
  newClassName: string;
  levelLabel?: string;
  academicYearFrom: string;
  academicYearTo: string;

  registrationFeeLabel: string;
  sppMonthlyLabel: string;
  sppMonthsCount: number;
  totalBillLabel: string;
  outstandingLabel: string;

  status: ReEnrollmentStatus;
  dueDateLabel?: string;
  lastPaymentLabel?: string;
  canReEnroll: boolean;
};

/* ============================================
   Demo data
============================================ */

const DEMO_REENROLL_ITEMS: ReEnrollmentItem[] = [
  {
    id: "re1",
    oldClassName: "Tahfidz Juz 30 Dasar",
    newClassName: "Tahfidz Juz 29-30 Lanjutan",
    levelLabel: "SMP / 8",
    academicYearFrom: "2024/2025",
    academicYearTo: "2025/2026",
    registrationFeeLabel: "Rp 500.000",
    sppMonthlyLabel: "Rp 350.000 / bulan",
    sppMonthsCount: 12,
    totalBillLabel: "Rp 4.700.000",
    outstandingLabel: "Rp 4.700.000",
    status: "unpaid",
    dueDateLabel: "Sampai 30 Juni 2025",
    canReEnroll: true,
  },
  {
    id: "re2",
    oldClassName: "Fiqih Ibadah Praktis",
    newClassName: "Fiqih Ibadah Lanjutan",
    levelLabel: "SMA / XI",
    academicYearFrom: "2024/2025",
    academicYearTo: "2025/2026",
    registrationFeeLabel: "Rp 300.000",
    sppMonthlyLabel: "Rp 400.000 / bulan",
    sppMonthsCount: 10,
    totalBillLabel: "Rp 4.300.000",
    outstandingLabel: "Rp 1.200.000",
    status: "partial",
    dueDateLabel: "Sampai 15 Juli 2025",
    lastPaymentLabel: "Terakhir bayar 2 Mei 2025",
    canReEnroll: true,
  },
  {
    id: "re3",
    oldClassName: "Matematika Wajib X IPA",
    newClassName: "Matematika Wajib XI IPA",
    levelLabel: "SMA / XI",
    academicYearFrom: "2023/2024",
    academicYearTo: "2024/2025",
    registrationFeeLabel: "Rp 250.000",
    sppMonthlyLabel: "Rp 350.000 / bulan",
    sppMonthsCount: 12,
    totalBillLabel: "Rp 4.450.000",
    outstandingLabel: "Lunas",
    status: "paid",
    lastPaymentLabel: "Semua tagihan lunas",
    canReEnroll: false,
  },
];

/* ============================================
   Helper UI
============================================ */

function statusBadge(status: ReEnrollmentStatus) {
  switch (status) {
    case "unpaid":
      return (
        <Badge variant="destructive" className="text-[10px]">
          Belum dibayar
        </Badge>
      );
    case "partial":
      return (
        <Badge variant="secondary" className="text-[10px]">
          Terbayar sebagian
        </Badge>
      );
    case "paid":
      return (
        <Badge variant="outline" className="text-[10px]">
          Lunas
        </Badge>
      );
    case "expired":
      return (
        <Badge variant="outline" className="text-[10px] opacity-70">
          Kadaluarsa
        </Badge>
      );
    default:
      return null;
  }
}

function statusLabel(status: ReEnrollmentStatus) {
  switch (status) {
    case "unpaid":
      return "Belum ada pembayaran";
    case "partial":
      return "Sebagian tagihan sudah dibayar";
    case "paid":
      return "Semua tagihan sudah lunas";
    case "expired":
      return "Periode daftar ulang sudah berakhir";
    default:
      return "";
  }
}

/* ============================================
   Page Component
============================================ */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function StudentAdministrationReEnrollment({
  showBack = false,
  backTo
}: Props) {
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  /* ✅ Breadcrumb */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Daftar Ulang",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Administrasi" },
        { label: "Daftar Ulang" },
      ],
      showBack,
    });
  }, [setHeader, showBack]);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [items] = useState<ReEnrollmentItem[]>(DEMO_REENROLL_ITEMS);

  const totalOutstandingLabel = useMemo(() => {
    const relevant = items.filter(
      (i) => i.status === "unpaid" || i.status === "partial"
    );
    if (relevant.length === 0) return "Rp 0";
    if (relevant.length === 1) return relevant[0].outstandingLabel;
    return "Beberapa tagihan aktif";
  }, [items]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return items;
    return items.filter((i) => i.status === statusFilter);
  }, [items, statusFilter]);

  const handleReEnroll = (id: string) => {
    // TODO: sambungkan ke API, misal POST /.../re-enrollments/:id/pay
    console.log("Re-enroll / bayar untuk id:", id);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="md:flex hidden gap-3 items-center">
        {showBack && (
          <Button
            onClick={handleBack}
            variant="ghost"
            size="icon"
            className="cursor-pointer self-start"
          >
            <ArrowLeft size={20} />
          </Button>
        )}
        <div>
          <h1 className="md:text-xl font-semibold teks-lg">Daftar Ulang</h1>
          <p className="text-sm text-muted-foreground">
            Lihat kelas yang naik jenjang dan selesaikan biaya daftar ulang & SPP
            untuk tahun ajaran berikutnya.
          </p>
        </div>
      </div>
      {/* Summary */}
      <Card className="border-amber-200 bg-amber-50/80 dark:bg-amber-950/20">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <Wallet className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                Ringkasan tagihan daftar ulang
              </p>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-lg font-semibold">
                  {totalOutstandingLabel}
                </span>
                <span className="text-xs text-muted-foreground">
                  (akumulasi dari semua kelas yang perlu daftar ulang)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>
              Pastikan daftar ulang sebelum batas waktu yang ditentukan sekolah.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Filter bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCcw className="h-3 w-3" />
          <span>
            Menampilkan kelas yang masih punya opsi daftar ulang / pelunasan.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Filter status:
          </span>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v)}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua status</SelectItem>
              <SelectItem value="unpaid">Belum dibayar</SelectItem>
              <SelectItem value="partial">Terbayar sebagian</SelectItem>
              <SelectItem value="paid">Lunas</SelectItem>
              <SelectItem value="expired">Kadaluarsa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      {/* List */}
      <div className="rounded-md border bg-card/40 p-3 sm:p-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
            <CheckCircle2 className="h-6 w-6" />
            <div className="text-sm font-medium">
              Tidak ada tagihan daftar ulang aktif.
            </div>
            <p className="text-xs max-w-xs">
              Semua kewajiban daftar ulang sudah lunas atau belum ada kelas
              yang naik jenjang.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const isPaid = item.status === "paid";
            const isExpired = item.status === "expired";
            const canAction = item.canReEnroll && !isExpired && !isPaid;

            return (
              <Card
                key={item.id}
                className="
                    border-muted bg-background/80
                    hover:bg-accent/40 hover:-translate-y-1 hover:shadow-md
                    transition-all duration-200 cursor-pointer
                  "
              >
                <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base font-semibold leading-tight">
                        {item.newClassName}
                      </CardTitle>
                      {statusBadge(item.status)}
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-medium text-[11px]">Dari:</span>
                        <span>{item.oldClassName}</span>
                        <span className="text-muted-foreground/50">→</span>
                        <span className="font-medium text-[11px]">Ke:</span>
                        <span>{item.newClassName}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {item.levelLabel && (
                          <span className="text-[11px]">
                            {item.levelLabel}
                          </span>
                        )}
                        <span className="text-muted-foreground/40 text-[10px]">
                          •
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <CalendarClock className="h-3 w-3" />
                          {item.academicYearFrom} → {item.academicYearTo}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="text-[11px] text-muted-foreground">
                      Total tagihan:
                    </div>
                    <div className="text-sm font-semibold">
                      {item.totalBillLabel}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Sisa:{" "}
                      <span className="font-medium">
                        {item.outstandingLabel}
                      </span>
                    </div>
                    {item.dueDateLabel && (
                      <span className="text-[10px] text-muted-foreground mt-1">
                        Batas daftar ulang: {item.dueDateLabel}
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-3 pt-0">
                  <div className="rounded-md border bg-background/80 p-3 text-xs flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <CreditCard className="h-3 w-3" />
                        Rincian biaya
                      </span>
                    </div>
                    <Separator className="my-1" />
                    <div className="grid grid-cols-1 gap-1 text-[11px] sm:grid-cols-2">
                      <div className="flex justify-between gap-2">
                        <span>Biaya pendaftaran</span>
                        <span className="font-medium">
                          {item.registrationFeeLabel}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span>SPP</span>
                        <span className="text-right">
                          <span className="font-medium">
                            {item.sppMonthlyLabel}
                          </span>
                          <span className="ml-1 text-muted-foreground">
                            × {item.sppMonthsCount} bln
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-2 text-xs text-muted-foreground max-w-md">
                      {isPaid ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="mt-0.5 h-4 w-4" />
                      )}
                      <div className="space-y-0.5">
                        <p className="font-medium text-[11px]">
                          {statusLabel(item.status)}
                        </p>
                        {item.lastPaymentLabel && (
                          <p className="text-[11px]">
                            {item.lastPaymentLabel}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-start sm:justify-end">
                      {canAction ? (
                        <Button
                          size="sm"
                          className="text-xs inline-flex items-center gap-1"
                          onClick={() => handleReEnroll(item.id)}
                        >
                          <span>
                            {item.status === "partial"
                              ? "Lanjutkan pembayaran"
                              : "Daftar ulang sekarang"}
                          </span>
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          disabled
                        >
                          {isPaid
                            ? "Tagihan sudah lunas"
                            : "Daftar ulang tidak tersedia"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
