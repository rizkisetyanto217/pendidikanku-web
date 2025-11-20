// src/pages/sekolahislamku/teacher/TeacherCSStDetail.tsx
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
  CalendarDays,
  BookOpen,
  ChevronRight,
  ArrowLeft,
  ClipboardList,
  UserSquare2,
} from "lucide-react";

/* dashboard header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import type { AxiosError } from "axios";

/* ========= Types dari API /u/class-section-subject-teachers/list ========= */

type DeliveryMode = "offline" | "online" | "hybrid" | string;

type ApiTeacherSnapshot = {
  id?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  title_prefix?: string | null;
  title_suffix?: string | null;
  whatsapp_url?: string | null;
};

type ApiRoomSnapshot = {
  name?: string | null;
  slug?: string | null;
  join_url?: string | null;
  platform?: string | null;
  is_virtual?: boolean | null;
};

type ApiCSSTItem = {
  class_section_subject_teacher_id: string;
  class_section_subject_teacher_school_id: string;
  class_section_subject_teacher_slug: string;

  class_section_subject_teacher_total_attendance: number;
  class_section_subject_teacher_enrolled_count: number;

  class_section_subject_teacher_total_assessments: number;
  class_section_subject_teacher_total_assessments_graded: number;
  class_section_subject_teacher_total_assessments_ungraded: number;
  class_section_subject_teacher_total_students_passed: number;

  class_section_subject_teacher_delivery_mode: DeliveryMode;

  class_section_subject_teacher_class_section_id: string;
  class_section_subject_teacher_class_section_slug_snapshot: string;
  class_section_subject_teacher_class_section_name_snapshot: string;
  class_section_subject_teacher_class_section_code_snapshot: string;

  class_section_subject_teacher_class_room_id: string | null;
  class_section_subject_teacher_class_room_slug_snapshot: string | null;
  class_section_subject_teacher_class_room_snapshot?: ApiRoomSnapshot | null;
  class_section_subject_teacher_class_room_name_snapshot?: string | null;
  class_section_subject_teacher_class_room_slug_snapshot_gen?: string | null;

  class_section_subject_teacher_school_teacher_id: string;
  class_section_subject_teacher_school_teacher_snapshot?: ApiTeacherSnapshot | null;
  class_section_subject_teacher_school_teacher_name_snapshot?: string | null;

  class_section_subject_teacher_total_books: number;

  class_section_subject_teacher_class_subject_id: string | null;
  class_section_subject_teacher_subject_id_snapshot?: string | null;
  class_section_subject_teacher_subject_name_snapshot?: string | null;
  class_section_subject_teacher_subject_code_snapshot?: string | null;
  class_section_subject_teacher_subject_slug_snapshot?: string | null;

  class_section_subject_teacher_min_passing_score?: number | null;

  class_section_subject_teacher_is_active: boolean;
  class_section_subject_teacher_created_at: string;
  class_section_subject_teacher_updated_at: string;
  class_section_subject_teacher_deleted_at?: string | null;
};

type ApiCSSTDetailResponse = {
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

/* View model kecil untuk header */
type SectionView = {
  sectionId: string;
  sectionName: string;
  sectionSlug: string;
  sectionCode: string;
};

type RoomView = {
  roomId?: string | null;
  roomName?: string | null;
  roomSlug?: string | null;
  joinUrl?: string | null;
  platform?: string | null;
  isVirtual?: boolean | null;
};

type CsstView = {
  id: string;
  slug: string;
  subjectName: string;
  subjectCode?: string | null;
  subjectSlug?: string | null;

  teacherName: string;
  teacherTitle?: string;

  deliveryMode: DeliveryMode;
  isActive: boolean;

  enrolledCount: number;
  totalAttendance: number;

  totalAssessments: number;
  totalAssessmentsGraded: number;
  totalAssessmentsUngraded: number;
  totalStudentsPassed: number;
  minPassingScore?: number | null;

  totalBooks: number;
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

const formatDeliveryMode = (m: DeliveryMode | undefined) => {
  if (!m) return "-";
  switch (m) {
    case "offline":
      return "Offline";
    case "online":
      return "Online";
    case "hybrid":
      return "Hybrid";
    default:
      return String(m).replace(/_/g, " ");
  }
};

/* ========== Page ========== */

const TeacherCSSTDetail: React.FC = () => {
  const { csstId, teacherId } = useParams<{
    csstId: string;
    teacherId?: string;
  }>();

  const navigate = useNavigate();
  const { setHeader } = useDashboardHeader();

  /* ===== Query detail CSST (pakai API terbaru) ===== */
  const csstQ = useQuery<ApiCSSTItem | undefined, AxiosError>({
    queryKey: ["teacher-csst-detail", csstId, teacherId],
    enabled: !!csstId,
    queryFn: async () => {
      const res = await axios.get<ApiCSSTDetailResponse>(
        "/u/class-section-subject-teachers/list",
        {
          params: {
            id: csstId,
            ...(teacherId ? { teacher_id: teacherId } : {}),
          },
        }
      );
      const items = res.data?.data ?? [];
      return items[0];
    },
    staleTime: 60_000,
  });

  const csstError: string | null = csstQ.isError
    ? extractErrorMessage(csstQ.error)
    : null;

  /* ===== Derive view models dari API ===== */
  const sectionView: SectionView | null = useMemo(() => {
    const it = csstQ.data;
    if (!it) return null;
    return {
      sectionId: it.class_section_subject_teacher_class_section_id,
      sectionName: it.class_section_subject_teacher_class_section_name_snapshot,
      sectionSlug: it.class_section_subject_teacher_class_section_slug_snapshot,
      sectionCode: it.class_section_subject_teacher_class_section_code_snapshot,
    };
  }, [csstQ.data]);

  const roomView: RoomView | null = useMemo(() => {
    const it = csstQ.data;
    if (!it) return null;

    const room = it.class_section_subject_teacher_class_room_snapshot;

    return {
      roomId: it.class_section_subject_teacher_class_room_id,
      roomName:
        it.class_section_subject_teacher_class_room_name_snapshot ||
        room?.name ||
        null,
      roomSlug:
        it.class_section_subject_teacher_class_room_slug_snapshot_gen ||
        it.class_section_subject_teacher_class_room_slug_snapshot ||
        room?.slug ||
        null,
      joinUrl: room?.join_url || null,
      platform: room?.platform || null,
      isVirtual: room?.is_virtual ?? null,
    };
  }, [csstQ.data]);

  const csstView: CsstView | null = useMemo(() => {
    const it = csstQ.data;
    if (!it) return null;

    const teacher = it.class_section_subject_teacher_school_teacher_snapshot;
    const teacherName =
      it.class_section_subject_teacher_school_teacher_name_snapshot ||
      teacher?.name ||
      "-";

    const teacherTitleParts = [
      teacher?.title_prefix ?? "",
      teacher?.title_suffix ?? "",
    ]
      .map((x) => x?.trim())
      .filter(Boolean);
    const teacherTitle =
      teacherTitleParts.length > 0 ? teacherTitleParts.join(" ") : undefined;

    const subjectName =
      it.class_section_subject_teacher_subject_name_snapshot ||
      "Mata pelajaran tanpa nama";

    const subjectCode =
      it.class_section_subject_teacher_subject_code_snapshot || null;

    const subjectSlug =
      it.class_section_subject_teacher_subject_slug_snapshot || null;

    return {
      id: it.class_section_subject_teacher_id,
      slug: it.class_section_subject_teacher_slug,
      subjectName,
      subjectCode,
      subjectSlug,
      teacherName,
      teacherTitle,
      deliveryMode: it.class_section_subject_teacher_delivery_mode,
      isActive: it.class_section_subject_teacher_is_active,
      enrolledCount: it.class_section_subject_teacher_enrolled_count,
      totalAttendance: it.class_section_subject_teacher_total_attendance,
      totalAssessments: it.class_section_subject_teacher_total_assessments,
      totalAssessmentsGraded:
        it.class_section_subject_teacher_total_assessments_graded,
      totalAssessmentsUngraded:
        it.class_section_subject_teacher_total_assessments_ungraded,
      totalStudentsPassed:
        it.class_section_subject_teacher_total_students_passed,
      minPassingScore: it.class_section_subject_teacher_min_passing_score,
      totalBooks: it.class_section_subject_teacher_total_books,
    };
  }, [csstQ.data]);

  /* ===== Set header dashboard ===== */
  useEffect(() => {
    if (!csstView) return;
    setHeader({
      title: `Detail Mapel`,
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Guru Mapel" },
        { label: csstView.subjectName },
      ],
      actions: null,
    });
  }, [csstView, setHeader]);

  /* ===== Loading & error ===== */
  if (csstQ.isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground gap-2">
        Memuat detail mapel…
      </div>
    );
  }

  if (csstError || !csstView || !sectionView) {
    const msg = csstError ?? "Data mapel tidak ditemukan.";
    return (
      <div className="p-6 space-y-3">
        <div className="text-destructive text-sm">
          Gagal memuat detail mapel.
        </div>
        <div className="text-xs text-muted-foreground break-all">{msg}</div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>
    );
  }

  /* ===== Render utama (semua sudah pure dari API) ===== */

  const totalStudents = csstView.enrolledCount ?? 0;
  const totalMeetings = csstView.totalAttendance ?? 0;
  const totalAttendance = csstView.totalAttendance ?? 0;
  const totalBooks = csstView.totalBooks ?? 0;

  const totalAssessmentsGraded = csstView.totalAssessmentsGraded ?? 0;
  const totalAssessmentsUngraded = csstView.totalAssessmentsUngraded ?? 0;

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6 px-3 pb-10 pt-2 md:px-4">
          {/* Top bar */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Detail Mapel</h1>
          </div>

          {/* Header mapel */}
          <Card>
            <CardContent className="p-4 md:p-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="text-lg md:text-xl font-semibold">
                  {csstView.subjectName}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{sectionView.sectionName}</Badge>
                  <span>
                    Kode kelas:{" "}
                    <span className="font-mono">{sectionView.sectionCode}</span>
                  </span>
                  <span>•</span>
                  <span>
                    Guru:{" "}
                    <span className="font-medium">
                      {csstView.teacherTitle
                        ? `${csstView.teacherTitle} ${csstView.teacherName}`
                        : csstView.teacherName}
                    </span>
                  </span>
                </div>

                <div className="mt-1 text-xs text-muted-foreground flex flex-wrap gap-3">
                  <span>
                    Slug CSST:{" "}
                    <span className="font-mono">{csstView.slug}</span>
                  </span>
                  {csstView.subjectSlug && (
                    <span>
                      Slug mapel:{" "}
                      <span className="font-mono">{csstView.subjectSlug}</span>
                    </span>
                  )}
                  <span>
                    Section slug:{" "}
                    <span className="font-mono">{sectionView.sectionSlug}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                <Badge
                  variant={csstView.isActive ? "default" : "outline"}
                  className="text-[11px]"
                >
                  {csstView.isActive ? "Aktif" : "Nonaktif"}
                </Badge>
                <Badge variant="outline" className="text-[11px]">
                  {formatDeliveryMode(csstView.deliveryMode)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick links */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {/* Profil Murid */}
            <Card
              className="cursor-pointer transition hover:shadow-md"
              onClick={() => navigate("murid")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Profil Murid</span>
                  </div>
                  <div className="text-xl font-semibold">{totalStudents}</div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            {/* Absensii Murid */}
            <Card
              className="cursor-pointer transition hover:shadow-md"
              onClick={() => navigate("absensi")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Absensi Murid</span>
                  </div>
                  <div className="text-xl font-semibold">{totalStudents}</div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            {/* Target Pertemuan */}
            <Card
              className="cursor-pointer transition hover:shadow-md"
              onClick={() => navigate("pertemuan")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Target Pertemuan</span>
                  </div>
                  <div className="text-xl font-semibold"> {totalMeetings}</div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            {/* Rekap Kehadiran */}
            <Card
              className="cursor-pointer transition hover:shadow-md"
              onClick={() => navigate("kehadiran")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>Laporan Harian</span>
                  </div>
                  <div className="text-xl font-semibold">{totalAttendance}</div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            {/* Materi */}
            <Card
              className="cursor-pointer transition hover:shadow-md"
              onClick={() => navigate("materi")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Materi</span>
                  </div>
                  <div className="text-xl font-semibold">
                    {csstView.totalBooks}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            {/* Latihan */}
            <Card
              className="cursor-pointer transition hover:shadow-md"
              onClick={() => navigate("tugas")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    <span>Latihan</span>
                  </div>
                  <div className="text-xl font-semibold">
                    {totalAssessmentsUngraded}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            {/* Ujian */}
            <Card
              className="cursor-pointer transition hover:shadow-md"
              onClick={() => navigate("ujian")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    <span>Ujian</span>
                  </div>
                  <div className="text-xl font-semibold">
                    {totalAssessmentsGraded}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            {/* Buku*/}
            <Card
              className="cursor-pointer transition hover:shadow-md"
              onClick={() => navigate("buku")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    <span>Buku</span>
                  </div>
                  <div className="text-xl font-semibold">{totalBooks}</div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            {/* Profil Mapel */}
            <Card
              className="cursor-pointer transition hover:shadow-md"
              onClick={() => navigate("kelola-kelas")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <UserSquare2 className="h-4 w-4" />
                    <span>Profil Mapel</span>
                  </div>
                  <div className="text-xl font-semibold">Detail</div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>

          {/* Ruang / Platform Kelas */}
          {roomView && (roomView.roomName || roomView.joinUrl) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Ruang Kelas / Platform
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="p-4 text-sm">
                <div className="space-y-1">
                  <div className="font-medium">
                    {roomView.roomName ?? "Ruang tanpa nama"}
                  </div>
                  {roomView.platform && (
                    <div className="text-xs text-muted-foreground">
                      Platform: {roomView.platform}
                      {roomView.isVirtual ? " (virtual)" : ""}
                    </div>
                  )}
                  {roomView.joinUrl && (
                    <div className="mt-1">
                      <a
                        href={roomView.joinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium underline underline-offset-2"
                      >
                        Buka link pertemuan
                      </a>
                    </div>
                  )}
                  {roomView.roomSlug && (
                    <div className="text-xs text-muted-foreground">
                      Slug ruang:{" "}
                      <span className="font-mono">{roomView.roomSlug}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherCSSTDetail;