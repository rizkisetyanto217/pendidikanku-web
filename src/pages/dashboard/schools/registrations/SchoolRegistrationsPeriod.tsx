// src/pages/pmb/PmbPeriodPage.demo.tsx
import * as React from "react";
import { useMemo, useState, useEffect } from "react";
/* ✅ Breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

/* icons */
import {
  Edit,
  RefreshCw,
  MoreHorizontal,
  Eye,
  ArrowLeft,
} from "lucide-react";

/* === DataTable (custom) — samakan dengan Academic Terms === */
import {
  DataTable as CDataTable,
  type ColumnDef,
} from "@/components/costum/table/CDataTable";
import { useNavigate } from "react-router-dom";
import CBadgeStatus from "@/components/costum/common/badges/CBadgeStatus";

/* utils */
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

/* =====================================================================
 * Dummy data
 * ===================================================================== */
type AcademicTerm = {
  academic_term_id: string;
  academic_term_academic_year: string;
  academic_term_name: string;
  academic_term_start_date: string; // TIMESTAMPTZ
  academic_term_end_date: string; // TIMESTAMPTZ
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
  class_slug: string;
  class_term_id?: string;
  class_registration_opens_at?: string; // TIMESTAMPTZ
  class_registration_closes_at?: string; // TIMESTAMPTZ
  class_quota_total?: number | null;
  class_quota_taken: number;
};

const CLASSES: ClassRow[] = [
  {
    class_id: "c1",
    class_name: "Kelas 1A",
    class_slug: "kelas-1a",
    class_term_id: "t1",
    class_registration_opens_at: "2025-01-01T00:00:00+07:00",
    class_registration_closes_at: "2025-03-30T23:59:00+07:00",
    class_quota_total: 30,
    class_quota_taken: 18,
  },
  {
    class_id: "c2",
    class_name: "Kelas 1B",
    class_slug: "kelas-1b",
    class_term_id: "t1",
    class_registration_opens_at: "2025-01-15T00:00:00+07:00",
    class_registration_closes_at: "2025-03-15T23:59:00+07:00",
    class_quota_total: 30,
    class_quota_taken: 12,
  },
  {
    class_id: "c3",
    class_name: "Kelas 2A",
    class_slug: "kelas-2a",
    class_term_id: "t2",
    class_registration_opens_at: "2025-04-15T00:00:00+07:00",
    class_registration_closes_at: "2025-06-30T23:59:00+07:00",
    class_quota_total: 28,
    class_quota_taken: 0,
  },
];

type GeneralBilling = {
  general_billing_id: string;
  general_billing_title: string;
  general_billing_term_id?: string;
  general_billing_class_id?: string | null;
  general_billing_due_date?: string | null; // DATE
  general_billing_is_active: boolean;
  general_billing_default_amount_idr?: number | null;
  general_billing_kind_snapshot?: { code?: string; name?: string } | null;
};

const GB_HEADERS: GeneralBilling[] = [
  {
    general_billing_id: "gb1",
    general_billing_title: "Biaya Pendaftaran PMB 2025/2026",
    general_billing_term_id: "t1",
    general_billing_class_id: null,
    general_billing_due_date: "2025-03-31",
    general_billing_is_active: true,
    general_billing_default_amount_idr: 150_000,
    general_billing_kind_snapshot: { code: "PENDAFTARAN", name: "Pendaftaran" },
  },
  {
    general_billing_id: "gb2",
    general_billing_title: "Biaya Pendaftaran Gelombang 2",
    general_billing_term_id: "t1",
    general_billing_class_id: "c2",
    general_billing_due_date: "2025-03-20",
    general_billing_is_active: true,
    general_billing_default_amount_idr: 175_000,
    general_billing_kind_snapshot: { code: "PENDAFTARAN", name: "Pendaftaran" },
  },
  {
    general_billing_id: "gb3",
    general_billing_title: "Biaya Pendaftaran Kelas 2A",
    general_billing_term_id: "t2",
    general_billing_class_id: "c3",
    general_billing_due_date: "2025-06-25",
    general_billing_is_active: false,
    general_billing_default_amount_idr: 150_000,
    general_billing_kind_snapshot: { code: "PENDAFTARAN", name: "Pendaftaran" },
  },
];

/* =====================================================================
 * Page container
 * ===================================================================== */
// function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
//   return (
//     <div className="mb-4 flex items-center gap-3">
//       <div>
//         <h1 className="text-xl font-semibold leading-tight md:text-2xl">
//           {title}
//         </h1>
//         {subtitle && (
//           <p className="text-sm text-muted-foreground">{subtitle}</p>
//         )}
//       </div>
//     </div>
//   );
// }

/* ===== Actions menu (samakan pattern dengan Academic Terms) ===== */
function ActionsMenu({
  onView,
  onEdit,
  onDelete,
}: {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Aksi">
          <MoreHorizontal size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onView && (
          <DropdownMenuItem onClick={onView} className="gap-2">
            <Eye size={14} /> Lihat
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={onEdit} className="gap-2">
            <Edit size={14} /> Edit
          </DropdownMenuItem>
        )}
        {(onView || onEdit) && <DropdownMenuSeparator />}
        {onDelete && (
          <DropdownMenuItem
            onClick={onDelete}
            className="gap-2 text-destructive focus:text-destructive"
          >
            Hapus
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* =====================================================================
 * SECTION: Periode Pendaftaran — Single Page (tanpa Tabs)
 * ===================================================================== */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function SchoolRegistrationsPeriod({
  showBack = false,
  backTo
}: Props) {
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  /* ✅ Tambah breadcrumb seperti SchoolAcademic */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "PMB — Periode Pendaftaran",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Pendaftaran" },
        { label: "Periode" },
      ],
      showBack,
    });
  }, [setHeader, showBack]);

  // default: periode aktif
  const [termId, setTermId] = useState<string>(
    TERMS.find((t) => t.academic_term_is_active)?.academic_term_id ||
    TERMS[0].academic_term_id
  );
  const [addOpen, setAddOpen] = useState(false);
  const term = useMemo(
    () => TERMS.find((t) => t.academic_term_id === termId)!,
    [termId]
  );

  <Dialog open={addOpen} onOpenChange={setAddOpen}>
    <AddGbDialog termId={termId} />
  </Dialog>;

  // kelas & GB terfilter
  const relatedClasses = useMemo(
    () => CLASSES.filter((c) => !c.class_term_id || c.class_term_id === termId),
    [termId]
  );
  const relatedGB = useMemo(
    () =>
      GB_HEADERS.filter(
        (g) =>
          (!g.general_billing_term_id ||
            g.general_billing_term_id === termId) &&
          (g.general_billing_kind_snapshot?.code === "PENDAFTARAN" ||
            /pendaftaran/i.test(g.general_billing_kind_snapshot?.name || ""))
      ),
    [termId]
  );

  /* ===================== Columns: Jendela per Kelas ===================== */
  const classCols: ColumnDef<ClassRow>[] = [
    {
      id: "class_name",
      header: "Kelas",
      minW: "180px",

      cell: (r) => r.class_name,
    },
    {
      id: "class_registration_opens_at",
      header: "Buka",
      minW: "160px",
      cell: (r) => dateShort(r.class_registration_opens_at),
    },
    {
      id: "class_registration_closes_at",
      header: "Tutup",
      minW: "160px",
      cell: (r) => dateShort(r.class_registration_closes_at),
    },
    {
      id: "class_quota_total",
      header: "Kuota",
      minW: "140px",
      cell: (r) => (
        <div className="whitespace-nowrap">
          {r.class_quota_total ?? "∞"}{" "}
          <span className="text-muted-foreground">
            (terisi {r.class_quota_taken})
          </span>
        </div>
      ),
    },
  ];

  /* ===================== Columns: General Billings ===================== */
  const gbCols: ColumnDef<GeneralBilling>[] = [
    {
      id: "general_billing_title",
      header: "Judul",
      minW: "260px",
      cell: (r) => (
        <div className="text-center">
          <div className="font-medium">{r.general_billing_title}</div>
        </div>
      ),
    },
    {
      id: "general_billing_kind_snapshot",
      header: "Jenis",
      minW: "160px",
      cell: (r) => r.general_billing_kind_snapshot?.name || "-",
    },
    {
      id: "general_billing_class_id",
      header: "Kelas",
      minW: "180px",
      cell: (r) => {
        const cls = CLASSES.find(
          (c) => c.class_id === r.general_billing_class_id || ""
        );
        return cls ? (
          cls.class_name
        ) : (
          <span className="text-muted-foreground">(Semua kelas)</span>
        );
      },
    },
    {
      id: "general_billing_due_date",
      header: "Jatuh Tempo",
      minW: "140px",
      cell: (r) => dateShort(r.general_billing_due_date),
    },
    {
      id: "general_billing_default_amount_idr",
      header: "Nominal Default",
      minW: "160px",
      align: "right",
      cell: (r) =>
        r.general_billing_default_amount_idr
          ? fmtIDR(r.general_billing_default_amount_idr)
          : "-",
    },
    {
      id: "general_billing_is_active",
      header: "Status",
      minW: "120px",
      cell: (r) => (
        <CBadgeStatus
          status={r.general_billing_is_active ? "active" : "inactive"}
        />
      ),

    },
  ];

  /* ===================== Dialog Edit Kelas ===================== */
  const [editClassId, setEditClassId] = useState<string | undefined>(
    relatedClasses[0]?.class_id
  );

  /* ===================== Stats slot (konsep sama) ===================== */
  const classStats = (
    <div className="grid gap-3 md:grid-cols-3">
      <InfoItem label="Jumlah Kelas" value={<b>{relatedClasses.length}</b>} />
      <InfoItem
        label="Sedang Dibuka"
        value={
          <b>
            {
              relatedClasses.filter(
                (c) =>
                  !!c.class_registration_opens_at &&
                  !!c.class_registration_closes_at &&
                  new Date(c.class_registration_opens_at) <= new Date() &&
                  new Date() <= new Date(c.class_registration_closes_at)
              ).length
            }
          </b>
        }
      />
      <InfoItem
        label="Kuota Total"
        value={
          <b>
            {relatedClasses.reduce(
              (acc, c) => acc + (Number(c.class_quota_total ?? 0) || 0),
              0
            )}
          </b>
        }
      />
    </div>
  );

  const gbStats = (
    <div className="grid gap-3 md:grid-cols-3">
      <InfoItem
        label="Header Aktif"
        value={
          <b>{relatedGB.filter((g) => g.general_billing_is_active).length}</b>
        }
      />
      <InfoItem
        label="Semua Kelas"
        value={
          <b>{relatedGB.filter((g) => !g.general_billing_class_id).length}</b>
        }
      />
      <InfoItem
        label="Total Nominal Default"
        value={
          <b>
            {fmtIDR(
              relatedGB.reduce(
                (acc, g) => acc + (g.general_billing_default_amount_idr || 0),
                0
              )
            )}
          </b>
        }
      />
    </div>
  );

  return (
    <div className="w-full">
      {/* Header Back seperti SchoolAcademic */}
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
          <h1 className="text-lg font-semibold md:text-xl">
            PMB - Periode Pendaftaran
          </h1>
          <p className="mt-1 text-xs text-muted-foreground md:text-sm mb-4">
            Atur jadwal pendaftaran per-periode, jendela per kelas, dan header biaya pendaftaran
          </p>
        </div>
      </div>

      {/* Picker Periode Akademik */}
      <Card className="mb-4">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base md:text-lg">
            Periode Akademik
          </CardTitle>
          <div className="w-full min-w-[220px] md:w-72">
            <Select value={termId} onValueChange={setTermId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                {TERMS.map((t) => (
                  <SelectItem
                    key={t.academic_term_id}
                    value={t.academic_term_id}
                  >
                    {t.academic_term_academic_year} — {t.academic_term_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-3">
          <InfoItem
            label="Tgl Mulai"
            value={dateShort(term.academic_term_start_date)}
          />
          <InfoItem
            label="Tgl Selesai"
            value={dateShort(term.academic_term_end_date)}
          />
          <InfoItem
            label="Status"
            value={
              <CBadgeStatus
                className="mt-1"
                status={term.academic_term_is_active ? "active" : "inactive"}
              />

            }
          />
        </CardContent>
      </Card>

      {/* ===== Jendela pendaftaran per Kelas (CDataTable konsep Academic) ===== */}
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base md:text-lg">
            Jendela Pendaftaran per Kelas
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            {relatedClasses.length > 0 && (
              <EditClassWindowDialog classId={editClassId} />
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <CDataTable<ClassRow>
            /* ===== Toolbar ===== */
            title="Jendela Pendaftaran"
            controlsPlacement="above"
            /* Search */
            defaultQuery=""
            searchByKeys={["class_name", "class_slug"]}
            /* Stats area (konsep sama) */
            statsSlot={classStats}
            /* ===== Data ===== */
            loading={false}
            error={null}
            columns={classCols}
            rows={relatedClasses}
            getRowId={(r) => r.class_id}
            /* Row click → lihat detail (dummy) */
            onRowClick={(row) =>
              alert(`Lihat detail kelas: ${row.class_name} (dummy)`)
            }
            /* Actions: inline + menu */
            renderActions={(r) => (
              <ActionsMenu
                onView={() =>
                  alert(`Lihat detail kelas: ${r.class_name} (dummy)`)
                }
                onEdit={() => setEditClassId(r.class_id)}
                onDelete={() =>
                  alert(`Hapus jendela kelas: ${r.class_name} (dummy)`)
                }
              />
            )}
            actions={{
              mode: "inline",
              onView: (row) =>
                alert(`Lihat detail kelas: ${row.class_name} (dummy)`),
              onEdit: (row) => setEditClassId(row.class_id),
              onDelete: (row) =>
                alert(`Hapus jendela kelas: ${row.class_name} (dummy)`),
              headerLabel: "Aksi",
              size: "sm",
            }}
            /* Pagination */
            pageSize={20}
            zebra
            stickyHeader
          />
        </CardContent>
      </Card>

      {/* ===== Header Biaya Pendaftaran (CDataTable konsep Academic) ===== */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base md:text-lg">
            Header Biaya Pendaftaran (General Billings)
          </CardTitle>
          {/* tombol tambah dipindah ke toolbar DataTable */}
        </CardHeader>
        <CardContent className="pt-2">
          <CDataTable<GeneralBilling>
            title="Header Biaya Pendaftaran"
            controlsPlacement="above"
            defaultQuery=""
            searchByKeys={["general_billing_title", "general_billing_due_date"]}
            statsSlot={gbStats}
            loading={false}
            error={null}
            columns={gbCols}
            rows={relatedGB}
            getRowId={(r) => r.general_billing_id}
            onRowClick={(row) =>
              alert(`Lihat header biaya: ${row.general_billing_title} (dummy)`)
            }
            renderActions={(r) => (
              <ActionsMenu
                onView={() =>
                  alert(
                    `Lihat header biaya: ${r.general_billing_title} (dummy)`
                  )
                }
                onEdit={() =>
                  alert(`Edit header biaya: ${r.general_billing_title} (dummy)`)
                }
                onDelete={() =>
                  alert(
                    `Hapus header biaya: ${r.general_billing_title} (dummy)`
                  )
                }
              />
            )}
            actions={{
              mode: "inline",
              onView: (r) =>
                alert(`Lihat header biaya: ${r.general_billing_title} (dummy)`),
              onEdit: (r) =>
                alert(`Edit header biaya: ${r.general_billing_title} (dummy)`),
              onDelete: (r) =>
                alert(`Hapus header biaya: ${r.general_billing_title} (dummy)`),
              headerLabel: "Aksi",
              size: "sm",
            }}
            /* ⬇️ ini yang penting */
            onAdd={() => setAddOpen(true)}
            addLabel="Tambah"
            pageSize={20}
            zebra
            stickyHeader
          />
        </CardContent>
      </Card>

      <div className="h-6" />
    </div>
  );
}

/* =====================================================================
 * Reusable small pieces
 * ===================================================================== */
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

function EditClassWindowDialog({ classId }: { classId?: string }) {
  const [open, setOpen] = useState(false);
  const cls = CLASSES.find((c) => c.class_id === classId);

  const [opens, setOpens] = useState<string | undefined>(
    cls?.class_registration_opens_at
  );
  const [closes, setCloses] = useState<string | undefined>(
    cls?.class_registration_closes_at
  );
  const [quota, setQuota] = useState<number | "">(cls?.class_quota_total ?? "");

  if (!cls) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="mr-2 h-4 w-4" />
          Edit Jendela
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Jendela Pendaftaran</DialogTitle>
          <DialogDescription>{cls.class_name}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Buka</Label>
            <Input
              type="datetime-local"
              value={opens?.slice(0, 16) || ""}
              onChange={(e) =>
                setOpens(
                  e.target.value
                    ? new Date(e.target.value).toISOString()
                    : undefined
                )
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Tutup</Label>
            <Input
              type="datetime-local"
              value={closes?.slice(0, 16) || ""}
              onChange={(e) =>
                setCloses(
                  e.target.value
                    ? new Date(e.target.value).toISOString()
                    : undefined
                )
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Kuota Total (opsional)</Label>
            <Input
              type="number"
              value={quota}
              onChange={(e) =>
                setQuota(
                  e.target.value === "" ? "" : parseInt(e.target.value, 10)
                )
              }
            />
            <p className="text-xs text-muted-foreground">
              Nominal asli ada di kolom <code>class_quota_total</code>.
              Tinggalkan kosong untuk tak terbatas.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Simpan (dummy)</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddGbDialog({ termId }: { termId: string }) {
  const [title, setTitle] = useState("Biaya Pendaftaran Baru");
  const [cls, setCls] = useState<string | "all">("all");
  const [due, setDue] = useState<string>("2025-03-31");
  const [amount, setAmount] = useState<number>(150_000);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Tambah Header Biaya Pendaftaran</DialogTitle>
        <DialogDescription>
          Simulasi form pembuatan baris di tabel <code>general_billings</code>.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-2 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label>Judul</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Kelas (opsional)</Label>
          <Select value={cls} onValueChange={(v) => setCls(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">(Semua kelas)</SelectItem>
              {CLASSES.map((c) => (
                <SelectItem key={c.class_id} value={c.class_id}>
                  {c.class_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Jatuh Tempo</Label>
          <Input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Nominal Default (IDR)</Label>
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
              general_billing_title: title,
              general_billing_term_id: termId,
              general_billing_class_id: cls === "all" ? null : cls,
              general_billing_due_date: due,
              general_billing_default_amount_idr: amount,
              general_billing_kind_snapshot: {
                code: "PENDAFTARAN",
                name: "Pendaftaran",
              },
              general_billing_is_active: true,
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
