// src/pages/sekolahislamku/student/StudentFinance.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Wallet, CheckCircle2, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/* Tambahan untuk breadcrumb sistem dashboard */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import { cardHover } from "@/components/costum/table/CDataTable";

/* =========================
   Types & Helpers
========================= */
type BillStatus = "unpaid" | "paid" | "overdue";
type BillItem = { id: string; name: string; qty?: number; amount: number };

interface BillDetail {
  id: string;
  title: string;
  invoiceNo: string;
  createdAt: string;
  dueDate: string;
  status: BillStatus;
  student: { name: string; className: string };
  items: BillItem[];
  discount?: number;
  adminFee?: number;
  total: number;
  payment?: { date: string; method: string; ref: string };
}

const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "—";

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

/* =========================
   Dummy Fetch Data
========================= */
async function fetchBillDetail(billId: string): Promise<BillDetail> {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();

  return {
    id: billId || "default",
    title: "SPP Agustus 2025",
    invoiceNo: "INV-2025-08-001",
    createdAt: iso(new Date(now.getFullYear(), 7, 1)),
    dueDate: iso(new Date(now.getFullYear(), 7, 17)),
    status: "unpaid",
    student: { name: "Ahmad", className: "TPA A" },
    items: [
      { id: "i1", name: "SPP Bulanan", amount: 150_000 },
      { id: "i2", name: "Buku Panduan Iqra", qty: 1, amount: 20_000 },
    ],
    discount: 10_000,
    adminFee: 2_500,
    total: 162_500,
  };
}

/* =========================================================
   Page — sama layout & interaksi dengan Academic
========================================================= */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function StudentFinance({
  showBack = false,
  backTo
}: Props) {
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  /* ✅ Breadcrumb */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Keuangan",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Administrasi" },
        { label: "Keuangan" },
      ],
      showBack,
    });
  }, [setHeader, showBack]);

  const { billId: billIdParam } = useParams();
  const billId = billIdParam || "default";

  const [activeTab, setActiveTab] = useState<"today" | "history">("today");

  const { data, isLoading, error } = useQuery({
    queryKey: ["bill-detail", billId],
    queryFn: () => fetchBillDetail(billId),
    staleTime: 60_000,
  });

  const paidList: BillDetail[] = [
    {
      id: "paid-1",
      title: "SPP Juli 2025",
      invoiceNo: "INV-2025-07-014",
      createdAt: new Date(2025, 6, 1).toISOString(),
      dueDate: new Date(2025, 6, 10).toISOString(),
      status: "paid",
      student: { name: "Ahmad", className: "TPA A" },
      items: [
        { id: "i1", name: "SPP Bulanan", amount: 150_000 },
        { id: "i2", name: "Infaq Kegiatan", amount: 10_000 },
      ],
      total: 160_000,
      payment: {
        date: new Date(2025, 6, 5).toISOString(),
        method: "VA BSI",
        ref: "MID-VA-7F3K2Q",
      },
    },
  ];

  return (
    <div className="w-full bg-background text-foreground">
      <main className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="hidden md:flex gap-3 items-center">
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
            <h1 className="text-lg font-semibold md:text-xl">Keuangan</h1>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "today" | "history")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today" className="gap-2">
              <Clock className="h-4 w-4" />
              Tagihan Hari Ini
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Riwayat Pembayaran
            </TabsTrigger>
          </TabsList>

          {/* Tab: Today */}
          <TabsContent value="today" className="space-y-4">
            {error ? (
              <Card>
                <CardContent className="p-4 text-sm text-destructive">
                  Gagal memuat data tagihan.
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardContent className="p-4 md:p-5">
                    <div className="flex items-center gap-3 mb-1">
                      <Wallet className="h-4 w-4 text-primary" />
                      <div className="font-medium">Tagihan Aktif</div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Berikut tagihan Anda yang masih belum dibayar.
                    </p>
                  </CardContent>
                </Card>

                {!isLoading && data && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Rincian Item */}
                    <Card className="lg:col-span-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          Rincian Tagihan
                        </CardTitle>
                      </CardHeader>
                      <Separator />
                      <CardContent className="p-0">
                        <div className="rounded-lg border m-4 overflow-hidden">
                          {(data.items ?? []).map((it) => (
                            <div
                              key={it.id}
                              className="grid grid-cols-12 px-3 py-2 border-b last:border-b-0 text-sm"
                            >
                              <div className="col-span-7">{it.name}</div>
                              <div className="col-span-2 text-right">
                                {it.qty ?? 1}x
                              </div>
                              <div className="col-span-3 text-right font-medium">
                                {formatIDR(it.amount)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Ringkasan */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Ringkasan</CardTitle>
                      </CardHeader>
                      <Separator />
                      <CardContent className="p-4 md:p-5">
                        <div className="text-sm text-muted-foreground">
                          Total:
                        </div>
                        <div className="text-2xl font-semibold text-primary">
                          {formatIDR(data.total ?? 0)}
                        </div>
                        <Button className="mt-4 w-full">Bayar Sekarang</Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Tab: History */}
          <TabsContent value="history">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Riwayat Pembayaran</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="p-4 md:p-5">
                <div className="space-y-3">
                  {paidList.map((b) => (
                    <div
                      key={b.id}
                      className={`rounded-lg border bg-card p-3 md:p-4 flex items-start justify-between gap-3 ${cardHover}`}
                    >

                      <div>
                        <div className="font-medium">{b.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Dibayar pada {dateLong(b.payment?.date)} via{" "}
                          {b.payment?.method}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="mb-1">Lunas</Badge>
                        <div className="font-semibold">
                          {formatIDR(b.total)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {paidList.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-8">
                      Belum ada riwayat pembayaran.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}