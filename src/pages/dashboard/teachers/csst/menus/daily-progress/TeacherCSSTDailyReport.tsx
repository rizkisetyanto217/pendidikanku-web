// src/pages/dashboard/teachers/TeacherCSSTDailyReport.tsx

import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

import ScheduleList from "@/pages/dashboard/components/calender/ScheduleList";
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

import type { ScheduleRow } from "@/pages/dashboard/components/calender/types/types";
import api from "@/lib/axios";

type ApiSessionItem = {
  session: {
    class_attendance_session_id: string;
    class_attendance_session_title: string;
    class_attendance_session_display_title?: string;
    class_attendance_session_date: string; // "2025-11-20T00:00:00Z"
    class_attendance_session_starts_at?: string; // "2025-11-20T01:00:00Z"
    class_attendance_session_general_info?: string;
    class_attendance_session_csst_snapshot?: {
      teacher_name?: string;
      school_teacher?: {
        name?: string;
      };
    };
    class_attendance_session_type_snapshot?: {
      name?: string;
    };
  };
  participant?: {
    participant_id: string;
    participant_state: string; // "unknown" | "present" | "absent" | ...
  };
};

type ApiResponse = {
  success: boolean;
  message: string;
  data: ApiSessionItem[];
};

/* =======================
   Utils kecil
======================= */

// convert ISO date ke "YYYY-MM-DD"
function toYmd(dateISO: string | undefined): string {
  if (!dateISO) return "";
  // ambil 10 char pertama "YYYY-MM-DD"
  return dateISO.slice(0, 10);
}

// ambil hh:mm dari starts_at
function toTime(dateISO: string | undefined): string {
  if (!dateISO) return "";
  // contoh: "2025-11-20T01:00:00Z" -> "01:00"
  return dateISO.substring(11, 16);
}

export default function TeacherCSSTDailyReport() {
  const navigate = useNavigate();
  const { setHeader } = useDashboardHeader();
  const { csstId } = useParams<{ csstId: string }>();

  // Set header via effect
  useEffect(() => {
    setHeader({
      title: "Laporan Harian",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Guru Mapel" },
        { label: "Detail Mapel", href: `guru-mapel/${csstId}` },
        { label: "Laporan Harian" },
      ],
      showBack: true,
    });
  }, [setHeader, csstId]);

  /* =======================
     Query data dari API
  ======================= */

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["teacher-csst-daily-report", csstId],
    enabled: !!csstId,
    queryFn: async () => {
      const res = await api.get("/api/u/attendance-sessions/list", {
        params: {
          teacher_timeline: 1,
          mode: "compact",
          csst_id: csstId,
        },
      });
      return res.data;
    },
  });

  /* =======================
     Mapping ke ScheduleRow
  ======================= */

  const schedules: ScheduleRow[] = useMemo(() => {
    if (!data?.data) return [];

    return data.data.map((item) => {
      const s = item.session;
      const p = item.participant;

      const teacherName =
        s.class_attendance_session_csst_snapshot?.teacher_name ??
        s.class_attendance_session_csst_snapshot?.school_teacher?.name ??
        "";

      // Hanya terima "present" / "absent" / undefined (ikut ScheduleRow)
      let status: ScheduleRow["status"];
      if (
        p?.participant_state === "present" ||
        p?.participant_state === "absent"
      ) {
        status = p.participant_state;
      } else {
        status = undefined;
      }

      const description =
        s.class_attendance_session_general_info ||
        s.class_attendance_session_type_snapshot?.name ||
        "";

      return {
        id: s.class_attendance_session_id,
        title:
          s.class_attendance_session_display_title ||
          s.class_attendance_session_title ||
          "Pertemuan",
        date: toYmd(s.class_attendance_session_date),
        time: toTime(s.class_attendance_session_starts_at),
        room: "", // belum ada di response
        teacher: teacherName,
        type: "class", // semua ini pertemuan kelas
        description,
        status,
      } satisfies ScheduleRow;
    });
  }, [data]);

  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      {/* Header di dalam page (di luar DashboardLayout header) */}
      <div className="md:flex hidden gap-3 items-center">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold md:text-xl">Laporan Harian</h1>
      </div>

      <CardContent className="p-4">
        {isError && (
          <div className="text-sm text-destructive mb-3">
            Gagal memuat jadwal. Coba muat ulang nanti ya.
          </div>
        )}

        <ScheduleList
          data={schedules}
          loading={isLoading}
          hideRowActions={true}
          onEdit={(row) => navigate(`${row.id}`)}
        />
      </CardContent>
    </div>
  );
}
