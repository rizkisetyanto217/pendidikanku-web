// src/pages/sekolahislamku/teacher/TeacherCSStDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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
import CBadgeStatus from "@/components/costum/common/badges/CBadgeStatus";
import { cardHover } from "@/components/costum/table/CDataTable";
import { cn } from "@/lib/utils";

/* ========= Types dari API /api/u/class-section-subject-teachers/list ========= */

type DeliveryMode = "offline" | "online" | "hybrid" | string;

type ApiTeacherCache = {
  id?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  title_prefix?: string | null;
  title_suffix?: string | null;
  whatsapp_url?: string | null;
  gender?: string | null;
  teacher_code?: string | null;
};

type ApiRoomCache = {
  // varian offline (ruang fisik)
  code?: string | null;
  name?: string | null;
  slug?: string | null;
  capacity?: number | null;
  location?: string | null;
  is_virtual?: boolean | null;

  // varian zoom / kelas virtual (class_room_*)
  class_room_id?: string | null;
  class_room_name?: string | null;
  class_room_slug?: string | null;
  class_room_join_url?: string | null;
  class_room_passcode?: string | null;
  class_room_platform?: string | null;
  class_room_is_virtual?: boolean | null;
  class_room_meeting_id?: string | null;
};

type ApiCSSTItem = {
  class_section_subject_teacher_id: string;
  class_section_subject_teacher_school_id: string;
  class_section_subject_teacher_class_section_id: string;
  class_section_subject_teacher_class_subject_id: string;
  class_section_subject_teacher_school_teacher_id: string;
  class_section_subject_teacher_class_room_id: string | null;
  class_section_subject_teacher_slug: string;

  class_section_subject_teacher_total_attendance: number;
  class_section_subject_teacher_quota_taken: number;

  // total semua assessment
  class_section_subject_teacher_total_assessments: number;

  // ⬇️ PAKAI INI AJA (3 baru)
  class_section_subject_teacher_total_assessments_training: number;
  class_section_subject_teacher_total_assessments_daily_exam: number;
  class_section_subject_teacher_total_assessments_exam: number;

  // boleh tetap kalau mau dipakai nanti
  class_section_subject_teacher_total_students_passed: number;

  class_section_subject_teacher_delivery_mode: DeliveryMode;
  class_section_subject_teacher_total_books: number;

  // section cache
  class_section_subject_teacher_class_section_slug_cache: string;
  class_section_subject_teacher_class_section_name_cache: string;
  class_section_subject_teacher_class_section_code_cache: string;

  // room cache
  class_section_subject_teacher_class_room_slug_cache?: string | null;
  class_section_subject_teacher_class_room_cache?: ApiRoomCache | null;
  class_section_subject_teacher_class_room_name_cache?: string | null;
  class_section_subject_teacher_class_room_slug_cache_gen?: string | null;
  class_section_subject_teacher_class_room_location_cache?: string | null;

  // teacher cache
  class_section_subject_teacher_school_teacher_slug_cache?: string | null;
  class_section_subject_teacher_school_teacher_cache?: ApiTeacherCache | null;
  class_section_subject_teacher_school_teacher_name_cache?: string | null;

  // subject cache
  class_section_subject_teacher_subject_id: string;
  class_section_subject_teacher_subject_name_cache?: string | null;
  class_section_subject_teacher_subject_code_cache?: string | null;
  class_section_subject_teacher_subject_slug_cache?: string | null;

  // status
  class_section_subject_teacher_status: string;
  class_section_subject_teacher_is_active: boolean;
  class_section_subject_teacher_created_at: string;
  class_section_subject_teacher_updated_at: string;
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

/* List ruangan (dropdown) */
type ApiClassRoomOption = {
  class_room_id: string;
  class_room_name: string;
  class_room_slug: string;
  class_room_is_virtual?: boolean | null;
  class_room_platform?: string | null;
  class_room_location?: string | null;
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
  location?: string | null;

  // ⬇️ new
  meetingId?: string | null;
  passcode?: string | null;
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

  // masih boleh simpan total semua assessment
  totalAssessments: number;

  // ⬇️ graded/ungraded DIHAPUS
  // totalAssessmentsGraded: number;
  // totalAssessmentsUngraded: number;

  totalStudentsPassed: number;
  minPassingScore?: number | null;

  totalBooks: number;

  // ✅ breakdown baru
  totalAssessmentsTraining: number;
  totalAssessmentsDailyExam: number;
  totalAssessmentsExam: number;

  // ✅ subject_id dari API
  subjectId: string;
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
      return "Tatap muka";
    case "online":
      return "Daring";
    case "hybrid":
      return "Campuran";
    default:
      return String(m).replace(/_/g, " ");
  }
};

/* ========== Page ========== */

const TeacherCSSTDetail: React.FC = () => {
  const navigate = useNavigate();

  const { csstId, teacherId } = useParams<{
    csstId: string;
    teacherId?: string;
  }>();

  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Detail Mata Pelajaran",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Guru Mata Pelajaran" },
        { label: "Detail Mata Pelajaran" },
      ],
      showBack: true,
    });
  }, [setHeader]);

  /* ===== Query detail CSST ===== */
  const csstQ = useQuery<ApiCSSTItem | null, AxiosError>({
    queryKey: ["teacher-csst-detail", csstId, teacherId ?? null],
    enabled: !!csstId,
    queryFn: async () => {
      const res = await axios.get<ApiCSSTDetailResponse>(
        "/api/u/class-section-subject-teachers/list",
        {
          params: {
            id: csstId,
            ...(teacherId ? { teacher_id: teacherId } : {}),
          },
        }
      );
      const items = res.data?.data ?? [];
      return items.length ? items[0] : null;
    },
    staleTime: 60_000,
  });

  const csstError: string | null = csstQ.isError
    ? extractErrorMessage(csstQ.error)
    : null;

  /* ===== Query daftar ruangan (untuk dropdown modal) ===== */
  const roomsQ = useQuery<ApiClassRoomOption[], AxiosError>({
    queryKey: [
      "teacher-csst-rooms",
      csstQ.data?.class_section_subject_teacher_school_id ?? null,
    ],
    enabled: !!csstQ.data?.class_section_subject_teacher_school_id,
    queryFn: async () => {
      const res = await axios.get<{ data: ApiClassRoomOption[] }>(
        "/api/u/class-rooms/list",
        {
          params: {
            mode: "compact",
          },
        }
      );
      return res.data?.data ?? [];
    },
    staleTime: 60_000,
  });

  /* ===== State modal ===== */
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [waDialogOpen, setWaDialogOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(
    undefined
  );
  const [waGroupLink, setWaGroupLink] = useState<string>(
    "https://chat.whatsapp.com/xxxxInviteCodexxxx"
  );

  /* Sinkron selectedRoomId dengan data awal */
  useEffect(() => {
    if (csstQ.data?.class_section_subject_teacher_class_room_id) {
      setSelectedRoomId(csstQ.data.class_section_subject_teacher_class_room_id);
    }
  }, [csstQ.data]);

  /* ===== View models ===== */
  const sectionView: SectionView | null = useMemo(() => {
    const it = csstQ.data;
    if (!it) return null;
    return {
      sectionId: it.class_section_subject_teacher_class_section_id,
      sectionName: it.class_section_subject_teacher_class_section_name_cache,
      sectionSlug: it.class_section_subject_teacher_class_section_slug_cache,
      sectionCode: it.class_section_subject_teacher_class_section_code_cache,
    };
  }, [csstQ.data]);

  const roomView: RoomView | null = useMemo(() => {
    const it = csstQ.data;
    if (!it) return null;

    const room = it.class_section_subject_teacher_class_room_cache;

    const roomName =
      it.class_section_subject_teacher_class_room_name_cache ??
      room?.name ??
      room?.class_room_name ??
      null;

    const roomSlug =
      it.class_section_subject_teacher_class_room_slug_cache_gen ??
      it.class_section_subject_teacher_class_room_slug_cache ??
      room?.slug ??
      room?.class_room_slug ??
      null;

    const joinUrl =
      (room as any)?.join_url ?? room?.class_room_join_url ?? null;

    const platform =
      room?.class_room_platform ??
      (room as any)?.platform ??
      (room?.class_room_is_virtual ? "zoom" : null);

    const isVirtual = room?.class_room_is_virtual ?? room?.is_virtual ?? null;

    const location =
      it.class_section_subject_teacher_class_room_location_cache ??
      (room as any)?.location ??
      null;

    return {
      roomId: it.class_section_subject_teacher_class_room_id,
      roomName,
      roomSlug,
      joinUrl,
      platform,
      isVirtual,
      location,
      // ⬇️ ambil dari cache zoom
      meetingId: room?.class_room_meeting_id ?? null,
      passcode: room?.class_room_passcode ?? null,
    };
  }, [csstQ.data]);

  const csstView: CsstView | null = useMemo(() => {
    const it = csstQ.data;
    if (!it) return null;

    const teacher = it.class_section_subject_teacher_school_teacher_cache;
    const teacherName =
      it.class_section_subject_teacher_school_teacher_name_cache ||
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
      it.class_section_subject_teacher_subject_name_cache ||
      "Mata pelajaran tanpa nama";

    const subjectCode =
      it.class_section_subject_teacher_subject_code_cache || null;

    const subjectSlug =
      it.class_section_subject_teacher_subject_slug_cache || null;

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
      enrolledCount: it.class_section_subject_teacher_quota_taken,
      totalAttendance: it.class_section_subject_teacher_total_attendance,

      // total semua assessment (kalau masih mau dipakai)
      totalAssessments: it.class_section_subject_teacher_total_assessments,

      // ⬇️ 3 jenis baru
      totalAssessmentsTraining:
        it.class_section_subject_teacher_total_assessments_training,
      totalAssessmentsDailyExam:
        it.class_section_subject_teacher_total_assessments_daily_exam,
      totalAssessmentsExam:
        it.class_section_subject_teacher_total_assessments_exam,

      totalStudentsPassed:
        it.class_section_subject_teacher_total_students_passed,
      minPassingScore: undefined,

      subjectId: it.class_section_subject_teacher_subject_id,
      totalBooks: it.class_section_subject_teacher_total_books,
    };
  }, [csstQ.data]);

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

  /* ===== Hitungan & label ===== */

  const totalStudents = csstView.enrolledCount ?? 0;
  const totalAttendance = csstView.totalAttendance ?? 0;
  const totalBooks = csstView.totalBooks ?? 0;

  const totalAssessmentsTraining = csstView.totalAssessmentsTraining ?? 0;
  const totalAssessmentsDailyExam = csstView.totalAssessmentsDailyExam ?? 0;
  const totalAssessmentsExam = csstView.totalAssessmentsExam ?? 0;

  const attendanceTodayLabel =
    totalAttendance > 0
      ? `${totalAttendance} kehadiran tercatat`
      : "Belum ada data";

  const roomLabel = (() => {
    if (!roomView) return "Belum diatur";
    if (roomView.roomName && roomView.location && !roomView.isVirtual) {
      return `${roomView.roomName} • ${roomView.location}`;
    }
    if (roomView.roomName && roomView.isVirtual) {
      return `${roomView.roomName} • ${roomView.platform ?? "virtual"}`;
    }
    if (roomView.roomName) return roomView.roomName;
    if (roomView.isVirtual) return roomView.platform ?? "Kelas virtual";
    return "Belum diatur";
  })();

  /* ===== Handler save (nanti sambung API) ===== */
  const handleSaveRoom = () => {
    // TODO: panggil API update ruangan CSST
    console.log("Save room to:", selectedRoomId);
    setRoomDialogOpen(false);
  };

  const handleSaveWa = () => {
    // TODO: panggil API simpan link WA
    console.log("Save WA group link:", waGroupLink);
    setWaDialogOpen(false);
  };

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6">
          {/* Header minimal (back + title) */}
          <div className="flex items-center justify-between">
            <div className="md:flex hidden items-center gap-3">
              <Button onClick={() => navigate(-1)} variant="ghost" size="icon">
                <ArrowLeft size={20} />
              </Button>
              <h1 className="font-semibold text-lg md:text-xl">Detail Kelas</h1>
            </div>
          </div>

          {/* Header mapel */}
          <Card>
            <CardContent className="p-4 md:p-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="text-lg md:text-xl font-semibold">
                  {csstView.subjectName}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
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
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("kelola-kelas")}
                >
                  Edit
                </Button>

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

          {/* =========================
              Quick links
             ========================= */}

          {/* Absensi & Ruangan */}
          <div className="grid gap-3 md:grid-cols-2">
            {/* Absensi hari ini */}
            <Card
              className={cn("cursor-pointer bg-card", cardHover)}
              onClick={() => navigate("")}
            >
              <CardContent className="p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>Absensi Hari Ini</span>
                  </div>
                  <div className="text-xl font-semibold leading-tight">
                    {attendanceTodayLabel}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Rekap kehadiran murid untuk pertemuan hari ini.
                  </p>
                </div>
                <div className="self-start md:self-center">
                  <Badge variant="outline" className="text-[11px]">
                    {totalStudents} murid terdaftar
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Ruangan – klik card => modal */}
            <Card
              className={cn("cursor-pointer bg-card", cardHover)}
              onClick={() => setRoomDialogOpen(true)}
            >
              <CardContent className="p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Ruangan</span>
                  </div>
                  <div className="text-xl font-semibold leading-tight">
                    {roomLabel}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Lokasi atau platform utama untuk pertemuan mapel ini.
                  </p>
                </div>
                <div className="self-start md:self-center">
                  <Badge variant="outline" className="text-[11px]">
                    {formatDeliveryMode(csstView.deliveryMode)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grid lainnya */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {/* Profil Murid */}
            <Card
              className={cn("cursor-pointer bg-card", cardHover)}
              onClick={() => navigate("absensi")}
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

            {/* Laporan Kehadiran / Harian */}
            <Card
              className={cn("cursor-pointer bg-card", cardHover)}
              onClick={() => navigate("laporan-harian")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>Laporan Kehadiran</span>
                  </div>
                  <div className="text-xl font-semibold">{totalAttendance}</div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            {/* Materi */}
            <Card
              className={cn("cursor-pointer bg-card", cardHover)}
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
              className={cn("cursor-pointer bg-card", cardHover)}
              onClick={() => navigate("tugas")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    <span>Latihan</span>
                  </div>
                  <div className="text-xl font-semibold">
                    {totalAssessmentsTraining}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            {/* Ulangan Harian */}
            <Card
              className={cn("cursor-pointer bg-card", cardHover)}
              onClick={() => navigate("ulangan-harian")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    <span>Ulangan Harian</span>
                  </div>
                  <div className="text-xl font-semibold">
                    {totalAssessmentsDailyExam}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            {/* Ujian */}
            <Card
              className={cn("cursor-pointer bg-card", cardHover)}
              onClick={() => navigate("ujian")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    <span>Ujian</span>
                  </div>
                  <div className="text-xl font-semibold">
                    {totalAssessmentsExam}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            {/* Buku */}
            <Card
              className={cn("cursor-pointer bg-card", cardHover)}
              onClick={() =>
                navigate("buku", {
                  state: { subjectId: csstView.subjectId },
                })
              }
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
              className={cn("cursor-pointer bg-card", cardHover)}
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

            {/* Grup WhatsApp */}
            <Card
              className={cn("cursor-pointer bg-card", cardHover)}
              onClick={() => setWaDialogOpen(true)}
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

          {/* Ruang / Platform Kelas (detail) */}
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
                  {roomView.location && !roomView.isVirtual && (
                    <div className="text-xs text-muted-foreground">
                      Lokasi: {roomView.location}
                    </div>
                  )}
                  {roomView.platform && (
                    <div className="text-xs text-muted-foreground">
                      Platform: {roomView.platform}
                      {roomView.isVirtual ? " (virtual)" : ""}
                    </div>
                  )}
                  {roomView.isVirtual && roomView.meetingId && (
                    <div className="text-xs text-muted-foreground">
                      Meeting ID:{" "}
                      <span className="font-mono">{roomView.meetingId}</span>
                    </div>
                  )}
                  {roomView.isVirtual && roomView.passcode && (
                    <div className="text-xs text-muted-foreground">
                      Passcode:{" "}
                      <span className="font-mono">{roomView.passcode}</span>
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

          {/* ============ MODAL: Edit Ruangan ============ */}
          <Dialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader className="space-y-1">
                <DialogTitle>Atur Ruangan</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Pilih ruangan yang akan digunakan sebagai tempat pertemuan
                  mapel ini.
                </p>
              </DialogHeader>

              <div className="space-y-5">
                {/* Info ruangan saat ini */}
                {roomView && (
                  <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          Ruangan saat ini
                        </p>
                        <p className="text-sm font-semibold">{roomLabel}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        Aktif
                      </Badge>
                    </div>

                    {/* Offline: lokasi */}
                    {roomView.location && !roomView.isVirtual && (
                      <p className="text-xs text-muted-foreground">
                        Lokasi: {roomView.location}
                      </p>
                    )}

                    {/* Virtual / Zoom: detail lengkap */}
                    {roomView.isVirtual && (
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {roomView.platform && (
                          <p>
                            Platform:{" "}
                            <span className="font-medium">
                              {roomView.platform}
                            </span>{" "}
                            (virtual)
                          </p>
                        )}
                        {roomView.meetingId && (
                          <p>
                            Meeting ID:{" "}
                            <span className="font-mono font-medium">
                              {roomView.meetingId}
                            </span>
                          </p>
                        )}
                        {roomView.passcode && (
                          <p>
                            Passcode:{" "}
                            <span className="font-mono font-medium">
                              {roomView.passcode}
                            </span>
                          </p>
                        )}
                      </div>
                    )}

                    {roomView.joinUrl && (
                      <p className="pt-1 text-xs text-muted-foreground">
                        Link pertemuan saat ini:{" "}
                        <a
                          href={roomView.joinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium underline underline-offset-2"
                        >
                          Buka
                        </a>
                      </p>
                    )}
                  </div>
                )}

                {/* Dropdown ruangan */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-sm">Ruangan</Label>
                    {selectedRoomId && (
                      <span className="text-[11px] text-muted-foreground">
                        Ruangan baru akan aktif setelah disimpan
                      </span>
                    )}
                  </div>
                  <Select
                    value={selectedRoomId ?? ""}
                    onValueChange={(v) => setSelectedRoomId(v || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih ruangan" />
                    </SelectTrigger>
                    <SelectContent>
                      {(roomsQ.data ?? []).map((r) => (
                        <SelectItem
                          key={r.class_room_id}
                          value={r.class_room_id}
                        >
                          {r.class_room_name}
                          {r.class_room_location
                            ? ` • ${r.class_room_location}`
                            : r.class_room_platform
                              ? ` • ${r.class_room_platform}`
                              : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {roomsQ.isLoading && (
                    <p className="text-xs text-muted-foreground">
                      Memuat daftar ruangan…
                    </p>
                  )}
                  {roomsQ.isError && (
                    <p className="text-xs text-destructive">
                      Gagal memuat ruangan. Coba lagi beberapa saat.
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setRoomDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSaveRoom}
                  disabled={!selectedRoomId || roomsQ.isLoading}
                >
                  Simpan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* ============ MODAL: Edit Grup WhatsApp ============ */}
          <Dialog open={waDialogOpen} onOpenChange={setWaDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="space-y-1">
                <DialogTitle>Atur Grup WhatsApp Mapel</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Simpan link grup WhatsApp yang digunakan untuk koordinasi
                  murid dan orang tua.
                </p>
              </DialogHeader>

              <div className="space-y-4">
                {/* ringkasan link sekarang */}
                {waGroupLink && (
                  <div className="rounded-lg border bg-muted/40 p-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      Link saat ini
                    </p>
                    <a
                      href={waGroupLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium underline underline-offset-2 break-all"
                    >
                      {waGroupLink}
                    </a>
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="wa-link">Link Grup WhatsApp</Label>
                  <Input
                    id="wa-link"
                    value={waGroupLink}
                    onChange={(e) => setWaGroupLink(e.target.value)}
                    placeholder="https://chat.whatsapp.com/..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Tempel link undangan grup WhatsApp (format resmi dari
                    aplikasi WhatsApp).
                  </p>
                </div>
              </div>

              <DialogFooter className="mt-2">
                <Button
                  variant="outline"
                  onClick={() => setWaDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button onClick={handleSaveWa}>Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default TeacherCSSTDetail;