// src/pages/dashboard/schools/finance/SchoolFinance.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { Download, Info, ArrowLeft } from "lucide-react";

/* ==== shadcn/ui ==== */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* Import untuk breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import CMenuSearch from "@/components/costum/common/CMenuSearch";
import {
  CSegmentedTabs,
  type SegmentedTabItem,
} from "@/components/costum/common/CSegmentedTabs";
import { cardHover } from "@/components/costum/table/CDataTable";
import CBadgeBillStatus, {
  type BillStatus,
} from "@/components/costum/common/badges/CBadgeBillStatus";

/* ===================== Types & Dummy Data ===================== */
type InvoiceStatus = BillStatus;
type Invoice = {
  id: string;
  title: string;
  student_name: string;
  class_name: string;
  due_date: string;
  amount: number;
  status: InvoiceStatus;
};

type Payment = {
  id: string;
  date: string;
  payer_name: string;
  invoice_title: string;
  amount: number;
  method: string;
};

const dummyInvoices: Invoice[] = [
  {
    id: "inv001",
    title: "SPP September 2025",
    student_name: "Ahmad Fauzi",
    class_name: "1A",
    due_date: "2025-09-15",
    amount: 500000,
    status: "paid",
  },
  {
    id: "inv002",
    title: "SPP Oktober 2025",
    student_name: "Siti Aminah",
    class_name: "2A",
    due_date: "2025-10-15",
    amount: 500000,
    status: "unpaid",
  },
  {
    id: "inv003",
    title: "SPP Agustus 2025",
    student_name: "Budi Santoso",
    class_name: "3C",
    due_date: "2025-08-10",
    amount: 500000,
    status: "overdue",
  },
];

const dummyPayments: Payment[] = [
  {
    id: "pay001",
    date: "2025-09-14",
    payer_name: "Ahmad Fauzi",
    invoice_title: "SPP September 2025",
    amount: 500000,
    method: "Transfer Bank",
  },
  {
    id: "pay002",
    date: "2025-09-20",
    payer_name: "Siti Aminah",
    invoice_title: "SPP Agustus 2025",
    amount: 500000,
    method: "E-Wallet",
  },
];

/* ===================== Helpers ===================== */
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

/* ===================== Main Page ===================== */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

const SchoolFinance: React.FC<Props> = ({ showBack = false, backTo }) => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  /* Tambah breadcrumb seperti SchoolAcademic */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Keuangan Sekolah",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Keuangan" },
        { label: "Lainnya (Non-SPP)" },
      ],
    });
  }, [setHeader]);

  const [tab, setTab] = useState<"invoices" | "payments">("invoices");

  const invoicesQ = useQuery({
    queryKey: ["school-finance-invoices"],
    queryFn: async () => dummyInvoices,
    initialData: dummyInvoices,
  });

  const paymentsQ = useQuery({
    queryKey: ["school-finance-payments"],
    queryFn: async () => dummyPayments,
    initialData: dummyPayments,
  });

  const invoices = invoicesQ.data ?? [];
  const payments = paymentsQ.data ?? [];

  const FINANCE_TABS: SegmentedTabItem[] = [
    {
      value: "invoices",
      label: "Tagihan",
    },
    {
      value: "payments",
      label: "Pembayaran",
    },
  ];

  /* ==== Search ==== */
  const [q, setQ] = useState("");
  const filteredInvoices = useMemo(() => {
    if (!q) return invoices;
    return invoices.filter(
      (x) =>
        x.title.toLowerCase().includes(q.toLowerCase()) ||
        x.student_name.toLowerCase().includes(q.toLowerCase())
    );
  }, [q, invoices]);

  const filteredPayments = useMemo(() => {
    if (!q) return payments;
    return payments.filter(
      (x) =>
        x.payer_name.toLowerCase().includes(q.toLowerCase()) ||
        x.invoice_title.toLowerCase().includes(q.toLowerCase())
    );
  }, [q, payments]);

  /* ==== Pagination ==== */
  const [limit] = useState(10);
  const [page, setPage] = useState(1);

  const list = tab === "invoices" ? filteredInvoices : filteredPayments;
  const total = list.length;
  const lastPage = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, lastPage);

  const start = (currentPage - 1) * limit;
  const end = start + limit;

  const pageInvoices = filteredInvoices.slice(start, end);
  const pagePayments = filteredPayments.slice(start, end);

  /* ==== Summary ==== */
  const summary = {
    totalBilled: idr(1500000),
    collected: idr(1000000),
    outstanding: idr(500000),
  };

  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      {/* ===== Header ===== */}
      <div className="w-full">
        <div className="mx-auto flex flex-col gap-4 lg:gap-6">
          {/* ===== Navbar row: back + title ===== */}
          <div className="md:flex hidden gap-3 items-center mb-4">
            {showBack && (
              <Button
                onClick={handleBack}
                variant="ghost"
                size="icon"
                className="cursor-pointer self-start">
                <ArrowLeft size={20} />
              </Button>
            )}
            <h1 className="font-semibold text-lg md:text-xl">
              Keuangan Sekolah
            </h1>
          </div>
        </div>

        <CMenuSearch
          value={q}
          onChange={(val: string) => {
            setQ(val);
            setPage(1);
          }}
          placeholder={
            tab === "invoices" ? "Cari tagihan atau siswa…" : "Cari pembayaran…"
          }
        />

        <div className="mt-4 mb-4 flex justify-end">
          <Button size="sm" className="gap-1">
            <Download size={14} /> Export
          </Button>
        </div>
      </div>

      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6">
          {/* ===== Ringkasan Keuangan ===== */}
          <Card>
            <CardContent className="p-5 grid sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground">
                  Total Tertagih
                </div>
                <div className="text-xl font-semibold">
                  {summary.totalBilled}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Terkumpul</div>
                <div className="text-xl font-semibold text-green-600">
                  {summary.collected}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Tunggakan</div>
                <div className="text-xl font-semibold text-red-600">
                  {summary.outstanding}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ===== Segmented Tabs (Custom) ===== */}
          <CSegmentedTabs
            value={tab}
            onValueChange={(v) => {
              setTab(v as "invoices" | "payments");
              setPage(1);
            }}
            tabs={FINANCE_TABS}
          />
          {/* ===== Content ===== */}
          <div>
            {/* ================= TAGIHAN ================= */}
            {tab === "invoices" && (
              <Card>
                {pageInvoices.length === 0 ? (
                  <CardContent className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Info size={16} /> Tidak ada data tagihan.
                  </CardContent>
                ) : (
                  <>
                    {/* ===== Mobile ===== */}
                    <div className="md:hidden p-4 grid gap-3">
                      {pageInvoices.map((inv) => (
                        <div
                          key={inv.id}
                          className={`rounded-xl border p-4 ${cardHover}`}
                          onClick={() =>
                            navigate(
                              `/${schoolId}/sekolah/keuangan/non-spp/${inv.id}`,
                              { state: { invoice: inv } }
                            )
                          }>
                          <div className="flex justify-between items-start">
                            <div className="font-semibold">{inv.title}</div>
                            <CBadgeBillStatus status={inv.status} />
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {inv.student_name} · Kelas {inv.class_name}
                          </div>
                          <div className="text-sm">
                            Jatuh Tempo: {dateFmt(inv.due_date)}
                          </div>
                          <div className="font-semibold text-right">
                            {idr(inv.amount)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ===== Desktop ===== */}
                    <div className="hidden md:block">
                      <Table className="w-full text-center [&_th]:text-center [&_td]:text-center">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tagihan</TableHead>
                            <TableHead>Siswa</TableHead>
                            <TableHead>Kelas</TableHead>
                            <TableHead>Jatuh Tempo</TableHead>
                            <TableHead className="text-right">
                              Nominal
                            </TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pageInvoices.map((x) => (
                            <TableRow
                              key={x.id}
                              className="cursor-pointer hover:bg-muted/50 transition"
                              onClick={() =>
                                navigate(
                                  `/${schoolId}/sekolah/keuangan/non-spp/${x.id}`,
                                  { state: { invoice: x } }
                                )
                              }>
                              <TableCell className="font-medium">
                                {x.title}
                              </TableCell>
                              <TableCell>{x.student_name}</TableCell>
                              <TableCell>{x.class_name}</TableCell>
                              <TableCell>{dateFmt(x.due_date)}</TableCell>
                              <TableCell className="text-right">
                                {idr(x.amount)}
                              </TableCell>
                              <TableCell>
                                <CBadgeBillStatus status={x.status} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

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
              </Card>
            )}

            {/* ================= PEMBAYARAN ================= */}
            {tab === "payments" && (
              <Card>
                {pagePayments.length === 0 ? (
                  <CardContent className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Info size={16} /> Tidak ada data pembayaran.
                  </CardContent>
                ) : (
                  <>
                    {/* ===== Mobile ===== */}
                    <div className="md:hidden p-4 grid gap-3">
                      {pagePayments.map((p) => (
                        <div
                          key={p.id}
                          className={`relative rounded-xl border p-4 ${cardHover}`}>
                          {/* Badge metode pembayaran – kanan atas */}
                          <span
                            className="
      absolute top-3 right-3
      inline-flex items-center rounded-full
      px-2 py-0.5 text-[12px] font-medium
      bg-emerald-600/10 text-emerald-600
      ring-1 ring-emerald-600/30
    ">
                            {p.method}
                          </span>

                          <div className="font-semibold text-base">
                            {idr(p.amount)}
                          </div>

                          <div className="text-sm text-muted-foreground">
                            {p.payer_name} · {dateFmt(p.date)}
                          </div>

                          <div className="text-sm">{p.invoice_title}</div>
                        </div>
                      ))}
                    </div>

                    {/* ===== Desktop ===== */}
                    <div className="hidden md:block">
                      <Table className="w-full text-center [&_th]:text-center [&_td]:text-center">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Pembayar</TableHead>
                            <TableHead>Untuk Tagihan</TableHead>
                            <TableHead>Metode</TableHead>
                            <TableHead className="text-right">Jumlah</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pagePayments.map((x) => (
                            <TableRow key={x.id}>
                              <TableCell>{dateFmt(x.date)}</TableCell>
                              <TableCell>{x.payer_name}</TableCell>
                              <TableCell>{x.invoice_title}</TableCell>
                              <TableCell>{x.method}</TableCell>
                              <TableCell className="text-right">
                                {idr(x.amount)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

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
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SchoolFinance;

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
    <div className="px-4 py-3 border-t flex flex-col sm:flex-row items-center gap-3">
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
          disabled={page <= 1}>
          Sebelumnya
        </Button>
        <div className="text-sm tabular-nums">
          Halaman <span className="font-medium">{page}</span> / {lastPage}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page >= lastPage}>
          Berikutnya
        </Button>
      </div>
    </div>
  );
}
