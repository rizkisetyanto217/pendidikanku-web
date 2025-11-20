import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* UI */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

/* ScheduleList */
import ScheduleList from "@/pages/dashboard/components/calender/ScheduleList";

/* dashboard header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

import type { ScheduleRow } from "@/pages/dashboard/components/calender/types/types";

/* =======================
   FULL DUMMY DATA
======================= */
const dummySchedules: ScheduleRow[] = [
  {
    id: "1",
    title: "Pertemuan Mingguan",
    date: "2025-01-20",
    time: "08:00",
    room: "Ruang 101",
    teacher: "Budi Setiawan",
    type: "class",
    description: "Materi: Pengenalan Bab 1 dan diskusi dasar.",
  },
  {
    id: "2",
    title: "Ujian Tengah Semester",
    date: "2025-01-20",
    time: "10:00",
    room: "Ruang 102",
    teacher: "Budi Setiawan",
    type: "exam",
    description: "UTS materi bab 1 sampai bab 3.",
  },
  {
    id: "3",
    title: "Kegiatan Presentasi",
    date: "2025-01-21",
    time: "09:00",
    room: "Aula Utama",
    teacher: "Dewi Lestari",
    type: "event",
    description: "Presentasi kelompok mengenai proyek mini.",
  },
  {
    id: "4",
    title: "Pembelajaran Lanjutan",
    date: "2025-01-22",
    time: "08:00",
    room: "Ruang 103",
    teacher: "Budi Setiawan",
    type: "class",
    description: "Materi Bab 2 dan latihan pemahaman.",
  },
  {
    id: "5",
    title: "Evaluasi Harian",
    date: "2025-01-22",
    time: "13:00",
    room: "Ruang 104",
    teacher: "Budi Setiawan",
    type: "exam",
    description: "Evaluasi cepat untuk menilai progres harian.",
  },
  {
    id: "6",
    title: "Pembelajaran Tambahan",
    date: "2025-01-23",
    time: "07:30",
    room: "Ruang 201",
    teacher: "Dewi Lestari",
    type: "class",
    description: "Pendalaman materi bab 3 secara detail.",
  },
  {
    id: "7",
    title: "Diskusi Kelompok",
    date: "2025-01-23",
    time: "11:00",
    room: "Ruang 202",
    teacher: "Budi Setiawan",
    type: "event",
    description: "Diskusi kelompok untuk persiapan ujian.",
  },
  {
    id: "8",
    title: "Ujian Bab 2",
    date: "2025-01-24",
    time: "09:00",
    room: "Ruang 103",
    teacher: "Dewi Lestari",
    type: "exam",
    description: "Ujian materi bab 2.",
  },
  {
    id: "9",
    title: "Materi Lanjutan",
    date: "2025-01-25",
    time: "08:00",
    room: "Ruang 101",
    teacher: "Budi Setiawan",
    type: "class",
    description: "Topik lanjutan: penyelesaian studi kasus.",
  },
  {
    id: "10",
    title: "Kegiatan Evaluasi Umum",
    date: "2025-01-25",
    time: "13:00",
    room: "Aula Tengah",
    teacher: "Dewi Lestari",
    type: "event",
    description: "Review rangkuman materi dan evaluasi umum.",
  },
];

export default function TeacherCSSTDailyReport() {
  const navigate = useNavigate();
  const { setHeader } = useDashboardHeader();

  // ✅ Set header via effect, bukan di body
  useEffect(() => {
    setHeader({
      title: "Laporan Harian",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Guru Mapel" },
        { label: "Laporan Harian" },
      ],
      // kalau DashboardLayout biasa pakai actions/null, sekalian aja:
      actions: null,
    });
  }, [setHeader]);

  return (
    <div className="p-4 space-y-4">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
      </Button>

      <Card>
        <CardContent className="p-4">
          <ScheduleList data={dummySchedules} loading={false} readOnly />
        </CardContent>
      </Card>
    </div>
  );
}
