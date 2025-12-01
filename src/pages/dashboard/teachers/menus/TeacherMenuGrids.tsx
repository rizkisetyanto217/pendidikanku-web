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

import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

import CMainMenuGridCard, {
} from "@/pages/dashboard/components/card/CMainMenuGridCard";

export default function TeacherMenuGrids() {
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

  /* =========================== */
  /*        GROUPED MENU         */
  /* =========================== */

  const groups = useMemo(
    () => [
      /* ========= WALI KELAS ========= */
      {
        title: "Wali Kelas",
        items: [
          {
            key: "wali-kelas",
            label: "Wali Kelas",
            to: "wali-kelas",
            icon: <Users className="w-5 h-5" />,
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
        ],
      },

      /* ========= GURU MAPEL ========= */
      {
        title: "Guru Mapel",
        items: [
          {
            key: "guru-mapel",
            label: "Guru Mapel",
            to: "guru-mapel",
            icon: <Layers className="w-5 h-5" />,
          },
        ],
      },

      /* ========= JADWAL ========= */
      {
        title: "Jadwal",
        items: [
          {
            key: "jadwal-agenda",
            label: "Jadwal Agenda",
            to: "agenda",
            icon: <CalendarDays className="w-5 h-5" />,
          },
          {
            key: "jadwal-rutin",
            label: "Jadwal Rutin",
            to: "rutin",
            icon: <CalendarDays className="w-5 h-5" />,
          },
        ],
      },

      /* ========= PROFIL ========= */
      {
        title: "Profil",
        items: [
          {
            key: "profil-guru",
            label: "Profil Guru",
            to: "profil-guru",
            icon: <IdCard className="w-5 h-5" />,
          },
          {
            key: "kehadiran",
            label: "Kehadiran",
            to: "kehadiran",
            icon: <CheckCheck className="w-5 h-5" />,
          },
          {
            key: "pengaturan",
            label: "Pengaturan",
            icon: <Settings className="w-5 h-5" />,
            note: "Segera hadir",
          },
        ],
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <CMainMenuGridCard key={group.title} title={group.title} items={group.items} />
      ))}
    </div>
  );
}
