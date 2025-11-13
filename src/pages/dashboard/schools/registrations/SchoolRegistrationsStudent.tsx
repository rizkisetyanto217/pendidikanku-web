import * as React from "react";
import { useMemo, useState, useEffect } from "react";

/* ✅ Breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/* DataTable custom */
import {
  DataTable as CDataTable,
  type ColumnDef,
} from "@/components/costum/table/CDataTable";

/* ===== Utils ===== */
const fmtIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
const dateShort = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "-";

/* ===== Dummy shared ===== */
type AcademicTerm = {
  academic_term_id: string;
  academic_term_academic_year: string;
  academic_term_name: string;
  academic_term_start_date: string;
  academic_term_end_date: string;
  academic_term_is_active: boolean;
};
const TERMS: AcademicTerm[] = [
  {
    academic_term_id: "t1",
    academic_term_academic_year: "2025/2026",
    academic_term_name: "Ganjil",
    academic_term_start_date: "2025-07-15T00:00:00+07:00",
    academic_term_end_date: "2025-12-20T00:00:00+07:00",
    academic_term_is_active: true,
  },
  {
    academic_term_id: "t2",
    academic_term_academic_year: "2025/2026",
    academic_term_name: "Genap",
    academic_term_start_date: "2026-01-10T00:00:00+07:00",
    academic_term_end_date: "2026-06-20T00:00:00+07:00",
    academic_term_is_active: false,
  },
];

type ClassRow = {
  class_id: string;
  class_name: string;
};
const CLASSES: ClassRow[] = [
  { class_id: "c1", class_name: "Kelas 1A" },
  { class_id: "c2", class_name: "Kelas 1B" },
  { class_id: "c3", class_name: "Kelas 2A" },
];

/* ===== Dummy pendaftar ===== */
type RegistrationStatus = "menunggu" | "diterima" | "ditolak";
type PaymentStatus = "belum_bayar" | "sebagian" | "lunas";

type StudentReg = {
  reg_id: string;
  reg_no: string;
  name: string;
  class_id?: string | null;
  submitted_at?: string | null;
  status: RegistrationStatus;
  amount_due_idr?: number | null;
  payment_status: PaymentStatus;
};

const STUDENTS: StudentReg[] = [
  {
    reg_id: "r1",
    reg_no: "PMB-0001",
    name: "Aisyah Putri",
    class_id: "c1",
    submitted_at: "2025-02-01T10:00:00+07:00",
    status: "menunggu",
    amount_due_idr: 150_000,
    payment_status: "belum_bayar",
  },
  {
    reg_id: "r2",
    reg_no: "PMB-0002",
    name: "Budi Santoso",
    class_id: "c2",
    submitted_at: "2025-02-05T14:30:00+07:00",
    status: "diterima",
    amount_due_idr: 150_000,
    payment_status: "lunas",
  },
  {
    reg_id: "r3",
    reg_no: "PMB-0003",
    name: "Citra Ayu",
    class_id: null,
    submitted_at: "2025-02-07T09:10:00+07:00",
    status: "menunggu",
    amount_due_idr: 175_000,
    payment_status: "sebagian",
  },
];

/* ===== Page Header ===== */
function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div>
        <h1 className="text-xl font-semibold leading-tight md:text-2xl">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

/* ===== Dialog Tambah Manual Pendaftar (dummy) ===== */
function AddStudentDialog() {
  const [name, setName] = useState("Nama Calon Murid");
  const [cls, setCls] = useState<string | "none">("none");
  const [amount, setAmount] = useState<number>(150_000);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Tambah Pendaftar Manual</DialogTitle>
        <DialogDescription>
          Simulasi menambah entri pendaftaran murid.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-2 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label>Nama</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Kelas (opsional)</Label>
          <Select value={cls} onValueChange={(v) => setCls(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">(Belum memilih)</SelectItem>
              {CLASSES.map((c) => (
                <SelectItem key={c.class_id} value={c.class_id}>
                  {c.class_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Nominal Biaya (IDR)</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value || "0", 10))}
          />
        </div>
      </div>
      <Separator className="my-2" />
      <div className="rounded-md bg-muted p-3 text-sm">
        <div className="font-medium">Preview payload:</div>
        <pre className="mt-1 whitespace-pre-wrap break-all text-xs">
          {JSON.stringify(
            {
              name,
              class_id: cls === "none" ? null : cls,
              amount_idr: amount,
              status: "menunggu",
            },
            null,
            2
          )}
        </pre>
      </div>
      <DialogFooter>
        <Button
          onClick={() =>
            alert("Submit dummy. Integrasikan ke API untuk produksi.")
          }
        >
          Simpan (dummy)
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

/* ===== Komponen Halaman ===== */
export default function SchoolRegistrationsListStudent() {
  /* ✅ Tambah breadcrumb seperti SchoolAcademic */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "PMB — Daftar Pendaftar",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Pendaftaran" },
        { label: "Murid" },
      ],
    });
  }, [setHeader]);

  const [termId, setTermId] = useState<string>(
    TERMS.find((t) => t.academic_term_is_active)?.academic_term_id ||
    TERMS[0].academic_term_id
  );
  const [addOpen, setAddOpen] = useState(false);

  const term = useMemo(
    () => TERMS.find((t) => t.academic_term_id === termId)!,
    [termId]
  );

  const rows = useMemo(() => STUDENTS, []);

  const statsSlot = (
    <div className="grid gap-3 md:grid-cols-3">
      <InfoItem label="Total Pendaftar" value={<b>{rows.length}</b>} />
      <InfoItem
        label="Diterima"
        value={<b>{rows.filter((r) => r.status === "diterima").length}</b>}
      />
      <InfoItem
        label="Lunas"
        value={<b>{rows.filter((r) => r.payment_status === "lunas").length}</b>}
      />
    </div>
  );

  const cols: ColumnDef<StudentReg>[] = [
    { id: "reg_no", header: "No. Reg", minW: "120px", align: "left", cell: (r) => r.reg_no },
    { id: "name", header: "Nama", minW: "200px", align: "left", cell: (r) => r.name },
    {
      id: "class_id",
      header: "Kelas",
      minW: "160px",
      cell: (r) => {
        const c = CLASSES.find((x) => x.class_id === r.class_id || "");
        return c ? c.class_name : <span className="text-muted-foreground">(Belum memilih)</span>;
      },
    },
    { id: "submitted_at", header: "Didaftarkan", minW: "160px", cell: (r) => dateShort(r.submitted_at) },
    {
      id: "status",
      header: "Status",
      minW: "120px",
      cell: (r) =>
        r.status === "diterima" ? (
          <Badge>diterima</Badge>
        ) : r.status === "ditolak" ? (
          <Badge variant="outline">ditolak</Badge>
        ) : (
          <Badge variant="secondary">menunggu</Badge>
        ),
    },
    {
      id: "amount_due_idr",
      header: "Nominal",
      minW: "140px",
      align: "right",
      cell: (r) => (r.amount_due_idr ? fmtIDR(r.amount_due_idr) : "-"),
    },
    {
      id: "payment_status",
      header: "Pembayaran",
      minW: "140px",
      cell: (r) =>
        r.payment_status === "lunas" ? (
          <Badge>lunas</Badge>
        ) : r.payment_status === "sebagian" ? (
          <Badge variant="secondary">sebagian</Badge>
        ) : (
          <Badge variant="outline">belum</Badge>
        ),
    },
  ];

  return (
    <div className="w-full">
      <PageHeader
        title="PMB — Daftar Pendaftar"
        subtitle="Pantau pendaftar per-periode, status seleksi, dan pembayaran."
      />

      {/* Picker Periode */}
      <Card className="mb-4">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base md:text-lg">Periode Akademik</CardTitle>
          <div className="w-full min-w-[220px] md:w-72">
            <Select value={termId} onValueChange={setTermId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                {TERMS.map((t) => (
                  <SelectItem key={t.academic_term_id} value={t.academic_term_id}>
                    {t.academic_term_academic_year} — {t.academic_term_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-3">
          <InfoItem label="Tgl Mulai" value={dateShort(term.academic_term_start_date)} />
          <InfoItem label="Tgl Selesai" value={dateShort(term.academic_term_end_date)} />
          <InfoItem
            label="Status"
            value={<Badge>{term.academic_term_is_active ? "Aktif" : "Nonaktif"}</Badge>}
          />
        </CardContent>
      </Card>

      {/* Tabel pendaftar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base md:text-lg">Murid Terdaftar</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => alert("Export CSV (dummy)")}>
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <CDataTable<StudentReg>
            title="Daftar Pendaftar"
            controlsPlacement="above"
            defaultQuery=""
            searchByKeys={["reg_no", "name"]}
            statsSlot={statsSlot}
            loading={false}
            error={null}
            columns={cols}
            rows={rows}
            getRowId={(r) => r.reg_id}
            onRowClick={(r) => alert(`Detail pendaftar: ${r.name} (dummy)`)}
            actions={{
              mode: "inline",
              onView: (r) => alert(`Lihat: ${r.name} (dummy)`),
              onEdit: (r) => alert(`Edit: ${r.name} (dummy)`),
              onDelete: (r) => alert(`Hapus: ${r.name} (dummy)`),
              headerLabel: "Aksi",
              size: "sm",
            }}
            onAdd={() => setAddOpen(true)}
            addLabel="Tambah"
            pageSize={20}
            zebra
            stickyHeader
          />
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <AddStudentDialog />
      </Dialog>

      <div className="h-6" />
    </div>
  );
}

/* ===== Small pieces ===== */
function InfoItem({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
