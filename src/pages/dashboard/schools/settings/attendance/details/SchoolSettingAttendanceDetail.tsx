// src/pages/dashboard/school/attendance/SchoolSettingAttendanceDetail.tsx
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Settings2,
  ListChecks,
  BookOpenCheck,
  CalendarClock,
  PartyPopper,
  Palette,
  Pencil,
} from "lucide-react";
import axios from "@/lib/axios";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

/* Layout header hook */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import { cn } from "@/lib/utils";

/* =================== Types =================== */

type AttendanceWindowMode =
  | "same_day"
  | "same_day_range"
  | "open_range"
  | string;

type AttendanceReason = "present" | "absent" | "late" | "excused" | string;

type AttendanceTypeMeta = {
  category?: string;
  show_in_daily_schedule?: boolean;
  [key: string]: any;
};

type AttendanceSessionTypeApi = {
  class_attendance_session_type_id: string;
  class_attendance_session_type_school_id: string;
  class_attendance_session_type_slug: string;
  class_attendance_session_type_name: string;
  class_attendance_session_type_description?: string | null;
  class_attendance_session_type_color?: string | null;
  class_attendance_session_type_icon?: string | null;
  class_attendance_session_type_is_active: boolean;
  class_attendance_session_type_sort_order?: number | null;
  class_attendance_session_type_allow_student_self_attendance: boolean;
  class_attendance_session_type_allow_teacher_mark_attendance: boolean;
  class_attendance_session_type_require_teacher_attendance: boolean;
  class_attendance_session_type_attendance_window_mode: AttendanceWindowMode;
  class_attendance_session_type_require_attendance_reason: AttendanceReason[];
  class_attendance_session_type_meta?: AttendanceTypeMeta | null;
  class_attendance_session_type_created_at: string;
  class_attendance_session_type_updated_at: string;
};

type AttendanceSessionTypesResponse = {
  success: boolean;
  message?: string;
  data: AttendanceSessionTypeApi[];
};

/* =================== Helpers =================== */

const BoolPill: React.FC<{ value: boolean }> = ({ value }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
      value
        ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30"
        : "bg-zinc-500/10 text-zinc-400 ring-zinc-500/30"
    )}
  >
    {value ? "Ya" : "Tidak"}
  </span>
);

function formatWindowMode(mode: AttendanceWindowMode) {
  switch (mode) {
    case "same_day":
      return "Hanya di hari yang sama";
    case "same_day_range":
      return "Rentang waktu di hari yang sama";
    case "open_range":
      return "Rentang waktu bebas";
    default:
      return mode;
  }
}

function formatReasonLabel(r: AttendanceReason) {
  switch (r) {
    case "present":
      return "Hadir";
    case "absent":
      return "Alpa / Tidak hadir";
    case "late":
      return "Terlambat";
    case "excused":
      return "Izin / Sakit";
    default:
      return r;
  }
}

// Mapping string icon → komponen lucide
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpenCheck,
  CalendarClock,
  PartyPopper,
};

const AttendanceIcon: React.FC<{ iconName?: string | null }> = ({
  iconName,
}) => {
  if (!iconName) {
    return (
      <div className="rounded-lg bg-zinc-700/40 p-2">
        <Palette className="h-4 w-4 text-zinc-300" />
      </div>
    );
  }

  const Comp = ICON_MAP[iconName] ?? BookOpenCheck;
  return (
    <div className="rounded-lg bg-emerald-500/15 p-2">
      <Comp className="h-4 w-4 text-emerald-400" />
    </div>
  );
};

/* =================== Page =================== */

type Props = { showBack?: boolean; backTo?: string };

const SchoolSettingAttendanceDetail: React.FC<Props> = ({
  showBack = true,
  backTo,
}) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // route: .../attendance-types/:id (sesuaikan)

  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  const goEdit = () => {
    if (!id) return;
    // misal: /pengaturan/kehadiran/:id → /pengaturan/kehadiran/edit/:id
    navigate(`../edit/${id}`);
  };

  const { setHeader } = useDashboardHeader();

  const qType = useQuery({
    queryKey: ["attendance-session-type-detail", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await axios.get<AttendanceSessionTypesResponse>(
        "/api/u/attendance-session-types/list",
        { params: { id } }
      );
      const item = res.data?.data?.[0];
      if (!item) throw new Error("Tipe sesi kehadiran tidak ditemukan");
      return item;
    },
  });

  const data = qType.data;

  useEffect(() => {
    setHeader({
      title: data
        ? data.class_attendance_session_type_name
        : "Detail Tipe Kehadiran",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Akademik" },
        { label: "Tipe Kehadiran", href: "/sekolah/pengaturan/kehadiran" },
        { label: data?.class_attendance_session_type_name ?? "Detail" },
      ],
      showBack,
    });
  }, [data, setHeader, showBack]);

  const meta = data?.class_attendance_session_type_meta ?? {};
  const reasons =
    data?.class_attendance_session_type_require_attendance_reason ?? [];

  const colorStyle = useMemo(
    () =>
      data?.class_attendance_session_type_color
        ? {
            backgroundColor: `${data.class_attendance_session_type_color}20`,
            borderColor: `${data.class_attendance_session_type_color}60`,
            color: data.class_attendance_session_type_color,
          }
        : undefined,
    [data?.class_attendance_session_type_color]
  );

  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-4 lg:gap-6">
          {/* Top header */}
          <div className="md:flex hidden gap-3 items-center">
            {showBack && (
              <Button
                onClick={handleBack}
                variant="ghost"
                size="icon"
                className="cursor-pointer self-start"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="font-semibold text-lg md:text-xl">
                {data?.class_attendance_session_type_name ??
                  "Detail Tipe Kehadiran"}
              </h1>
              {data && (
                <p className="text-xs text-muted-foreground mt-1">
                  Slug:{" "}
                  <span className="font-mono">
                    {data.class_attendance_session_type_slug}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Loading / error */}
          {qType.isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat detail tipe kehadiran…
            </div>
          )}

          {qType.isError && !qType.isLoading && (
            <Card className="border-destructive/40 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-sm">Gagal memuat data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-destructive">
                  {(qType.error as Error).message}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => qType.refetch()}
                >
                  Coba lagi
                </Button>
              </CardContent>
            </Card>
          )}

          {data && (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
              {/* ========== Blok 1: Info Umum & Akses Presensi ========== */}
              <Card className="h-fit">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
                  <div className="flex items-center gap-2">
                    <AttendanceIcon
                      iconName={data.class_attendance_session_type_icon}
                    />
                    <div>
                      <CardTitle className="text-sm md:text-base">
                        Pengaturan Kehadiran
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Nama, warna, dan akses presensi guru / siswa.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={goEdit}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Nama</div>
                      <div className="font-medium">
                        {data.class_attendance_session_type_name}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Urutan tampilan
                      </div>
                      <div className="font-medium">
                        {data.class_attendance_session_type_sort_order ?? "-"}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-muted-foreground">
                        Deskripsi
                      </div>
                      <div className="text-sm">
                        {data.class_attendance_session_type_description || "-"}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">Aktif</div>
                      <BoolPill
                        value={data.class_attendance_session_type_is_active}
                      />
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">
                        Warna label
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div
                          className={cn(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                            !colorStyle && "text-muted-foreground"
                          )}
                          style={colorStyle}
                        >
                          {data.class_attendance_session_type_color ?? "-"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-3 mt-2 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Siswa boleh absen mandiri
                        </div>
                      </div>
                      <BoolPill
                        value={
                          data.class_attendance_session_type_allow_student_self_attendance
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Guru boleh mengisi presensi
                        </div>
                      </div>
                      <BoolPill
                        value={
                          data.class_attendance_session_type_allow_teacher_mark_attendance
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Wajib presensi guru
                        </div>
                      </div>
                      <BoolPill
                        value={
                          data.class_attendance_session_type_require_teacher_attendance
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Mode jendela presensi
                        </div>
                      </div>
                      <div className="font-medium">
                        {formatWindowMode(
                          data.class_attendance_session_type_attendance_window_mode
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ========== Blok 2: Alasan & Meta + Ringkasan ========== */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-sky-500/15 p-2">
                        <Settings2 className="h-4 w-4 text-sky-400" />
                      </div>
                      <div>
                        <CardTitle className="text-sm md:text-base">
                          Alasan Presensi & Meta
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Alasan yang wajib diisi dan pengelompokan sesi.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={goEdit}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Wajib isi alasan untuk status:
                      </div>
                      {reasons.length === 0 ? (
                        <div className="text-xs text-muted-foreground">
                          Tidak ada alasan khusus yang diwajibkan.
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {reasons.map((r) => (
                            <span
                              key={r}
                              className="inline-flex items-center rounded-full bg-zinc-700/40 px-2.5 py-0.5 text-[11px]"
                            >
                              {formatReasonLabel(r)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-3 mt-1 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                          Kategori
                        </span>
                        <span className="font-medium">
                          {meta.category ?? "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                          Tampilkan di jadwal harian
                        </span>
                        <BoolPill
                          value={Boolean(meta.show_in_daily_schedule)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-amber-500/15 p-2">
                        <ListChecks className="h-4 w-4 text-amber-400" />
                      </div>
                      <div>
                        <CardTitle className="text-sm md:text-base">
                          Ringkasan
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Gambaran cepat tipe sesi kehadiran ini.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={goEdit}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        Nama
                      </span>
                      <span className="font-medium text-right">
                        {data.class_attendance_session_type_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        Slug
                      </span>
                      <span className="font-mono text-[11px] text-right">
                        {data.class_attendance_session_type_slug}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        Status
                      </span>
                      <BoolPill
                        value={data.class_attendance_session_type_is_active}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        Mode jendela
                      </span>
                      <span className="font-medium text-right">
                        {formatWindowMode(
                          data.class_attendance_session_type_attendance_window_mode
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SchoolSettingAttendanceDetail;
