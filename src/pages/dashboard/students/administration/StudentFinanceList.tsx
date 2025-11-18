// src/pages/sekolahislamku/parent/StudentListFinance.tsx
import { useEffect, useMemo } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* ---------------- Types ---------------- */
type BillItem = {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // ISO
  status: "unpaid" | "paid" | "overdue";
};

type LocationState = {
  bills?: BillItem[];
  parentName?: string;
  gregorianDate?: string;
  hijriDate?: string;
};

/* ---------------- Fake fetch (fallback sama seperti dashboard) ---------------- */
async function fetchParentHome() {
  return Promise.resolve({
    parentName: "Bapak/Ibu",
    hijriDate: "16 Muharram 1447 H",
    gregorianDate: new Date().toISOString(),
    bills: [
      {
        id: "b1",
        title: "SPP Agustus 2025",
        amount: 150_000,
        dueDate: new Date(
          new Date().setDate(new Date().getDate() + 5)
        ).toISOString(),
        status: "unpaid",
      },
      {
        id: "b2",
        title: "Seragam Olahraga",
        amount: 80_000,
        dueDate: new Date(
          new Date().setDate(new Date().getDate() - 3)
        ).toISOString(),
        status: "overdue",
      },
      {
        id: "b3",
        title: "Buku Paket",
        amount: 120_000,
        dueDate: new Date().toISOString(),
        status: "paid",
      },
    ] as BillItem[],
  });
}

/* ---------------- Helpers ---------------- */
const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : "-";

/* =========================================================
   Page — sama layout & interaksi dengan Academic
========================================================= */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function StudentListFinance({
  showBack = false,
  backTo
}: Props) {
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  /* ✅ Breadcrumb */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Keuangan List",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Administrasi" },
        { label: "Keuangan List" },
      ],
      showBack,
    });
  }, [setHeader, showBack]);
  const { state } = useLocation() as { state?: LocationState };

  const { data } = useQuery({
    queryKey: ["parent-home-single"],
    queryFn: fetchParentHome,
    staleTime: 60_000,
  });

  // Prioritaskan bills dari state (klik "Lihat semua"), kalau tidak ada ambil dari fetch.
  const bills: BillItem[] = state?.bills ?? data?.bills ?? [];

  // Urutkan: overdue -> unpaid -> paid; lalu dueDate terdekat
  const sorted = useMemo(() => {
    const priority = { overdue: 0, unpaid: 1, paid: 2 } as const;
    return [...bills].sort((a, b) => {
      const p = priority[a.status] - priority[b.status];
      if (p !== 0) return p;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [bills]);

  const statusBadge = (s: BillItem["status"]) => {
    if (s === "paid")
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
          Lunas
        </Badge>
      );
    if (s === "overdue") return <Badge variant="destructive">Terlambat</Badge>;
    return (
      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300">
        Belum Dibayar
      </Badge>
    );
  };

  return (
    <div className="w-full bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          <h1 className="text-base md:text-xl text-lg font-semibold tracking-tight">
            Daftar Tagihan
          </h1>
        </div>
      </header>

      <main className="w-full py-4 md:py-8">
        <div className="mx-auto">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                Semua Tagihan
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <div className="space-y-3">
                {sorted.map((b) => {
                  const isPaid = b.status === "paid";
                  return (
                    <div
                      key={b.id}
                      className="rounded-lg border bg-card p-3 md:p-4 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold">{b.title}</div>
                        <div className="text-xs mt-1 flex items-center gap-2 flex-wrap text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Jatuh tempo: {dateLong(b.dueDate)}
                          </span>
                          {statusBadge(b.status)}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-bold">{formatIDR(b.amount)}</div>
                        <div className="mt-2">
                          {isPaid ? (
                            <Button variant="outline" size="sm" disabled>
                              Lunas
                            </Button>
                          ) : (
                            <Link to={`${b.id}`}>
                              <Button size="sm">Bayar</Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {sorted.length === 0 && (
                  <div className="text-center py-10 rounded-lg border-2 border-dashed text-muted-foreground">
                    Tidak ada tagihan.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
