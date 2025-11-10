// src/pages/pendidikanku-dashboard/dashboard-school/academic/SchoolDetailAcademic.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* icons */
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ArrowLeft,
  School,
  Flag,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";

/* shadcn/ui */
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

/* === header layout hooks & crumbs === */
import {
  useDashboardHeader,
  type Crumb,
} from "@/components/layout/dashboard/DashboardLayout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/* ===== Type ===== */
type AcademicTerm = {
  academic_terms_school_id: string;
  academic_terms_academic_year: string;
  academic_terms_name: string;
  academic_terms_start_date: string;
  academic_terms_end_date: string;
  academic_terms_is_active: boolean;
  academic_terms_angkatan: number;
  academic_terms_id?: string;
};

/* ===== Dummy fallback ===== */
const DUMMY_TERM: AcademicTerm = {
  academic_terms_school_id: "dummy-school",
  academic_terms_academic_year: "2025/2026",
  academic_terms_name: "Ganjil",
  academic_terms_start_date: "2025-07-15T00:00:00+07:00",
  academic_terms_end_date: "2026-01-10T23:59:59+07:00",
  academic_terms_is_active: true,
  academic_terms_angkatan: 2025,
};

/* ===== Helpers ===== */
const dateShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "-";

/* ======== Header area with Back (mobile) + Breadcrumb (md+) ======== */
function HeaderBackArea({
  title,
  crumbs,
  basePath,
  onBack,
}: {
  title: string;
  crumbs: Crumb[];
  basePath: string; // e.g. "/<schoolId>/sekolah"
  onBack: () => void;
}) {
  const normalize = (href?: string) => {
    if (!href) return undefined;
    if (href.startsWith("/") || href.startsWith("http")) return href;
    return `${basePath}/${href.replace(/^\/+/, "")}`;
  };

  // potong judul mobile per kata supaya rapih
  const mobileTitle = (() => {
    const parts = (title || "").trim().split(/\s+/);
    return parts.length > 6 ? parts.slice(0, 6).join(" ") + "…" : title;
  })();

  return (
    <div className="min-w-0">
      {/* Mobile: back + title */}
      <div className="md:hidden flex items-center gap-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl"
          aria-label="Kembali"
          onClick={onBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div
          className="text-base font-semibold truncate max-w-[60vw]"
          title={title}
        >
          {mobileTitle}
        </div>
      </div>

      {/* Desktop/Tablet: breadcrumb */}
      <Breadcrumb className="hidden md:block min-w-0">
        <BreadcrumbList className="flex-nowrap overflow-hidden">
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <React.Fragment key={`${c.label}-${i}`}>
                <BreadcrumbItem className={i === 0 ? "hidden md:block" : ""}>
                  {isLast ? (
                    <BreadcrumbPage variant="chip" className="truncate">
                      {c.label}
                    </BreadcrumbPage>
                  ) : c.href ? (
                    <BreadcrumbLink asChild className="truncate">
                      <Link to={normalize(c.href)!}>{c.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <span className="truncate text-foreground/80">
                      {c.label}
                    </span>
                  )}
                </BreadcrumbItem>
                {!isLast && (
                  <BreadcrumbSeparator
                    className={i === 0 ? "hidden md:block" : ""}
                  />
                )}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

/* ===================== Page ===================== */
export default function SchoolDetailAcademic() {
  const { id: termId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { state } = useLocation() as { state?: { term?: AcademicTerm } };
  const term = useMemo<AcademicTerm>(
    () => state?.term ?? DUMMY_TERM,
    [state?.term]
  );

  /* ===== Inject header (back + breadcrumb) ===== */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    const base = `/${term.academic_terms_school_id}/sekolah`;
    setHeader({
      title: "Detail Periode", // penting, biar nggak fallback “Dashboard”
      headerLeft: (
        <HeaderBackArea
          title="Detail Periode"
          basePath={base}
          onBack={() => navigate(-1)}
          crumbs={[
            { label: "Dashboard", href: "dashboard" },
            { label: "Akademik", href: "akademik" },
            { label: "Detail Periode" },
          ]}
        />
      ),
    });
  }, [setHeader, navigate, term.academic_terms_school_id]);

  /* === PATCH (edit) === */
  const patchMut = useMutation({
    mutationFn: async (payload: any) => {
      const url = `/schools/${term.academic_terms_school_id}/academic-terms/${termId}`;
      const res = await axios.patch(url, payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      setOpenEdit(false);
    },
  });

  /* === DELETE === */
  const deleteMut = useMutation({
    mutationFn: async () => {
      const url = `/schools/${term.academic_terms_school_id}/academic-terms/${termId}`;
      const res = await axios.delete(url);
      return res.data;
    },
    onSuccess: () => {
      navigate(`/${term.academic_terms_school_id}/sekolah/akademik`, {
        replace: true,
      });
    },
  });

  const [openEdit, setOpenEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="w-full bg-background text-foreground">
      {/* Dialog Edit */}
      <EditTermDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        data={term}
        loading={patchMut.isPending}
        onSubmit={(payload) => patchMut.mutate(payload)}
      />

      {/* Konfirmasi Hapus */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus periode ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:opacity-90"
              onClick={() => deleteMut.mutate()}
            >
              {deleteMut.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <main className="w-full">
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-6 p-4">
          {/* (Header lokal dihapus—sudah ditangani header layout) */}

          {/* Info utama */}
          <Card>
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg grid place-items-center bg-accent text-accent-foreground">
                  <School size={20} />
                </div>
                <div className="font-semibold">Periode Akademik</div>
                {term.academic_terms_is_active && (
                  <Badge className="ml-auto" variant="default">
                    Aktif
                  </Badge>
                )}
              </div>

              <div className="p-5 grid md:grid-cols-2 gap-4">
                <InfoRow
                  icon={<CalendarDays size={18} />}
                  label="Tahun Ajaran / Semester"
                  value={`${term.academic_terms_academic_year} — ${term.academic_terms_name}`}
                />
                <InfoRow
                  icon={<CheckCircle2 size={18} />}
                  label="Status"
                  value={term.academic_terms_is_active ? "Aktif" : "Nonaktif"}
                />
                <InfoRow
                  icon={<Flag size={18} />}
                  label="Angkatan"
                  value={term.academic_terms_angkatan}
                />
                <InfoRow
                  icon={<Clock size={18} />}
                  label="Durasi"
                  value={`${dateShort(
                    term.academic_terms_start_date
                  )} s/d ${dateShort(term.academic_terms_end_date)}`}
                />
              </div>

              {/* Aksi halaman pindah ke kanan atas lewat header.actions jika mau.
                  Atau tetap di sini: */}
              <div className="px-5 pb-5 flex gap-2">
                <Button variant="outline" onClick={() => setOpenEdit(true)}>
                  <Pencil size={16} className="mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setConfirmDelete(true)}
                  disabled={deleteMut.isPending}
                >
                  <Trash2 size={16} className="mr-2" />
                  {deleteMut.isPending ? "Menghapus..." : "Hapus"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

/* ===== Small UI ===== */
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg grid place-items-center shrink-0 bg-accent text-accent-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-sm font-medium break-words">{value}</div>
      </div>
    </div>
  );
}

/* ===================== ✏️ Modal Edit (shadcn) ===================== */
function EditTermDialog({
  open,
  onOpenChange,
  data,
  onSubmit,
  loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: AcademicTerm;
  onSubmit: (payload: any) => void;
  loading?: boolean;
}) {
  const [academicYear, setAcademicYear] = useState(
    data.academic_terms_academic_year
  );
  const [name, setName] = useState(data.academic_terms_name);
  const [startDate, setStartDate] = useState(
    data.academic_terms_start_date.slice(0, 10)
  );
  const [endDate, setEndDate] = useState(
    data.academic_terms_end_date.slice(0, 10)
  );
  const [angkatan, setAngkatan] = useState<number>(
    data.academic_terms_angkatan
  );
  const [isActive, setIsActive] = useState<boolean>(
    data.academic_terms_is_active
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Periode Akademik</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="academic_year">Tahun Ajaran</Label>
            <Input
              id="academic_year"
              className="mt-1"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2025/2026"
            />
          </div>
          <div>
            <Label htmlFor="name">Nama Periode</Label>
            <Input
              id="name"
              className="mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ganjil / Genap"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start">Tanggal Mulai</Label>
              <Input
                id="start"
                type="date"
                className="mt-1"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end">Tanggal Selesai</Label>
              <Input
                id="end"
                type="date"
                className="mt-1"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="angkatan">Angkatan</Label>
            <Input
              id="angkatan"
              type="number"
              className="mt-1"
              value={angkatan}
              onChange={(e) => setAngkatan(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="is_active"
              checked={isActive}
              onCheckedChange={(v) => setIsActive(Boolean(v))}
            />
            <Label htmlFor="is_active" className="text-sm">
              Aktif
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="ghost" type="button">
              Batal
            </Button>
          </DialogClose>
          <Button
            onClick={() =>
              onSubmit({
                academic_terms_academic_year: academicYear,
                academic_terms_name: name,
                academic_terms_start_date: startDate,
                academic_terms_end_date: endDate,
                academic_terms_angkatan: angkatan,
                academic_terms_is_active: isActive,
              })
            }
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}