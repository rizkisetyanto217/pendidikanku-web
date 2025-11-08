// src/pages/sekolahislamku/pages/finance/SchoolSpp.tsx
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

/* Icons */
import {
  ArrowLeft,
  Download,
  Info,
  Users,
  Filter as FilterIcon,
} from "lucide-react";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/* DataTable — konsisten dengan Academic */
import {
  CDataTable as DataTable,
  type ColumnDef,
} from "@/components/costum/table/CDataTable";

/* ================= Types & Helpers ================= */
type SppStatus = "unpaid" | "paid" | "overdue";

interface SppBillRow {
  id: string;
  student_name: string;
  class_name: string;
  amount: number;
  due_date: string; // ISO
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

const StatusDot = ({ s }: { s: SppStatus }) => {
  const cls =
    s === "paid"
      ? "bg-emerald-600"
      : s === "overdue"
      ? "bg-red-600"
      : "bg-amber-500";
  const title =
    s === "paid" ? "Lunas" : s === "overdue" ? "Terlambat" : "Belum Bayar";
  return (
    <span
      title={title}
      className={`inline-block h-3 w-3 rounded-full ${cls}`}
      aria-label={title}
    />
  );
};

/* CSV export */
function toCsv(rows: SppBillRow[]) {
  const header = [
    "No",
    "Nama Siswa",
    "Kelas",
    "Nominal",
    "Jatuh Tempo",
    "Status",
  ];
  const mapStatus = (s: SppStatus) =>
    s === "paid" ? "Lunas" : s === "overdue" ? "Terlambat" : "Belum Bayar";
  const lines = rows.map((r, i) => [
    String(i + 1),
    r.student_name.replaceAll('"', '""'),
    r.class_name,
    String(r.amount),
    dateFmt(r.due_date),
    mapStatus(r.status),
  ]);
  return (
    header.join(",") +
    "\n" +
    lines.map((cols) => cols.map((c) => `"${c}"`).join(",")).join("\n")
  );
}
function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ================= Page ================= */
const SchoolSpp: React.FC = () => {
  const navigate = useNavigate();

  const today = new Date();
  const ymToday = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;

  /* ===== Filter state =====
     month = null  -> tampilkan SEMUA bulan (default)
     month = "YYYY-MM" -> filter ke bulan tsb
  */
  const [showFilter, setShowFilter] = useState(false);
  const [month, setMonth] = useState<string | null>(null); // ⬅️ default: semua bulan
  const [kelas, setKelas] = useState<string>("ALL");
  const [status, setStatus] = useState<SppStatus | "semua">("semua");

  /* ===== Data (dummy demo: sebar ke 6 bulan terakhir) ===== */
  const billsQ = useQuery({
    queryKey: ["spp-bills"], // tidak tergantung filter, karena filter dilakukan di client
    queryFn: async () => {
      const dummy: SppBillRow[] = Array.from({ length: 60 }).map((_, i) => {
        const offset = i % 6; // 0..5 bulan ke belakang
        const d = new Date(today.getFullYear(), today.getMonth() - offset, 20);
        return {
          id: `spp-${i + 1}`,
          student_name: `Siswa ${i + 1}`,
          class_name: ["Kelas 1A", "Kelas 1B", "Kelas 2A", "Kelas 3A"][i % 4],
          amount: 150_000 + (i % 3) * 50_000,
          due_date: d.toISOString(),
          status: (["unpaid", "paid", "overdue"] as SppStatus[])[i % 3],
        };
      });
      return {
        list: dummy,
        classes: ["Kelas 1A", "Kelas 1B", "Kelas 2A", "Kelas 3A"],
      };
    },
    staleTime: 60_000,
  });

  const allRows = billsQ.data?.list ?? [];
  const classes = billsQ.data?.classes ?? [];

  /* ===== Apply filter (bulan opsional) + sort terbaru dulu ===== */
  const filteredSorted = useMemo(() => {
    const rows = allRows.filter((b) => {
      if (kelas !== "ALL" && b.class_name !== kelas) return false;
      if (status !== "semua" && b.status !== status) return false;
      if (month) {
        // cocokkan "YYYY-MM"
        const m = b.due_date.slice(0, 7);
        if (m !== month) return false;
      }
      return true;
    });
    return rows.sort(
      (a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
    );
  }, [allRows, kelas, status, month]);

  /* ===== Stats bar (kiri) + tombol filter (kanan) ===== */
  const StatsInline = billsQ.isLoading ? (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Info className="h-4 w-4" /> Memuat tagihan SPP…
    </div>
  ) : (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <span className="whitespace-nowrap">{filteredSorted.length} tagihan</span>
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <StatusDot s="paid" />{" "}
        {filteredSorted.filter((r) => r.status === "paid").length}
      </span>
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <StatusDot s="unpaid" />{" "}
        {filteredSorted.filter((r) => r.status === "unpaid").length}
      </span>
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <StatusDot s="overdue" />{" "}
        {filteredSorted.filter((r) => r.status === "overdue").length}
      </span>
      <span className="ml-1 font-medium whitespace-nowrap">
        {idr(filteredSorted.reduce((a, r) => a + r.amount, 0))}
      </span>
    </div>
  );

  /* Chips ringkasan — tampilkan “Semua” saat month null */
  const FilterChips = (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="rounded-full border bg-muted/40 px-2.5 py-1 text-muted-foreground">
        Bulan:{" "}
        {month
          ? new Date(`${month}-01`).toLocaleDateString("id-ID", {
              month: "long",
              year: "numeric",
            })
          : "Semua"}
      </span>
      <span className="rounded-full border bg-muted/40 px-2.5 py-1 text-muted-foreground">
        Kelas: {kelas === "ALL" ? "Semua" : kelas}
      </span>
      <span className="rounded-full border bg-muted/40 px-2.5 py-1 text-muted-foreground">
        Status:{" "}
        {status === "semua"
          ? "Semua"
          : status === "paid"
          ? "Lunas"
          : status === "unpaid"
          ? "Belum Bayar"
          : "Terlambat"}
      </span>
    </div>
  );

  /* Columns */
  const columns = useMemo<ColumnDef<SppBillRow>[]>(
    () => [
      {
        id: "no",
        header: "No",
        minW: "60px",
        align: "center",
        headerClassName: "w-[60px]",
        cell: (_r, m) => <span>{(m?.absoluteIndex ?? 0) + 1}</span>,
      },
      {
        id: "student",
        header: "Nama Siswa",
        minW: "240px",
        align: "left",
        cell: (r) => (
          <div className="text-left">
            <div className="font-medium">{r.student_name}</div>
            <div className="text-xs text-muted-foreground">{r.class_name}</div>
          </div>
        ),
      },
      {
        id: "amount",
        header: "Nominal",
        minW: "140px",
        align: "right",
        cell: (r) => <span className="tabular-nums">{idr(r.amount)}</span>,
      },
      {
        id: "due",
        header: "Jatuh Tempo",
        minW: "140px",
        align: "left",
        cell: (r) => dateFmt(r.due_date),
      },
      {
        id: "status",
        header: "Status",
        minW: "80px",
        align: "center",
        headerClassName: "w-[80px]",
        cell: (r) => <StatusDot s={r.status} />,
      },
    ],
    []
  );

  const onExport = () => {
    const csv = toCsv(filteredSorted);
    downloadCsv(`spp-${month ?? "semua"}.csv`, csv);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 lg:gap-6">
          {/* ===== Navbar row: back + title ===== */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              aria-label="Kembali"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">SPP</h1>
          </div>

          {/* ===== Chips ringkasan ===== */}
          <div>{FilterChips}</div>

          {/* ===== Bar stats (kiri) + tombol Filter (kanan) ===== */}
          <div className="flex items-center justify-between">
            {StatsInline}
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full px-3 gap-2"
              onClick={() => setShowFilter((s) => !s)}
            >
              <FilterIcon className="h-4 w-4" />
              {showFilter ? "Sembunyikan Filter" : "Filter SPP"}
            </Button>
          </div>

          {/* ===== Panel Filter (toggle) ===== */}
          {showFilter && (
            <Card className="border-dashed">
              <CardHeader className="py-3 border-b">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Users size={18} className="text-primary" /> Filter SPP
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Bulan (opsional) */}
                  <div className="grid gap-1.5">
                    <Label className="text-sm">Bulan</Label>
                    <div className="flex gap-2">
                      <Input
                        type="month"
                        value={month ?? ""} // kosong = semua bulan
                        onChange={(e) => setMonth(e.target.value || null)}
                        placeholder="Semua bulan"
                        className="h-10 rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setMonth(ymToday)}
                      >
                        Bulan ini
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setMonth(null)}
                      >
                        Bersihkan
                      </Button>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Biarkan kosong untuk menampilkan semua bulan (default).
                    </div>
                  </div>

                  {/* Kelas */}
                  <div className="grid gap-1.5">
                    <Label className="text-sm">Kelas</Label>
                    <Select value={kelas} onValueChange={(v) => setKelas(v)}>
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Semua</SelectItem>
                        {classes.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="grid gap-1.5">
                    <Label className="text-sm">Status</Label>
                    <Select
                      value={status}
                      onValueChange={(v) => setStatus(v as SppStatus | "semua")}
                    >
                      <SelectTrigger className="h-10 rounded-lg">
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
                </div>

                {/* Actions di filter */}
                <div className="flex items-center justify-end">
                  <Button className="gap-1.5" onClick={onExport}>
                    <Download size={14} /> Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ===== DataTable ===== */}
          <DataTable<SppBillRow>
            title={undefined}
            onBack={undefined}
            controlsPlacement="above"
            defaultQuery=""
            searchPlaceholder="Cari nama siswa atau kelas…"
            searchByKeys={["student_name", "class_name"]}
            loading={billsQ.isLoading}
            error={
              billsQ.isError ? (billsQ.error as any)?.message ?? "Error" : null
            }
            columns={columns}
            rows={filteredSorted} // ⬅️ sudah disort terbaru
            getRowId={(r) => r.id}
            defaultAlign="left"
            stickyHeader
            zebra
            pageSize={20}
            pageSizeOptions={[10, 20, 50, 100, 200]}
            viewModes={["table", "card"]}
            defaultView="table"
            renderCard={(r) => (
              <div className="rounded-xl border p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{r.student_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {r.class_name}
                    </div>
                  </div>
                  <StatusDot s={r.status} />
                </div>
                <div className="text-sm">
                  Jatuh Tempo: {dateFmt(r.due_date)}
                </div>
                <div className="font-semibold text-right">{idr(r.amount)}</div>
              </div>
            )}
          />
        </div>
      </main>
    </div>
  );
};

export default SchoolSpp;
