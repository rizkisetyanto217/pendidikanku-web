// src/pages/dashboard/teachers/TeacherScheduleDetail.tsx

import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  User,
  MapPin,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* dashboard header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import type { ScheduleRow } from "@/pages/dashboard/components/calender/types/types";
import api from "@/lib/axios";

/* =======================
   Types API (sama seperti list)
======================= */

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
  return dateISO.slice(0, 10);
}

// ambil hh:mm dari starts_at
function toTime(dateISO: string | undefined): string {
  if (!dateISO) return "";
  return dateISO.substring(11, 16);
}

export default function TeacherScheduleDetail() {
  const navigate = useNavigate();
  const { csstId, id } = useParams();
  const { setHeader } = useDashboardHeader();

  // Set Header
  useEffect(() => {
    setHeader({
      title: "Detail Laporan Harian",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Guru Mapel", href: "guru-mapel" },
        { label: "Detail Mapel", href: `guru-mapel/${csstId}` },
        {
          label: "Laporan Harian",
          href: `guru-mapel/${csstId}/daily-progress`,
        },
        { label: "Detail Laporan Harian" },
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
     Ambil 1 schedule by id
  ======================= */

  const schedule: ScheduleRow | undefined = useMemo(() => {
    if (!data?.data || !id) return undefined;

    const item = data.data.find(
      (it) => it.session.class_attendance_session_id === id
    );
    if (!item) return undefined;

    const s = item.session;
    const p = item.participant;

    const teacherName =
      s.class_attendance_session_csst_snapshot?.teacher_name ??
      s.class_attendance_session_csst_snapshot?.school_teacher?.name ??
      "";

    let status: ScheduleRow["status"];
    if (
      p?.participant_state === "present" ||
      p?.participant_state === "absent"
    ) {
      status = p.participant_state;
    } else {
      status = undefined; // belum ada data kehadiran
    }

    const description =
      s.class_attendance_session_general_info ||
      s.class_attendance_session_type_snapshot?.name ||
      "";

    const row: ScheduleRow = {
      id: s.class_attendance_session_id,
      title:
        s.class_attendance_session_display_title ||
        s.class_attendance_session_title ||
        "Pertemuan",
      date: toYmd(s.class_attendance_session_date),
      time: toTime(s.class_attendance_session_starts_at),
      room: "", // belum ada di response
      teacher: teacherName,
      type: "class",
      description,
      status,
    };

    return row;
  }, [data, id]);

  /* =======================
     Render
  ======================= */

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Memuat detail laporan harian…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-sm text-destructive">
        Gagal memuat detail laporan. Coba beberapa saat lagi ya.
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Jadwal tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="md:flex hidden gap-3 items-center">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold md:text-xl ">
          Detail Laporan Harian
        </h1>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">{schedule.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* tanggal */}
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays size={16} className="text-muted-foreground" />
            {schedule.date}
          </div>

          {/* waktu */}
          <div className="flex items-center gap-2 text-sm">
            <Clock size={16} className="text-muted-foreground" />
            {schedule.time}
          </div>

          {/* guru */}
          <div className="flex items-center gap-2 text-sm">
            <User size={16} className="text-muted-foreground" />
            {schedule.teacher}
          </div>

          {/* ruangan */}
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={16} className="text-muted-foreground" />
            {schedule.room || "-"}
          </div>

          {/* jenis */}
          <div className="flex items-center gap-2 text-sm">
            <FileText size={16} className="text-muted-foreground" />
            Jenis:{" "}
            <span className="font-medium capitalize">{schedule.type}</span>
          </div>

          {/* status */}
          <div className="flex items-center gap-2 text-sm">
            {schedule.status === "present" && (
              <>
                <CheckCircle2 size={16} className="text-green-600" />
                <span className="text-green-700">Guru Hadir</span>
              </>
            )}

            {schedule.status === "absent" && (
              <>
                <XCircle size={16} className="text-red-600" />
                <span className="text-red-700">Guru Tidak Hadir</span>
              </>
            )}

            {schedule.status === undefined && (
              <>
                <HelpCircle size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">
                  Kehadiran belum ditandai
                </span>
              </>
            )}
          </div>

          {/* deskripsi */}
          <div className="text-sm text-muted-foreground mt-2">
            {schedule.description || "Belum ada keterangan tambahan."}
          </div>

          {/* tombol (sementara masih dummy) */}
          {/* Nanti bisa diganti dengan edit/hapus nyata kalau endpoint-nya siap */}
          {/* <div className="flex gap-2 pt-4">
            <Button
              variant="default"
              onClick={() => alert("Edit jadwal")}
              className="flex items-center gap-2"
            >
              <Pencil size={16} />
              Edit
            </Button>

            <Button
              variant="destructive"
              onClick={() => alert("Hapus jadwal")}
              className="flex items-center gap-2"
            >
              <Trash2 size={16} />
              Hapus
            </Button>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
