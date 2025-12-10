// src/pages/pendidikanku-dashboard/dashboard-school/academic/SchoolDetailAcademic.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* icons */
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  School,
  Flag,
  Loader2,
  Users,
  Layers,
  ArrowLeft,
} from "lucide-react";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* === header layout hook === */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import CBadgeStatus from "@/components/costum/common/badges/CBadgeStatus";

import CActionsButton from "@/components/costum/common/buttons/CActionsButton";
import CDeleteDialog from "@/components/costum/common/buttons/CDeleteDialog";


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
  // di-backend: class_class_parent_*_cache
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
  // di-backend: *_cache
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

/**
 * Bentuk response backend:
 * {
 *   data: Term[],
 *   include: {
 *     classes: [...],
 *     class_sections: [...]
 *   }
 * }
 */
type TermListResp = {
  data: Term[];
  include?: {
    classes?: any[];
    class_sections?: any[];
  };
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

      const term = res.data?.data?.[0];
      if (!term) return null;

      const include = (res.data as any).include ?? {};
      const rawClasses: any[] = include.classes ?? [];
      const rawSections: any[] = include.class_sections ?? [];

      const classes: TermClass[] = rawClasses.map((cls) => ({
        class_id: cls.class_id,
        class_school_id: cls.class_school_id,
        class_name: cls.class_name,
        class_slug: cls.class_slug,
        class_start_date: cls.class_start_date ?? null,
        class_end_date: cls.class_end_date ?? null,
        class_registration_opens_at: cls.class_registration_opens_at ?? null,
        class_registration_closes_at: cls.class_registration_closes_at ?? null,
        class_quota_taken: cls.class_quota_taken ?? null,
        class_delivery_mode: cls.class_delivery_mode ?? "offline",
        class_status: cls.class_status,
        class_image_url: cls.class_image_url ?? null,
        class_parent_name_snapshot: cls.class_class_parent_name_cache ?? null,
        class_parent_slug_snapshot: cls.class_class_parent_slug_cache ?? null,
        class_parent_level_snapshot: cls.class_class_parent_level_cache ?? null,
      }));

      const class_sections: TermClassSection[] = rawSections.map((sec) => ({
        class_section_id: sec.class_section_id,
        class_section_school_id: sec.class_section_school_id,
        class_section_slug: sec.class_section_slug,
        class_section_name: sec.class_section_name,
        class_section_code: sec.class_section_code ?? null,
        // pakai total_students_active sebagai total siswa tampilan
        class_section_total_students:
          sec.class_section_total_students_active ?? 0,
        class_section_image_url: sec.class_section_image_url ?? null,
        class_section_class_id: sec.class_section_class_id,
        class_section_class_name_snapshot: sec.class_section_class_name_cache,
        class_section_class_slug_snapshot: sec.class_section_class_slug_cache,
        class_section_class_parent_name_snapshot:
          sec.class_section_class_parent_name_cache,
        class_section_class_parent_slug_snapshot:
          sec.class_section_class_parent_slug_cache,
        class_section_class_parent_level_snapshot:
          sec.class_section_class_parent_level_cache,
        class_section_subject_teachers_enrollment_mode:
          sec.class_section_subject_teachers_enrollment_mode,
        class_section_subject_teachers_self_select_requires_approval:
          sec.class_section_subject_teachers_self_select_requires_approval,
        class_section_is_active: sec.class_section_is_active,
      }));

      return {
        term,
        classes,
        class_sections,
      };
    },
  });
}

/* ===================== Page ===================== */
export default function SchoolAcademicDetail() {
  const { id: termId } = useParams<{ id: string }>();
  const navigate = useNavigate();


  const { setHeader } = useDashboardHeader();

  const { data: bundle, isLoading } = useAcademicTermDetail(termId);
  const term = bundle?.term ?? null;
  const classes = bundle?.classes ?? [];
  const sections = bundle?.class_sections ?? [];

  useEffect(() => {
    if (!term) return;

    const schoolId = term.academic_term_school_id;

    setHeader({
      title: "Detail Akademik",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Akademik" },
        {
          label: "Tahun Akademik",
          href: `/${schoolId}/sekolah/akademik/tahun-akademik`,
        },
        { label: "Detail" },
      ],
      showBack: true,
    });
  }, [term, setHeader]);

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

  const [confirmDelete, setConfirmDelete] = useState(false);

  const totalSections = sections.length;
  const totalActiveSections = sections.filter(
    (s) => s.class_section_is_active
  ).length;

  return (
    <div className="w-full bg-background text-foreground">
      {/* Dialog Edit (hanya jika sudah ada term) */}


      {/* Konfirmasi Hapus */}
      <CDeleteDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => deleteMut.mutate()}
        loading={deleteMut.isPending}
      />


      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="md:flex hidden items-center gap-3">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
              </Button>
              <h1 className="font-semibold text-lg md:text-xl">
                Detail akademik
              </h1>
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
                        status={
                          term.academic_term_is_active ? "active" : "inactive"
                        }
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

                <div className="px-5 pb-5">
                  <CActionsButton
                    onEdit={() =>
                      navigate(
                        `/${term.academic_term_school_id}/sekolah/akademik/tahun-akademik/edit/${term.academic_term_id}`,
                        { state: { term } }
                      )
                    }
                    onDelete={() => setConfirmDelete(true)}
                    loadingDelete={deleteMut.isPending}
                  />
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
                            status={
                              cls.class_status === "active"
                                ? "active"
                                : "inactive"
                            }
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
                            status={
                              sec.class_section_is_active
                                ? "active"
                                : "inactive"
                            }
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
