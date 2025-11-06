// src/pages/sekolahislamku/pages/finance/SchoolSpp.tsx
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

// Icons
import {
  Filter as FilterIcon,
  Download,
  ArrowLeft,
  Users,
  Info,
} from "lucide-react";

/* ==== shadcn/ui ==== */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ===================== Types & Helpers ===================== */
type SppStatus = "unpaid" | "paid" | "overdue";

interface SppBillRow {
  id: string;
  student_name: string;
  class_name: string;
  amount: number;
  due_date: string;
  status: SppStatus;
}

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const dateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/* ===================== Page ===================== */
const SchoolSpp: React.FC = () => {
  const navigate = useNavigate();

  const today = new Date();
  const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}`;

  const [month, setMonth] = useState(ym);
  const [kelas, setKelas] = useState<string>("ALL"); // ← default sentinel
  const [status, setStatus] = useState<SppStatus | "semua">("semua");
  const [q, setQ] = useState("");

  // Dummy Query
  const billsQ = useQuery({
    queryKey: ["spp-bills", { month, kelas, status, q }],
    queryFn: async () => {
      const dummy: SppBillRow[] = Array.from({ length: 45 }).map((_, i) => ({
        id: `spp-${i + 1}`,
        student_name: `Siswa ${i + 1}`,
        class_name: ["1A", "1B", "2A", "3A"][i % 4],
        amount: 150000 + (i % 3) * 50000,
        due_date: new Date(
          today.getFullYear(),
          today.getMonth(),
          20
        ).toISOString(),
        status: (["unpaid", "paid", "overdue"] as SppStatus[])[i % 3],
      }));
      return { list: dummy, classes: ["1A", "1B", "2A", "3A"] };
    },
  });

  const bills = billsQ.data?.list ?? [];
  const classes = billsQ.data?.classes ?? [];

  // Filter
  const filtered = useMemo(() => {
    return bills.filter((b) => {
      if (kelas !== "ALL" && b.class_name !== kelas) return false; // ← fix
      if (status !== "semua" && b.status !== status) return false;
      if (q && !b.student_name.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [bills, kelas, status, q]);

  // Pagination (sederhana)
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, lastPage);
  const start = (currentPage - 1) * limit;
  const end = start + limit;
  const pageRows = filtered.slice(start, end);

  // Columns badge
  const StatusBadge = ({ s }: { s: SppStatus }) => {
    if (s === "paid")
      return <Badge className="bg-green-600 text-white">Lunas</Badge>;
    if (s === "overdue") return <Badge variant="destructive">Terlambat</Badge>;
    return <Badge variant="outline">Belum Bayar</Badge>;
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* ===== Header ===== */}
      <div className="p-4 md:p-5 pb-3 border-b">
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden md:flex items-center gap-2 font-semibold">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              aria-label="Kembali"
              className="cursor-pointer"
            >
              <ArrowLeft size={18} />
            </Button>
            <h1>SPP Murid</h1>
          </div>

          <div className="w-full sm:w-auto flex-1 min-w-0 order-3 sm:order-2">
            <div className="flex items-center gap-2">
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari nama siswa…"
                className="w-full"
              />
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Per halaman
                </span>
                <Select
                  value={String(limit)}
                  onValueChange={(v) => {
                    setLimit(Number(v));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[96px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50, 100].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="ml-auto order-2 sm:order-3">
            <Button size="sm" className="gap-1">
              <Download size={14} /> Export
            </Button>
          </div>
        </div>
      </div>

      <main className="w-full">
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-6 p-4 md:p-5">
          {/* ===== Filter Section ===== */}
          <Card>
            <CardHeader className="py-4 border-b">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FilterIcon size={18} className="text-primary" /> Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 md:p-5">
              {/* Bulan */}
              <div className="grid gap-2">
                <Label className="text-sm">Bulan</Label>
                <Input
                  type="month"
                  value={month}
                  onChange={(e) => {
                    setMonth(e.target.value);
                    setPage(1);
                  }}
                  className="h-11 rounded-lg"
                />
              </div>

              {/* Kelas */}
              <div className="grid gap-2">
                <Label className="text-sm">Kelas</Label>
                <Select
                  value={kelas}
                  onValueChange={(v) => {
                    setKelas(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-11 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua</SelectItem>{" "}
                    {/* ← non-empty */}
                    {classes.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="grid gap-2">
                <Label className="text-sm">Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => {
                    setStatus(v as SppStatus | "semua");
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-11 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua</SelectItem>
                    <SelectItem value="paid">Lunas</SelectItem>
                    <SelectItem value="unpaid">Belum Bayar</SelectItem>
                    <SelectItem value="overdue">Terlambat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* ===== Data Section ===== */}
          <Card>
            <CardHeader className="py-4 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users size={18} className="text-primary" /> Daftar SPP
              </CardTitle>
              <div className="text-sm text-muted-foreground">{total} total</div>
            </CardHeader>

            <CardContent className="p-4 md:p-5">
              {billsQ.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info size={16} /> Memuat data SPP...
                </div>
              ) : total === 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info size={16} /> Tidak ada data tagihan.
                </div>
              ) : (
                <>
                  {/* Mobile: Cards */}
                  <div className="md:hidden grid gap-3">
                    {pageRows.map((r) => (
                      <div key={r.id} className="rounded-2xl border p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-base">
                              {r.student_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Kelas {r.class_name}
                            </div>
                          </div>
                          <StatusBadge s={r.status} />
                        </div>
                        <div className="text-sm">
                          Jatuh Tempo: {dateFmt(r.due_date)}
                        </div>
                        <div className="font-semibold text-right">
                          {idr(r.amount)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop: Table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Siswa</TableHead>
                          <TableHead>Kelas</TableHead>
                          <TableHead>Nominal</TableHead>
                          <TableHead>Jatuh Tempo</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pageRows.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="font-medium">
                              {r.student_name}
                            </TableCell>
                            <TableCell>{r.class_name}</TableCell>
                            <TableCell>{idr(r.amount)}</TableCell>
                            <TableCell>{dateFmt(r.due_date)}</TableCell>
                            <TableCell>
                              <StatusBadge s={r.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <CardFooterPagination
                    total={total}
                    start={start + 1}
                    end={Math.min(end, total)}
                    page={currentPage}
                    lastPage={lastPage}
                    onPrev={() => setPage((p) => Math.max(1, p - 1))}
                    onNext={() => setPage((p) => Math.min(lastPage, p + 1))}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SchoolSpp;

/* ===== helpers: shared footer pagination ===== */
function CardFooterPagination({
  total,
  start,
  end,
  page,
  lastPage,
  onPrev,
  onNext,
}: {
  total: number;
  start: number;
  end: number;
  page: number;
  lastPage: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="px-4 py-3 border-t flex flex-col sm:flex-row items-center gap-3 mt-4">
      <div className="text-sm text-muted-foreground">
        Menampilkan <span className="font-medium">{start}</span>–
        <span className="font-medium">{end}</span> dari{" "}
        <span className="font-medium">{total}</span>
      </div>
      <div className="sm:ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={page <= 1}
        >
          Sebelumnya
        </Button>
        <div className="text-sm tabular-nums">
          Halaman <span className="font-medium">{page}</span> / {lastPage}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page >= lastPage}
        >
          Berikutnya
        </Button>
      </div>
    </div>
  );
}
