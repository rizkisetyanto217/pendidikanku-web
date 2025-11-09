// src/pages/sekolahislamku/pages/academic/SchoolActiveClass.tsx
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Users, ArrowLeft, Info, Loader2 } from "lucide-react";

/* ======== shadcn/ui ======== */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

/* ======== DataTable (seragam dgn Akademik) ======== */
import {
  CDataTable as DataTable,
  type ColumnDef,
  type Align,
} from "@/components/costum/table/CDataTable";

/* ===================== Types ===================== */
type ClassRow = {
  id: string;
  name: string;
  academic_year: string;
  homeroom_teacher: string;
  student_count: number;
  status: "active" | "inactive";
};

type ApiActiveClassResp = {
  list: ClassRow[];
};

/* ===================== Badge Status ===================== */
function StatusBadge({ status }: { status: ClassRow["status"] }) {
  const isActive = status === "active";
  return (
    <Badge variant={isActive ? "default" : "outline"}>
      {isActive ? "Aktif" : "Nonaktif"}
    </Badge>
  );
}

/* ===================== Card renderer (untuk view "card") ===================== */
function ClassCard({ r }: { r: ClassRow }) {
  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-medium">{r.name}</div>
          <div className="text-sm text-muted-foreground">{r.academic_year}</div>
        </div>
        <StatusBadge status={r.status} />
      </div>
      <div className="text-sm flex flex-col gap-1">
        <span className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" /> Wali Kelas: {r.homeroom_teacher}
        </span>
        <span className="flex items-center gap-2">
          <Users className="h-4 w-4" /> {r.student_count} siswa
        </span>
      </div>
    </div>
  );
}

/* ===================== (Opsional) Dialog tambah kelas ===================== */
function ClassFormDialog({
  open,
  onClose,
  onSubmit,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (v: { name: string; academic_year: string }) => void;
  loading?: boolean;
}) {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const canSubmit = name.trim() && year.trim();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Kelas</DialogTitle>
          <DialogDescription>
            Isi data minimal untuk membuat kelas.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <label className="text-sm">Nama Kelas</label>
            <input
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kelas 7A"
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-sm">Tahun Ajaran</label>
            <input
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2025/2026"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} disabled={!!loading}>
            Batal
          </Button>
          <Button
            onClick={() => onSubmit({ name, academic_year: year })}
            disabled={!canSubmit || !!loading}
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ===================== Page ===================== */
const SchoolActiveClass: React.FC = () => {
  const navigate = useNavigate();

  // Dummy fetch (tetap sama, hanya tampilan yang diseragamkan)
  const classesQ = useQuery({
    queryKey: ["active-classes"],
    queryFn: async (): Promise<ApiActiveClassResp> => {
      const dummy: ApiActiveClassResp = {
        list: Array.from({ length: 18 }).map((_, i) => ({
          id: `cls-${i + 1}`,
          name: `Kelas ${i + 1}${["A", "B"][i % 2]}`,
          academic_year: "2025/2026",
          homeroom_teacher: `Ustadz/Ustadzah ${i + 1}`,
          student_count: 25 + (i % 6),
          status: i % 5 === 0 ? "inactive" : "active",
        })),
      };
      return dummy;
    },
    staleTime: 60_000,
  });

  const rows: ClassRow[] = useMemo(
    () => classesQ.data?.list ?? [],
    [classesQ.data]
  );

  // ===== Columns (seragam gaya Akademik) =====
  const columns: ColumnDef<ClassRow>[] = [
    {
      id: "name",
      header: "Nama Kelas",
      minW: "180px",
      align: "left" as Align,
      cell: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      id: "academic_year",
      header: "Tahun Ajaran",
      minW: "140px",
      align: "left" as Align,
      cell: (r) => r.academic_year,
    },
    {
      id: "homeroom_teacher",
      header: "Wali Kelas",
      minW: "160px",
      align: "left" as Align,
      cell: (r) => r.homeroom_teacher,
    },
    {
      id: "student_count",
      header: "Jumlah Siswa",
      minW: "120px",
      align: "right" as Align,
      cell: (r) => r.student_count,
    },
    {
      id: "status",
      header: "Status",
      minW: "120px",
      align: "center" as Align,
      cell: (r) => <StatusBadge status={r.status} />,
    },
  ];

  // ===== Stats Slot (opsional) =====
  const statsSlot = classesQ.isLoading ? (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="animate-spin" size={16} /> Memuat data kelas aktif…
    </div>
  ) : rows.length === 0 ? (
    <div className="text-sm text-muted-foreground flex items-center gap-2">
      <Info size={16} /> Tidak ada data kelas.
    </div>
  ) : null;

  // ===== Modal tambah =====
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      {/* Header / Toolbar (konsisten dengan Akademik) */}
      <div className="px-4 md:px-6 pt-4 md:pt-6">
        <div className="hidden md:flex items-center gap-2 font-semibold">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Kembali"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <main className="w-full px-4 md:px-6 pb-8">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 lg:gap-6">
          <DataTable<ClassRow>
            /* ===== Toolbar ===== */
            title="Kelas Aktif"
            controlsPlacement="above"
            onAdd={() => setCreateOpen(true)} // ⬅️ tombol “Tambah”
            addLabel="Tambah"
            /* Search (client-side) */
            defaultQuery=""
            searchPlaceholder="Cari kelas, wali, atau tahun ajaran…"
            searchByKeys={["name", "homeroom_teacher", "academic_year"]}
            /* Stats */
            statsSlot={statsSlot}
            /* ===== Data ===== */
            loading={classesQ.isLoading}
            error={classesQ.isError ? "Gagal memuat data kelas." : null}
            columns={columns}
            rows={rows}
            getRowId={(r) => r.id}
            /* UX */
            stickyHeader
            zebra
            pageSize={12}
            pageSizeOptions={[8, 12, 24, 48, 100]}
            viewModes={["table", "card"]}
            defaultView="table"
            renderCard={(r) => <ClassCard r={r} />}

            /* (opsional) klik baris ke detail */
            // onRowClick={(row) => navigate(`/kelas/${row.id}`)}
          />
        </div>
      </main>

      {/* Dialog Tambah (sementara mock; sambungkan ke API-mu) */}
      <ClassFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={(v) => {
          // TODO: panggil API create class di sini
          console.log("create class payload:", v);
          setCreateOpen(false);
        }}
      />
    </div>
  );
};

export default SchoolActiveClass;
