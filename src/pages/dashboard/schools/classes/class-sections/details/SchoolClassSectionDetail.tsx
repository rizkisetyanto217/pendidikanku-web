// src/pages/dashboard/school/class/SchoolClassSectionDetail.tsx
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* icons */
import {
  Users,
  BookOpen,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Loader2,
} from "lucide-react";

/* dashboard header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import type { AxiosError } from "axios";

/* ========= Types dari API /u/class-section-subject-teachers/list ========= */

type TeacherSnapshot = {
  id?: string;
  name?: string;
  avatar_url?: string;
  title_prefix?: string;
  title_suffix?: string;
  whatsapp_url?: string;
};

type BookSnapshot = {
  id?: string;
  slug?: string;
  title?: string;
  author?: string;
  image_url?: string;
};

type SubjectSnapshot = {
  id?: string;
  url?: string | null;
  code?: string;
  name?: string;
  slug?: string;
};

type ClassSubjectBookSnapshot = {
  book?: BookSnapshot | null;
  subject?: SubjectSnapshot | null;
};

type ApiCSST = {
  class_section_subject_teacher_id: string;
  class_section_subject_teacher_school_id: string;
  class_section_subject_teacher_slug: string;
  class_section_subject_teacher_total_attendance: number;
  class_section_subject_teacher_enrolled_count: number;
  class_section_subject_teacher_delivery_mode:
  | "online"
  | "offline"
  | "hybrid"
  | string;
  class_section_subject_teacher_class_section_id: string;
  class_section_subject_teacher_class_section_slug_snapshot: string;
  class_section_subject_teacher_class_section_name_snapshot: string;
  class_section_subject_teacher_class_section_code_snapshot: string;

  class_section_subject_teacher_school_teacher_id: string;
  class_section_subject_teacher_school_teacher_snapshot?: TeacherSnapshot | null;
  class_section_subject_teacher_school_teacher_name_snapshot?: string | null;

  class_section_subject_teacher_class_subject_book_id?: string | null;
  class_section_subject_teacher_class_subject_book_snapshot?: ClassSubjectBookSnapshot | null;

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
  class_section_subject_teacher_deleted_at: string | null;
};

type CsstListResp = {
  data: ApiCSST[];
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

/* View model rombel (diambil dari snapshot baris pertama) */
type SectionView = {
  sectionId: string;
  sectionName: string;
  sectionSlug: string;
  sectionCode: string;
};

/* View model kartu CSST per mapel */
type CsstCard = {
  id: string;
  subjectName: string;
  subjectCode?: string | null;
  subjectSlug?: string | null;
  teacherName: string;
  teacherTitle?: string;
  deliveryMode: string;
  enrolledCount: number;
  totalAttendance: number;
  bookTitle?: string | null;
  bookAuthor?: string | null;
  bookImageUrl?: string | null;
  isActive: boolean;
};

/* ========== Utils kecil ========== */

const extractErrorMessage = (err: unknown): string => {
  const ax = err as AxiosError<any>;
  const msgFromResp =
    ax?.response?.data?.message ||
    ax?.response?.data?.error ||
    ax?.response?.statusText;
  if (msgFromResp) return String(msgFromResp);
  if (ax?.message) return ax.message;
  return "Terjadi kesalahan saat memuat data.";
};

const formatDeliveryMode = (m: string | undefined) => {
  if (!m) return "-";
  switch (m) {
    case "offline":
      return "Offline";
    case "online":
      return "Online";
    case "hybrid":
      return "Hybrid";
    default:
      return m.replace(/_/g, " ");
  }
};

/* ========== Page ========== */

const SchoolClassSectionDetail: React.FC = () => {
  const navigate = useNavigate();
  const { schoolId, classSectionId } = useParams<{
    schoolId: string;
    classSectionId: string;
  }>();

  const { setHeader } = useDashboardHeader();

  /* ===== Fetch CSST list untuk 1 class_section_id ===== */
  const csstQ = useQuery<CsstListResp, AxiosError>({
    queryKey: ["csst-by-section", classSectionId],
    enabled: !!classSectionId,
    queryFn: async () => {
      const res = await axios.get<CsstListResp>(
        "/u/class-section-subject-teachers/list",
        {
          params: {
            class_section_id: classSectionId,
            page: 1,
            per_page: 100,
          },
        }
      );
      return res.data;
    },
    staleTime: 60_000,
  });

  const items: ApiCSST[] = csstQ.data?.data ?? [];

  /* ===== Ambil info rombel dari snapshot baris pertama ===== */
  const sectionView: SectionView | null = useMemo(() => {
    if (!items.length) return null;
    const first = items[0];
    return {
      sectionId: first.class_section_subject_teacher_class_section_id,
      sectionName:
        first.class_section_subject_teacher_class_section_name_snapshot,
      sectionSlug:
        first.class_section_subject_teacher_class_section_slug_snapshot,
      sectionCode:
        first.class_section_subject_teacher_class_section_code_snapshot,
    };
  }, [items]);

  /* ===== Set header top bar dashboard ===== */
  useEffect(() => {
    if (!sectionView) return;
    setHeader({
      title: `Rombel: ${sectionView.sectionName}`,
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas" },
        {
          label: "Data Kelas",
          href: `/${schoolId}/sekolah/kelas`,
        },
        { label: "Detail Rombel" },
      ],
      actions: null,
    });
  }, [sectionView, schoolId, setHeader]);

  /* ===== Map ke view model CSST ===== */
  const csstCards: CsstCard[] = useMemo(() => {
    return items.map((it) => {
      // teacher
      const teacherSnap =
        it.class_section_subject_teacher_school_teacher_snapshot;
      const teacherName =
        it.class_section_subject_teacher_school_teacher_name_snapshot ||
        teacherSnap?.name ||
        "-";

      const titlePrefix = teacherSnap?.title_prefix;
      const titleSuffix = teacherSnap?.title_suffix;
      const teacherTitle = [titlePrefix, titleSuffix].filter(Boolean).join(" ");

      // subject
      const subjName =
        it.class_section_subject_teacher_subject_name_snapshot ||
        it.class_section_subject_teacher_class_subject_book_snapshot?.subject
          ?.name ||
        "-";

      const subjCode =
        it.class_section_subject_teacher_subject_code_snapshot ||
        it.class_section_subject_teacher_class_subject_book_snapshot?.subject
          ?.code ||
        null;

      const subjSlug =
        it.class_section_subject_teacher_subject_slug_snapshot ||
        it.class_section_subject_teacher_class_subject_book_snapshot?.subject
          ?.slug ||
        null;

      // book
      const bookTitle =
        it.class_section_subject_teacher_book_title_snapshot ||
        it.class_section_subject_teacher_class_subject_book_snapshot?.book
          ?.title ||
        null;
      const bookAuthor =
        it.class_section_subject_teacher_book_author_snapshot ||
        it.class_section_subject_teacher_class_subject_book_snapshot?.book
          ?.author ||
        null;
      const bookImageUrl =
        it.class_section_subject_teacher_book_image_url_snapshot ||
        it.class_section_subject_teacher_class_subject_book_snapshot?.book
          ?.image_url ||
        null;

      return {
        id: it.class_section_subject_teacher_id,
        subjectName: subjName,
        subjectCode: subjCode,
        subjectSlug: subjSlug,
        teacherName,
        teacherTitle: teacherTitle || undefined,
        deliveryMode: it.class_section_subject_teacher_delivery_mode,
        enrolledCount: it.class_section_subject_teacher_enrolled_count,
        totalAttendance: it.class_section_subject_teacher_total_attendance,
        bookTitle,
        bookAuthor,
        bookImageUrl,
        isActive: it.class_section_subject_teacher_is_active,
      };
    });
  }, [items]);

  /* ===== Stats kecil ===== */
  const totalCsst = csstCards.length;
  const activeCount = csstCards.filter((x) => x.isActive).length;
  const totalEnrolled = csstCards.reduce(
    (acc, r) => acc + (r.enrolledCount || 0),
    0
  );
  const offlineCount = csstCards.filter(
    (r) => r.deliveryMode === "offline"
  ).length;
  const onlineCount = csstCards.filter(
    (r) => r.deliveryMode === "online"
  ).length;
  const hybridCount = csstCards.filter(
    (r) => r.deliveryMode === "hybrid"
  ).length;

  /* ===== Error string biar TS nggak rewel ===== */
  const csstError: string | null = csstQ.isError
    ? extractErrorMessage(csstQ.error)
    : null;

  /* ===== Loading / error state global ===== */
  if (csstQ.isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="animate-spin" /> Memuat detail rombel & mapel…
      </div>
    );
  }

  if (csstError || !sectionView) {
    const msg = csstError ?? "Data rombel atau daftar CSST tidak ditemukan.";
    return (
      <div className="p-6 space-y-3">
        <div className="text-destructive text-sm">
          Gagal memuat detail rombel.
        </div>
        <div className="text-xs text-muted-foreground break-all">{msg}</div>
        <Button
          variant="outline"
          onClick={() => navigate(`/${schoolId}/sekolah/kelas`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke daftar kelas
        </Button>
      </div>
    );
  }

  /* ===== Render utama ===== */

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6">
          {/* Top bar */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">
              Rombel: {sectionView.sectionName}
            </h1>
          </div>

          {/* Header rombel */}
          <Card>
            <CardContent className="p-4 md:p-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="text-lg md:text-xl font-semibold">
                  {sectionView.sectionName}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">
                    Kode: {sectionView.sectionCode}
                  </Badge>
                  <span>
                    Slug:{" "}
                    <span className="font-mono">{sectionView.sectionSlug}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Tombol contoh, nanti bisa diarahkan ke halaman murid/absensi rombel */}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate("students")}
                >
                  Lihat Siswa
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
                <Button size="sm" onClick={() => navigate("schedule")}>
                  Lihat Jadwal
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ===== Ringkasan CSST ===== */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Ringkasan Pengajar & Mapel (CSST)
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground">
                    Total Mapel (CSST)
                  </div>
                  <div className="text-xl font-semibold">{totalCsst}</div>
                </Card>

                <Card className="p-4">
                  <div className="text-xs text-muted-foreground">
                    CSST Aktif
                  </div>
                  <div className="text-xl font-semibold">
                    {activeCount}/{totalCsst}
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="text-xs text-muted-foreground">
                    Total Siswa Terdaftar
                  </div>
                  <div className="text-xl font-semibold tabular-nums">
                    {totalEnrolled}
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="text-xs text-muted-foreground">
                    Mode Perkuliahan
                  </div>
                  <div className="mt-1 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Offline</span>
                      <span className="tabular-nums">{offlineCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Online</span>
                      <span className="tabular-nums">{onlineCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Hybrid</span>
                      <span className="tabular-nums">{hybridCount}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* ===== Daftar CSST per mapel ===== */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Daftar Mapel & Pengajar di Rombel Ini
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-4">
              {csstCards.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Belum ada CSST terdaftar untuk rombel ini.
                </div>
              ) : (
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  {csstCards.map((m) => (
                    <Card
                      key={m.id}
                      className={`p-4 transition ${m.isActive ? "ring-1 ring-primary/30" : ""
                        } hover:shadow-md`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {m.subjectName}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {m.subjectCode && (
                              <>
                                Kode:{" "}
                                <span className="font-mono">
                                  {m.subjectCode}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground truncate">
                            Guru:{" "}
                            {m.teacherTitle
                              ? `${m.teacherTitle} ${m.teacherName}`
                              : m.teacherName}
                          </div>
                        </div>
                        <Badge
                          variant={m.isActive ? "default" : "outline"}
                          className="text-[10px]"
                        >
                          {m.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </div>

                      {/* Book info */}
                      {m.bookTitle && (
                        <div className="mt-2 flex items-start gap-2 text-xs">
                          {m.bookImageUrl && (
                            <div className="h-10 w-7 rounded overflow-hidden bg-muted shrink-0">
                              <img
                                src={m.bookImageUrl}
                                alt={m.bookTitle}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div className="space-y-0.5">
                            <div className="font-medium">{m.bookTitle}</div>
                            {m.bookAuthor && (
                              <div className="text-[11px] text-muted-foreground">
                                {m.bookAuthor}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Stats bawah */}
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span className="tabular-nums">
                            {m.enrolledCount} siswa
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3" />
                          <span className="tabular-nums">
                            {m.totalAttendance} pertemuan
                          </span>
                        </div>
                      </div>

                      {/* Mode & dummy lokasi (kalau nanti mau dihubungin ke room) */}
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{formatDeliveryMode(m.deliveryMode)}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SchoolClassSectionDetail;
