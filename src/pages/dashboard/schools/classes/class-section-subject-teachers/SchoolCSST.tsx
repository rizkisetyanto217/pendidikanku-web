// src/pages/dashboard/school/classes/class-list/section/SchoolSCSST.tsx
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios, { getActiveschoolId } from "@/lib/axios";
import { ArrowLeft, BookOpen, Layers, Users, Hash, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import { useCurrentUser } from "@/hooks/useCurrentUser";

/* ========= Types dari API baru ========= */

type DeliveryMode = "offline" | "online" | "hybrid";

type ApiTeacherSnapshot = {
  id?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  title_prefix?: string | null;
  title_suffix?: string | null;
  whatsapp_url?: string | null;
};

type ApiBookSnapshot = {
  id?: string | null;
  slug?: string | null;
  title?: string | null;
  author?: string | null;
  image_url?: string | null;
};

type ApiSubjectSnapshot = {
  id?: string | null;
  url?: string | null;
  code?: string | null;
  name?: string | null;
  slug?: string | null;
};

type ApiClassSubjectBookSnapshot = {
  book?: ApiBookSnapshot | null;
  subject?: ApiSubjectSnapshot | null;
};

type ApiCSSTItem = {
  class_section_subject_teacher_id: string;
  class_section_subject_teacher_school_id: string;
  class_section_subject_teacher_slug: string;
  class_section_subject_teacher_total_attendance: number;
  class_section_subject_teacher_enrolled_count: number;
  class_section_subject_teacher_delivery_mode: DeliveryMode;
  class_section_subject_teacher_class_section_id: string;
  class_section_subject_teacher_class_section_slug_snapshot: string;
  class_section_subject_teacher_class_section_name_snapshot: string;
  class_section_subject_teacher_class_section_code_snapshot: string;
  class_section_subject_teacher_school_teacher_id: string;
  class_section_subject_teacher_school_teacher_snapshot?: ApiTeacherSnapshot | null;
  class_section_subject_teacher_school_teacher_name_snapshot?: string | null;
  class_section_subject_teacher_class_subject_book_id: string | null;
  class_section_subject_teacher_class_subject_book_snapshot?: ApiClassSubjectBookSnapshot | null;
  class_section_subject_teacher_book_title_snapshot?: string | null;
  class_section_subject_teacher_book_author_snapshot?: string | null;
  class_section_subject_teacher_book_slug_snapshot?: string | null;
  class_section_subject_teacher_book_image_url_snapshot?: string | null;
  class_section_subject_teacher_subject_name_snapshot?: string | null;
  class_section_subject_teacher_subject_code_snapshot?: string | null;
  class_section_subject_teacher_subject_slug_snapshot?: string | null;
  class_section_subject_teacher_is_active: boolean;
  class_section_subject_teacher_created_at: string;
  class_section_subject_teacher_updated_at: string;
  class_section_subject_teacher_deleted_at?: string | null;
};

type ApiCSSTListResponse = {
  success: boolean;
  message: string;
  data: ApiCSSTItem[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
    count: number;
    per_page_options: number[];
  };
};

type GroupedSection = {
  sectionId: string;
  sectionName: string;
  sectionSlug?: string;
  sectionCode?: string;
  items: ApiCSSTItem[];
};

/* ========= Query: ambil semua CSST (per sekolah via JWT) ========= */

function useCSSTList() {
  return useQuery({
    queryKey: ["csst-list"],
    queryFn: async () => {
      const res = await axios.get<ApiCSSTListResponse>(
        "/u/class-section-subject-teachers/list",
        {
          params: {
            // bisa tambahin is_active, per_page, dll kalau perlu
          },
        }
      );
      return res.data?.data ?? [];
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

/* =========================================================
   PAGE: Pelajaran & Pengajar (semua section)
========================================================= */

type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function SchoolCSST({ showBack = false, backTo }: Props) {
  const navigate = useNavigate();
  const { setHeader } = useDashboardHeader();

  // Ambil school_id dari token (membership) → fallback cookie UI
  const currentUserQ = useCurrentUser();
  const activeMembership = currentUserQ.data?.membership ?? null;
  const schoolIdFromMembership = activeMembership?.school_id ?? null;
  const schoolId = schoolIdFromMembership || getActiveschoolId() || null;

  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  const csstQ = useCSSTList();
  const rows = csstQ.data ?? [];

  const groupedBySection: GroupedSection[] = useMemo(() => {
    const map = new Map<string, GroupedSection>();

    rows.forEach((row) => {
      const secId = row.class_section_subject_teacher_class_section_id;
      if (!map.has(secId)) {
        map.set(secId, {
          sectionId: secId,
          sectionName:
            row.class_section_subject_teacher_class_section_name_snapshot ||
            "Section tanpa nama",
          sectionSlug:
            row.class_section_subject_teacher_class_section_slug_snapshot ||
            undefined,
          sectionCode:
            row.class_section_subject_teacher_class_section_code_snapshot ||
            undefined,
          items: [],
        });
      }
      map.get(secId)!.items.push(row);
    });

    return Array.from(map.values()).sort((a, b) =>
      a.sectionName.localeCompare(b.sectionName)
    );
  }, [rows]);

  useEffect(() => {
    setHeader({
      title: "Pelajaran & Pengajar Kelas",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas" },
        { label: "Pelajaran" },
      ],
      showBack,
    });
  }, [setHeader, navigate]);

  if (csstQ.isLoading) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
        <div className="text-muted-foreground">Memuat data pelajaran…</div>
      </div>
    );
  }

  if (csstQ.isError) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center gap-4">
        <div className="text-muted-foreground">
          Gagal memuat data pelajaran & pengajar.
        </div>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2" size={16} />
          Kembali
        </Button>
      </div>
    );
  }

  const totalSubjects = rows.length;

  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <main className="mx-auto flex flex-col gap-4 lg:gap-6">
        {/* Header dalam page */}
        <div className="md:flex hidden gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && (
              <Button
                onClick={handleBack}
                variant="ghost"
                size="icon"
                className="cursor-pointer"
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            <div>
              <h1 className="text-lg font-semibold md:text-xl">
                Pelajaran & Pengajar Kelas
              </h1>
              <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                Ringkasan mata pelajaran yang terhubung dengan masing-masing
                kelas/section beserta pengajarnya.
              </p>
            </div>
          </div>

          {/* Tombol tambah (fallback, biar ada juga di header dalam page) */}
          <Button size="sm" className="gap-1" onClick={() => navigate("new")}>
            <Plus size={14} /> Tambah
          </Button>
        </div>

        {/* Ringkasan singkat */}
        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-primary">
                <Layers className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Ringkasan Pelajaran
                </span>
              </div>
              {/* Tombol tambah di mobile */}
              <Button
                size="sm"
                className="gap-1 md:hidden"
                onClick={() => navigate("new")}
              >
                <Plus size={14} /> Tambah
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border bg-muted/40 px-4 py-3">
              <p className="text-xs text-muted-foreground">Jumlah Section</p>
              <p className="mt-1 text-xl font-semibold">
                {groupedBySection.length}
              </p>
              <p className="text-xs text-muted-foreground">kelas aktif</p>
            </div>
            <div className="rounded-xl border bg-muted/40 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Total Mata Pelajaran
              </p>
              <p className="mt-1 text-xl font-semibold">{totalSubjects}</p>
              <p className="text-xs text-muted-foreground">
                mapel terhubung dengan kelas
              </p>
            </div>
            <div className="rounded-xl border bg-muted/40 px-4 py-3">
              <p className="text-xs text-muted-foreground">Sekolah (context)</p>
              <p className="mt-1 text-sm font-semibold truncate">
                {schoolId ?? "Dari token aktif"}
              </p>
              <p className="text-xs text-muted-foreground">
                di-resolve dari JWT / school aktif
              </p>
            </div>
          </CardContent>
        </Card>

        {/* List grouped per section */}
        {groupedBySection.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-sm text-muted-foreground space-y-3">
              <div>
                Belum ada pelajaran yang terhubung dengan kelas / section.
              </div>
              <Button
                size="sm"
                className="gap-1"
                onClick={() => navigate("new")}
              >
                <Plus size={14} /> Tambah Pelajaran
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-5">
            {groupedBySection.map((sec) => (
              <Card
                key={sec.sectionId}
                className="border-border/70 bg-card/80 shadow-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base font-semibold md:text-lg">
                          {sec.sectionName}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="border-primary/40 text-[11px] font-normal"
                        >
                          {sec.items.length} mapel
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                        <span>
                          Kode:{" "}
                          <span className="font-medium">
                            {sec.sectionCode ?? "-"}
                          </span>
                        </span>
                        <span>
                          Slug:{" "}
                          <span className="font-mono">
                            {sec.sectionSlug ?? "-"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* grid mapel per section */}
                  <div className="grid gap-3 md:grid-cols-2">
                    {sec.items.map((row) => {
                      const teacher =
                        row.class_section_subject_teacher_school_teacher_snapshot;
                      const csBook =
                        row.class_section_subject_teacher_class_subject_book_snapshot;
                      const subj = csBook?.subject;
                      const book = csBook?.book;

                      const teacherDisplay = teacher
                        ? `${teacher.title_prefix ?? ""} ${teacher.name ?? ""
                          } ${teacher.title_suffix ?? ""}`
                          .replace(/\s+/g, " ")
                          .trim()
                        : row.class_section_subject_teacher_school_teacher_name_snapshot ??
                        "-";

                      return (
                        <div
                          key={row.class_section_subject_teacher_id}
                          className="flex h-full flex-col rounded-xl border bg-muted/40 px-3 py-3 text-sm cursor-pointer transition hover:shadow-md"
                          onClick={() =>
                            navigate(`${row.class_section_subject_teacher_id}`)
                          }
                          aria-label={`Detail mapel ${row.class_section_subject_teacher_subject_name_snapshot ??
                            subj?.name ??
                            "Mata pelajaran"
                            }`}
                        >
                          {/* header mapel */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Hash className="h-3 w-3" />
                                <span>
                                  {row.class_section_subject_teacher_subject_code_snapshot ??
                                    subj?.code ??
                                    "-"}
                                </span>
                              </div>
                              <div className="mt-0.5 font-semibold leading-snug">
                                {subj?.name ??
                                  row.class_section_subject_teacher_subject_name_snapshot ??
                                  "Mata pelajaran tanpa nama"}
                              </div>
                            </div>
                            <Badge
                              variant={
                                row.class_section_subject_teacher_is_active
                                  ? "default"
                                  : "outline"
                              }
                              className={`ml-1 text-[10px] ${row.class_section_subject_teacher_is_active
                                ? "bg-emerald-600"
                                : ""
                                }`}
                            >
                              {row.class_section_subject_teacher_is_active
                                ? "Aktif"
                                : "Nonaktif"}
                            </Badge>
                          </div>

                          {/* meta info */}
                          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>
                                Pengajar:{" "}
                                <span className="font-medium text-foreground">
                                  {teacherDisplay || "-"}
                                </span>
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span>
                                Mode:{" "}
                                <span className="font-medium text-foreground">
                                  {row.class_section_subject_teacher_delivery_mode ??
                                    "-"}
                                </span>
                              </span>
                              <span className="h-[3px] w-[3px] rounded-full bg-muted-foreground/60" />
                              <span>
                                Kehadiran:{" "}
                                {row.class_section_subject_teacher_total_attendance ??
                                  0}
                              </span>
                              <span className="h-[3px] w-[3px] rounded-full bg-muted-foreground/60" />
                              <span>
                                Terdaftar:{" "}
                                {row.class_section_subject_teacher_enrolled_count ??
                                  0}{" "}
                                siswa
                              </span>
                            </div>
                          </div>

                          {/* book */}
                          {book && (
                            <div className="mt-3 flex items-center gap-3 rounded-lg border bg-background/60 p-2 text-xs text-muted-foreground">
                              {(book.image_url ||
                                row.class_section_subject_teacher_book_image_url_snapshot) && (
                                  <img
                                    src={
                                      book.image_url ??
                                      row.class_section_subject_teacher_book_image_url_snapshot ??
                                      ""
                                    }
                                    alt={
                                      book.title ??
                                      row.class_section_subject_teacher_book_title_snapshot ??
                                      "Book cover"
                                    }
                                    className="h-14 w-10 rounded-md border object-cover"
                                  />
                                )}
                              <div className="space-y-1">
                                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                  Buku yang digunakan
                                </div>
                                <div className="text-sm font-medium text-foreground">
                                  {book.title ??
                                    row.class_section_subject_teacher_book_title_snapshot ??
                                    "-"}
                                </div>
                                <div>
                                  Penulis:{" "}
                                  {book.author ??
                                    row.class_section_subject_teacher_book_author_snapshot ??
                                    "-"}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
