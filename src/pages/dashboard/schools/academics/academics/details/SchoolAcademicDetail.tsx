// src/pages/pendidikanku-dashboard/dashboard-school/academic/SchoolDetailAcademic.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* icons */
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  School,
  Flag,
  Pencil,
  Trash2,
  Loader2,
  Users,
  Layers,
  ArrowLeft,
} from "lucide-react";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

/* === header layout hook === */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import CBadgeStatus from "@/components/costum/common/CBadgeStatus";

/* ===== Types dari API baru ===== */

type Term = {
  academic_term_id: string;
  academic_term_school_id: string;
  academic_term_academic_year: string;
  academic_term_name: string;
  academic_term_start_date: string;
  academic_term_end_date: string;
  academic_term_is_active: boolean;
  academic_term_angkatan: number;
  academic_term_slug: string;
  academic_term_period: string;
  academic_term_created_at: string;
  academic_term_updated_at: string;
};

type TermClass = {
  class_id: string;
  class_school_id: string;
  class_name: string;
  class_slug: string;
  class_start_date: string | null;
  class_end_date: string | null;
  class_registration_opens_at: string | null;
  class_registration_closes_at: string | null;
  class_quota_taken: number | null;
  class_delivery_mode: string;
  class_status: string;
  class_image_url: string | null;
  class_parent_name_snapshot: string | null;
  class_parent_slug_snapshot: string | null;
  class_parent_level_snapshot: number | null;
};

type TermClassSection = {
  class_section_id: string;
  class_section_school_id: string;
  class_section_slug: string;
  class_section_name: string;
  class_section_code: string | null;
  class_section_total_students: number | null;
  class_section_image_url: string | null;
  class_section_class_id: string;
  class_section_class_name_snapshot: string;
  class_section_class_slug_snapshot: string;
  class_section_class_parent_name_snapshot: string;
  class_section_class_parent_slug_snapshot: string;
  class_section_class_parent_level_snapshot: number;
  class_section_subject_teachers_enrollment_mode: string;
  class_section_subject_teachers_self_select_requires_approval: boolean;
  class_section_is_active: boolean;
};

type TermBundle = {
  term: Term;
  classes: TermClass[];
  class_sections: TermClassSection[];
};

type TermListResp = {
  data: TermBundle[];
};

/* ===== Helpers ===== */
const dateShort = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "-";

function deliveryModeLabel(mode: string) {
  switch (mode) {
    case "online":
      return "Online";
    case "offline":
      return "Tatap muka";
    case "hybrid":
      return "Hybrid";
    default:
      return mode;
  }
}

function sectionModeLabel(mode: string, needApproval: boolean): string {
  if (mode === "self_select") {
    return needApproval
      ? "Siswa pilih sendiri (perlu approval)"
      : "Siswa pilih sendiri";
  }
  if (mode === "assigned") return "Ditentukan admin";
  if (mode === "closed") return "Tutup penugasan";
  return mode;
}

/* ===== Query detail academic term (API /u) ===== */
function useAcademicTermDetail(termId?: string) {
  return useQuery({
    queryKey: ["academic-term-detail", termId],
    enabled: !!termId,
    queryFn: async (): Promise<TermBundle | null> => {
      const res = await axios.get<TermListResp>("/u/academic-terms/list", {
        params: {
          id: termId,
          include: "classes,class_sections",
          per_page: 1,
        },
      });
      const first = res.data?.data?.[0] ?? null;
      return first;
    },
  });
}

/* ===================== Page ===================== */
export default function SchoolAcademicDetail() {
  const { id: termId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Detail Akademik",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Akademik" },
        { label: "Tahun Akademik", href: "akademik/tahun-akademik" },
        { label: "Detail" },
      ],
      showBack: true,
    });
  }, [setHeader]);

  const { data: bundle, isLoading } = useAcademicTermDetail(termId);
  const term = bundle?.term ?? null;
  const classes = bundle?.classes ?? [];
  const sections = bundle?.class_sections ?? [];

  /* === PATCH (edit) === */
  const patchMut = useMutation({
    mutationFn: async (payload: any) => {
      if (!term || !termId) {
        throw new Error("Data periode akademik belum siap.");
      }
      const url = `/schools/${term.academic_term_school_id}/academic-terms/${termId}`;
      const res = await axios.patch(url, payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academic-term-detail", termId] });
      setOpenEdit(false);
    },
  });

  /* === DELETE === */
  const deleteMut = useMutation({
    mutationFn: async () => {
      if (!term || !termId) {
        throw new Error("Data periode akademik belum siap.");
      }
      const url = `/schools/${term.academic_term_school_id}/academic-terms/${termId}`;
      const res = await axios.delete(url);
      return res.data;
    },
    onSuccess: () => {
      if (!term) return;
      navigate(`/${term.academic_term_school_id}/sekolah/akademik`, {
        replace: true,
      });
    },
  });

  const [openEdit, setOpenEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const totalSections = sections.length;
  const totalActiveSections = sections.filter(
    (s) => s.class_section_is_active
  ).length;

  return (
    <div className="w-full bg-background text-foreground">
      {/* Dialog Edit (hanya jika sudah ada term) */}
      {term && (
        <EditTermDialog
          open={openEdit}
          onOpenChange={setOpenEdit}
          data={term}
          loading={patchMut.isPending}
          onSubmit={(payload) => patchMut.mutate(payload)}
        />
      )}

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
              disabled={deleteMut.isPending}
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
        <div className="mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="md:flex hidden items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="gap-1.5"
              >
                <ArrowLeft size={20} />
              </Button>
              <h1 className="font-semibold text-lg md:text-xl">Detail akademik</h1>
            </div>
          </div>
          {/* Loading / kosong */}
          {isLoading && (
            <Card>
              <CardContent className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memuat data periode akademik…
              </CardContent>
            </Card>
          )}

          {!isLoading && !term && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Data periode akademik tidak ditemukan.
              </CardContent>
            </Card>
          )}

          {/* Info utama */}
          {term && (
            <Card>
              <CardContent className="p-0">
                <div className="grid gap-4 p-5 md:grid-cols-2">
                  <InfoRow
                    icon={<CalendarDays size={18} />}
                    label="Tahun Ajaran / Nama Periode"
                    value={`${term.academic_term_academic_year} — ${term.academic_term_name}`}
                  />
                  <InfoRow
                    icon={<CheckCircle2 size={18} />}
                    label="Status"
                    value={
                      <CBadgeStatus
                        status={term.academic_term_is_active ? "active" : "inactive"}
                      />
                    }
                  />

                  <InfoRow
                    icon={<Flag size={18} />}
                    label="Angkatan"
                    value={term.academic_term_angkatan}
                  />
                  <InfoRow
                    icon={<Clock size={18} />}
                    label="Durasi"
                    value={`${dateShort(
                      term.academic_term_start_date
                    )} s/d ${dateShort(term.academic_term_end_date)}`}
                  />
                </div>

                <div className="flex gap-2 px-5 pb-5">
                  <Button
                    variant="outline"
                    onClick={() => setOpenEdit(true)}
                    disabled={patchMut.isPending || deleteMut.isPending}
                  >
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
          )}

          {/* Kelas + Rombel */}
          {term && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Kelas */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">
                        Kelas di Periode Ini
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Program belajar yang berjalan di term ini.
                      </p>
                    </div>
                    <Badge variant="outline">Total: {classes.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {classes.length === 0 && (
                    <div className="py-4 text-center text-xs text-muted-foreground">
                      Belum ada kelas terhubung ke periode ini.
                    </div>
                  )}

                  {classes.map((cls) => (
                    <div
                      key={cls.class_id}
                      className="flex gap-3 rounded-lg border bg-background/50 p-3 text-xs"
                    >
                      {cls.class_image_url ? (
                        <img
                          src={cls.class_image_url}
                          alt={cls.class_name}
                          className="h-14 w-20 rounded-md object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="grid h-14 w-20 place-items-center rounded-md bg-muted text-muted-foreground">
                          <School className="h-4 w-4" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="truncate text-sm font-semibold">
                            {cls.class_name}
                          </div>
                          <CBadgeStatus
                            status={cls.class_status === "active" ? "active" : "inactive"}
                            className="text-[10px]"
                          />

                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span className="rounded-full bg-muted px-2 py-0.5">
                            {cls.class_parent_name_snapshot ?? "-"}
                          </span>
                          <span className="rounded-full border px-2 py-0.5">
                            {cls.class_slug}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          <span>
                            Mode:{" "}
                            <span className="font-medium">
                              {deliveryModeLabel(cls.class_delivery_mode)}
                            </span>
                          </span>
                          <span>
                            Periode: {dateShort(cls.class_start_date)} s/d{" "}
                            {dateShort(cls.class_end_date)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          <span>
                            Pendaftaran:{" "}
                            {dateShort(cls.class_registration_opens_at)} s/d{" "}
                            {dateShort(cls.class_registration_closes_at)}
                          </span>
                          <span>
                            Kuota terpakai:{" "}
                            <span className="font-medium">
                              {cls.class_quota_taken ?? 0}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Rombongan Belajar (Class Sections) */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">
                        Rombongan Belajar
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Kelas kecil / kelompok belajar per program.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline">Total: {totalSections}</Badge>
                      <Badge variant="outline">
                        Aktif: {totalActiveSections}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sections.length === 0 && (
                    <div className="py-4 text-center text-xs text-muted-foreground">
                      Belum ada rombongan belajar di periode ini.
                    </div>
                  )}

                  {sections.map((sec) => (
                    <div
                      key={sec.class_section_id}
                      className="flex gap-3 rounded-lg border bg-background/50 p-3 text-xs"
                    >
                      {sec.class_section_image_url ? (
                        <img
                          src={sec.class_section_image_url}
                          alt={sec.class_section_name}
                          className="h-12 w-16 rounded-md object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="grid h-12 w-16 place-items-center rounded-md bg-muted text-muted-foreground">
                          <Layers className="h-4 w-4" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="truncate text-sm font-semibold">
                            {sec.class_section_name}
                          </div>
                          <CBadgeStatus
                            status={sec.class_section_is_active ? "active" : "inactive"}
                            className="text-[10px]"
                          />

                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span className="rounded-full bg-muted px-2 py-0.5">
                            {sec.class_section_class_name_snapshot}
                          </span>
                          <span className="rounded-full border px-2 py-0.5">
                            {sec.class_section_slug}
                          </span>
                          {sec.class_section_code && (
                            <span className="rounded-full border px-2 py-0.5 font-mono">
                              {sec.class_section_code}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>
                              Siswa:{" "}
                              <span className="font-medium">
                                {sec.class_section_total_students ?? 0}
                              </span>
                            </span>
                          </span>
                          <span>
                            Parent:{" "}
                            {sec.class_section_class_parent_name_snapshot}{" "}
                            (Level{" "}
                            {sec.class_section_class_parent_level_snapshot})
                          </span>
                        </div>

                        <div className="text-[11px] text-muted-foreground">
                          Mode mapel &amp; pengajar:{" "}
                          <span className="font-medium">
                            {sectionModeLabel(
                              sec.class_section_subject_teachers_enrollment_mode,
                              sec.class_section_subject_teachers_self_select_requires_approval
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
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
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="break-words text-sm font-medium">{value}</div>
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
  data: Term;
  onSubmit: (payload: any) => void;
  loading?: boolean;
}) {
  const [academicYear, setAcademicYear] = useState(
    data.academic_term_academic_year
  );
  const [name, setName] = useState(data.academic_term_name);
  const [startDate, setStartDate] = useState(
    data.academic_term_start_date.slice(0, 10)
  );
  const [endDate, setEndDate] = useState(
    data.academic_term_end_date.slice(0, 10)
  );
  const [angkatan, setAngkatan] = useState<number>(data.academic_term_angkatan);
  const [isActive, setIsActive] = useState<boolean>(
    data.academic_term_is_active
  );

  // kalau data berubah (misal reload), sinkron lagi
  useEffect(() => {
    setAcademicYear(data.academic_term_academic_year);
    setName(data.academic_term_name);
    setStartDate(data.academic_term_start_date.slice(0, 10));
    setEndDate(data.academic_term_end_date.slice(0, 10));
    setAngkatan(data.academic_term_angkatan);
    setIsActive(data.academic_term_is_active);
  }, [data]);

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
              placeholder="Ganjil / Genap / Angkatan ke-1"
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