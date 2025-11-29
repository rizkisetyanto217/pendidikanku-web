import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* UI */
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

/* ScheduleList */
import ScheduleList from "@/pages/dashboard/components/calender/ScheduleList";

/* dashboard header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

import type { ScheduleRow } from "@/pages/dashboard/components/calender/types/types";

/* =======================
   FULL DUMMY DATA
======================= */
export const dummySchedules: ScheduleRow[] = [
  {
    id: "1",
    title: "Pertemuan Mingguan",
    date: "2025-01-20",
    time: "08:00",
    room: "Ruang 101",
    teacher: "Budi Setiawan",
    type: "class",
    description: "Materi: Pengenalan Bab 1 dan diskusi dasar.",
    status: "present",
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
    status: "present",
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
    status: "absent",
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
    status: "absent",
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
    status: "present",
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
    status: "present",
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
    status: "present",
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
    status: "present",
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
    status: "present",
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
    status: "absent",
  },
];

export default function StudentCSSTDailyReport() {
  const navigate = useNavigate();
  const { setHeader } = useDashboardHeader();

  // Set header via effect, bukan di body
  useEffect(() => {
    setHeader({
      title: "Laporan Harian",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Guru Mapel" },
        { label: "Detail Mapel", href: "guru mapel/detail mapel" },
        { label: "Laporan Harian" },
      ],
      // kalau DashboardLayout biasa pakai actions/null, sekalian aja:
      actions: null,
    });
  }, [setHeader]);

  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <div className="md:flex hidden gap-3 items-center">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold md:text-xl">Laporan Harian</h1>
      </div>
      <CardContent className="p-4">
        <ScheduleList
          data={dummySchedules}
          loading={false}
          hideRowActions={true}       // ICON EDIT/HAPUS HILANG
          onEdit={(row) => navigate(`${row.id}`)}
        />

      </CardContent>
    </div >

  );
}
