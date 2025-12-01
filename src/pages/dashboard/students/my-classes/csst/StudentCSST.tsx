// src/pages/sekolahislamku/pages/student/StudentCSSTDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

/* icons */
import {
  Users,
  CalendarDays,
  BookOpen,
  ChevronRight,
  ArrowLeft,
  ClipboardList,
  UserSquare2,
  MapPin,
} from "lucide-react";

/* dashboard header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import type { AxiosError } from "axios";
import CBadgeStatus from "@/components/costum/common/CBadgeStatus";

/* ========= Types dari API /u/class-section-subject-teachers/list ========= */

type DeliveryMode = "offline" | "online" | "hybrid" | string;

// sesuai response contoh yang kamu kirim
type ApiCSSTItem = {
  class_section_subject_teacher_id: string;
  class_section_subject_teacher_school_id: string;
  class_section_subject_teacher_class_section_id: string;
  class_section_subject_teacher_class_subject_id: string;
  class_section_subject_teacher_school_teacher_id: string;
  class_section_subject_teacher_slug: string;

  class_section_subject_teacher_total_attendance?: number | null;
  class_section_subject_teacher_enrolled_count?: number | null;
  class_section_subject_teacher_total_assessments?: number | null;
  class_section_subject_teacher_total_assessments_graded?: number | null;
  class_section_subject_teacher_total_assessments_ungraded?: number | null;
  class_section_subject_teacher_total_students_passed?: number | null;

  class_section_subject_teacher_delivery_mode?: DeliveryMode | null;

  class_section_subject_teacher_total_books?: number | null;
  class_section_subject_teacher_total_students_male?: number | null;
  class_section_subject_teacher_total_students_female?: number | null;

  class_section_subject_teacher_class_section_slug_snapshot?: string | null;
  class_section_subject_teacher_class_section_name_snapshot?: string | null;
  class_section_subject_teacher_class_section_code_snapshot?: string | null;

  // optional snapshot guru (kalau backend kirim)
  class_section_subject_teacher_school_teacher_snapshot?: {
    id?: string;
    name?: string;
    avatar_url?: string;
    whatsapp_url?: string;
    title_prefix?: string;
    title_suffix?: string;
  } | null;

  class_section_subject_teacher_school_teacher_name_snapshot?: string | null;

  class_section_subject_teacher_subject_id_snapshot?: string | null;
  class_section_subject_teacher_subject_name_snapshot?: string | null;
  class_section_subject_teacher_subject_code_snapshot?: string | null;
  class_section_subject_teacher_subject_slug_snapshot?: string | null;

  class_section_subject_teacher_min_passing_score?: number | null;
  class_section_subject_teacher_is_active?: boolean | null;

  // ONLINE ROOM (kalau ada)
  class_section_subject_teacher_join_url?: string | null;
  class_section_subject_teacher_meeting_id?: string | null;
  class_section_subject_teacher_passcode?: string | null;

  // OFFLINE ROOM (kalau nanti kamu tambahkan di backend)
  class_section_subject_teacher_room_name_snapshot?: string | null;

  class_section_subject_teacher_created_at?: string | null;
  class_section_subject_teacher_updated_at?: string | null;
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

/* View model kecil untuk header */
type SectionView = {
  sectionId: string;
  sectionName: string;
  sectionSlug: string;
  sectionCode: string;
};

type CsstView = {
  id: string;
  slug: string;
  subjectName: string;
  subjectCode?: string | null;
  subjectSlug?: string | null;

  teacherName: string;

  deliveryMode: DeliveryMode;
  isActive: boolean;

  enrolledCount: number;
  minPassingScore?: number | null;

  roomName?: string | null;
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

const StudentCSST: React.FC = () => {
  const { csstId } = useParams<{ csstId: string }>();
  const navigate = useNavigate();
  const { setHeader } = useDashboardHeader();

  // State dummy laporan kehadiran
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [checkInLabel, setCheckInLabel] = useState<string | null>(null);
  const [checkInAt, setCheckInAt] = useState<Date | null>(null);

  const [attendanceReports, setAttendanceReports] = useState(0);
  const totalMeetingsDummy = 10;

  /* ===== Query detail CSST langsung dari /u/class-section-subject-teachers/list ===== */
  const csstQ = useQuery<ApiCSSTItem | null, AxiosError>({
    queryKey: ["student-csst-detail", csstId],
    enabled: !!csstId,
    queryFn: async () => {
      const res = await axios.get<ApiCSSTListResponse>(
        "/u/class-section-subject-teachers/list",
        {
          params: {
            id: csstId, // ✅ sesuai contoh: ?id=bc20fa79-...
          },
        }
      );

      const items = res.data?.data ?? [];
      return items[0] ?? null; // ✅ tidak pernah undefined
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
      sectionName:
        it.class_section_subject_teacher_class_section_name_snapshot ??
        "Rombel tanpa nama",
      sectionSlug:
        it.class_section_subject_teacher_class_section_slug_snapshot ?? "-",
      sectionCode:
        it.class_section_subject_teacher_class_section_code_snapshot ??
        "tanpa-kode",
    };
  }, [csstQ.data]);

  const csstView: CsstView | null = useMemo(() => {
    const it = csstQ.data;
    if (!it) return null;

    const subjectName =
      it.class_section_subject_teacher_subject_name_snapshot ??
      "Mata pelajaran tanpa nama";
    const subjectCode =
      it.class_section_subject_teacher_subject_code_snapshot ?? null;
    const subjectSlug =
      it.class_section_subject_teacher_subject_slug_snapshot ?? null;

    const teacherName =
      it.class_section_subject_teacher_school_teacher_name_snapshot ??
      "Guru tanpa nama";

    const deliveryMode = it.class_section_subject_teacher_delivery_mode ?? "-";
    const isActive = it.class_section_subject_teacher_is_active ?? true;

    const enrolledCount = it.class_section_subject_teacher_enrolled_count ?? 0;

    const minPassingScore =
      it.class_section_subject_teacher_min_passing_score ?? null;

    const roomName =
      it.class_section_subject_teacher_room_name_snapshot ?? null;

    return {
      id: it.class_section_subject_teacher_id,
      slug: it.class_section_subject_teacher_slug,
      subjectName,
      subjectCode,
      subjectSlug,
      teacherName,
      deliveryMode,
      isActive,
      enrolledCount,
      minPassingScore,
      roomName,
    };
  }, [csstQ.data]);



  /* ===== Set header dashboard ===== */
  useEffect(() => {
    if (!csstView || !sectionView) return;

    setHeader({
      title: "Mata Pelajaran",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas Saya" },
        {
          label: "Detail Kelas",
          href: `kelas-saya/rombel/${sectionView.sectionId}`,
        },
        { label: "Mata Pelajaran" },
      ],
      showBack: true,
    });
  }, [csstView, sectionView, setHeader]);


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
        </Button>
      </div>
    );
  }

  /* ===== Render utama ===== */

  const totalStudents = csstView.enrolledCount ?? 0;
  const totalAttendanceToday = 0; // nanti di-wire ke API absensi

  const totalBooks = 0;
  const totalAssessmentsGraded = 0;
  const totalAssessmentsUngraded = 0;

  const whatsappGroupLink = "https://chat.whatsapp.com/xxxxInviteCodexxxx";

  const attendanceTodayLabel =
    totalAttendanceToday > 0 && totalStudents > 0
      ? `${totalAttendanceToday}/${totalStudents} hadir`
      : "Belum ada data";

  const roomLabel = csstView.roomName || "Belum diatur";

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6">
          {/* Top bar */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-lg font-semibold md:text-xl">
              Detail Mata Pelajaran
            </h1>
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
                    <span className="font-medium">{csstView.teacherName}</span>
                  </span>
                </div>

                <div className="mt-1 text-xs text-muted-foreground flex flex-wrap gap-3">
                  {csstView.minPassingScore != null && (
                    <span>
                      KKM:{" "}
                      <span className="font-mono">
                        {csstView.minPassingScore}
                      </span>
                    </span>
                  )}
                  {csstView.roomName && (
                    <span>
                      Ruangan:{" "}
                      <span className="font-mono">{csstView.roomName}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                <CBadgeStatus
                  status={csstView.isActive ? "active" : "inactive"}
                  className="text-[11px]"
                />

                <Badge variant="outline" className="text-[11px]">
                  {formatDeliveryMode(csstView.deliveryMode)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Row: Absensi & Ruangan */}
          <div className="grid gap-3 md:grid-cols-2">
            {/* Absensi hari ini */}
            <Card className="transition hover:shadow-md">
              <CardContent className="p-4 md:p-5">
                <div className="flex flex-col gap-3 h-full">
                  {hasCheckedIn && checkInLabel ? (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        <span>Absensi Hari Ini</span>
                      </div>
                      <div className="text-xl font-semibold leading-tight">
                        {checkInLabel}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Pengenalan Ilmu Balaghah
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-xl font-semibold leading-tight">
                        {attendanceTodayLabel}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Lakukan absensi untuk pertemuan hari ini.
                      </p>

                      <div className="flex justify-center md:justify-end mt-3">
                        <Button
                          size="sm"
                          className="w-full md:w-auto"
                          onClick={() => {
                            const newMeeting = attendanceReports + 1;
                            setAttendanceReports(newMeeting);
                            setHasCheckedIn(true);
                            setCheckInLabel(`Pertemuan ${newMeeting}`);
                            setCheckInAt(new Date());
                          }}
                        >
                          Absen Sekarang
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ruangan */}
            <Card
              className="cursor-pointer transition hover:shadow-md"
              onClick={() => navigate("ruangan")}
            >
              <CardContent className="p-4 md:p-5 flex flex-col gap-3">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Ruangan</span>
                </div>

                {csstView.deliveryMode !== "online" ? (
                  <>
                    <div className="text-xl font-semibold leading-tight">
                      {roomLabel}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Lokasi pembelajaran utama untuk mata pelajaran ini.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium">Meeting ID: </span>
                        <span className="font-mono">
                          {csstQ.data
                            ?.class_section_subject_teacher_meeting_id ?? "-"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Passcode: </span>
                        <span className="font-mono">
                          {csstQ.data?.class_section_subject_teacher_passcode ??
                            "-"}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium">Link Zoom: </span>
                        {csstQ.data?.class_section_subject_teacher_join_url ? (
                          <a
                            href={
                              csstQ.data.class_section_subject_teacher_join_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline break-all"
                          >
                            {csstQ.data.class_section_subject_teacher_join_url}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">
                            Tidak tersedia
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Grid lainnya */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {/* Jumlah Murid */}
            <Card
              className="cursor-pointer transition hover:shadow-md"
              onClick={() => navigate("murid")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Jumlah Murid</span>
                  </div>
                  <div className="text-xl font-semibold">{totalStudents}</div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            {/* Laporan Kehadiran */}
            <Card
              className="cursor-pointer transition hover:shadow-md"
              onClick={() => navigate("daily-progress")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>Laporan Kehadiran</span>
                  </div>
                  <div className="text-xl font-semibold">
                    {attendanceReports}/{totalMeetingsDummy}
                  </div>
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
                  <div className="text-xl font-semibold">{totalBooks}</div>
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
            <Card className="cursor-pointer transition hover:shadow-md">
              <CardContent
                className="p-4 flex items-center justify-between"
                onClick={() => navigate("ujian")}
              >
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

            {/* Profil Mapel */}
            <Card
              className="cursor-pointer transition hover:shadow-md"
              onClick={() => navigate("detail")}
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

            {/* Grup WhatsApp */}
            <Card
              className="cursor-pointer transition hover:shadow-md"
              onClick={() => window.open(whatsappGroupLink, "_blank")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Grup WhatsApp Mapel</span>
                  </div>
                  <div className="text-md font-semibold underline">
                    Link Group
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>

          {hasCheckedIn && checkInAt && (
            <div className="w-full text-center text-destructive text-sm font-medium mt-2">
              Anda absen pada{" "}
              {checkInAt.toLocaleString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              {checkInLabel ? `(${checkInLabel})` : ""}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentCSST;
