import { useMemo, useEffect } from "react";
import {
  Users,
  Layers,
  IdCard,
  CalendarDays,
  Settings,
  NotebookPen,
  CheckCheck,
} from "lucide-react";

/* Tambahan untuk breadcrumb sistem dashboard */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

import CMainMenuGridCard, {
  type CMenuItem,
} from "@/pages/dashboard/components/card/CMainMenuGridCard";

/* ================= Component ================= */
export default function TeacherMenuGrids() {

  /* Atur breadcrumb dan title seperti SchoolAcademic */
  const { setHeader } = useDashboardHeader();

  useEffect(() => {
    setHeader({
      title: "Menu Utama",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Menu Utama" },
      ],
      actions: null,
    });
  }, [setHeader]);

  const items: CMenuItem[] = useMemo(
    () => [
      // ===== Kelas (di bawah menu-utama) =====
      {
        key: "wali-kelas",
        label: "Wali Kelas",
        to: "wali-kelas",
        icon: <Users className="w-5 h-5" />,
      },
      {
        key: "kelas-detail",
        label: "Detail Kelas",
        icon: <Layers className="w-5 h-5" />,
        requiresParam: true,
        note: "Buka dari daftar kelas",
      },
      {
        key: "kelas-absensi",
        label: "Absensi Kelas",
        icon: <CheckCheck className="w-5 h-5" />,
        requiresParam: true,
        note: "Pilih kelas dulu",
      },
      {
        key: "kelas-tugas",
        label: "Tugas per Kelas",
        icon: <NotebookPen className="w-5 h-5" />,
        requiresParam: true,
        note: "Pilih kelas dulu",
      },

      // ===== Tugas (entry umum di menu-utama) =====
      {
        key: "tugas",
        label: "Tugas",
        to: "tugas",
        icon: <NotebookPen className="w-5 h-5" />,
      },

      // ===== Guru Mapel & Jadwal =====
      {
        key: "guru-mapel",
        label: "Guru Mapel",
        to: "guru-mapel",
        icon: <Layers className="w-5 h-5" />,
      },
      {
        key: "jadwal",
        label: "Jadwal",
        to: "jadwal",
        icon: <CalendarDays className="w-5 h-5" />,
      },

      // ===== Profil & Penilaian =====
      {
        key: "profil-guru",
        label: "Profil Guru",
        to: "profil-guru",
        icon: <IdCard className="w-5 h-5" />,
      },

      // ===== Kehadiran =====
      {
        key: "kehadiran",
        label: "Kehadiran",
        to: "kehadiran",
        icon: <CheckCheck className="w-5 h-5" />,
      },
      {
        key: "kehadiran-detail",
        label: "Detail Kehadiran",
        icon: <CheckCheck className="w-5 h-5" />,
        requiresParam: true,
        note: "Buka dari Kehadiran",
      },

      // ===== Kelola Kelas =====
      {
        key: "kelola-kelas",
        label: "Kelola Kelas",
        icon: <Layers className="w-5 h-5" />,
        requiresParam: true,
        note: "Butuh nama kelas",
      },

      // ===== QuizClass =====
      {
        key: "quiz-class-detail",
        label: "QuizClass Detail",
        to: "quizClass/detail",
        icon: <NotebookPen className="w-5 h-5" />,
      },

      // ===== Pengaturan =====
      {
        key: "pengaturan",
        label: "Pengaturan",
        icon: <Settings className="w-5 h-5" />,
        note: "Segera hadir",
      },
    ],
    []
  );

  return <CMainMenuGridCard title="Akses Cepat Guru" items={items} />;
}
