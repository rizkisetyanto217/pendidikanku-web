import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import type { CMenuItem } from "../../components/card/CMainMenuGridCard";
import { useEffect, useMemo } from "react";
import { BadgeCheck, BookOpen, BookText, CalendarDays, FileStack, FileText, IdCard, ListChecks, NotebookPen, StickyNote, UserCheck, Wallet } from "lucide-react";
import CMainMenuGridCard from "../../components/card/CMainMenuGridCard";

export default function StudentMenuGrids() {
  const { setHeader } = useDashboardHeader();

  useEffect(() => {
    setHeader({
      title: "Menu Utama",
      breadcrumbs: [
        { label: "Dashboard", href: "/murid/dashboard" },
        { label: "Menu Utama" },
      ],
      actions: null,
    });
  }, [setHeader]);

  const items: CMenuItem[] = useMemo(
    () => [
      // ======================
      // MENU UTAMA (lokal /menu-utama)
      // ======================
      { key: "kelas-saya", label: "Kelas Saya", to: "kelas-saya", icon: <BookOpen /> },
      { key: "keuangan", label: "Pembayaran", to: "keuangan", icon: <Wallet /> },
      { key: "jadwal-local", label: "Jadwal", to: "jadwal", icon: <CalendarDays /> },
      { key: "profil", label: "Profil Murid", to: "profil-murid", icon: <IdCard /> },

      // ======================
      // ROOT ROUTES (/murid/*)
      // ======================
      { key: "tugas", label: "Daftar Tugas", to: "tugas", icon: <NotebookPen /> },
      { key: "tagihan", label: "Daftar Tagihan", to: "/keuangan-list", icon: <FileStack /> },

      // ======================
      // PROGRESS AKADEMIK (lokal menu-utama)
      // ======================
      { key: "progress", label: "Progress Akademik", to: "progress", icon: <ListChecks /> },
      { key: "raport", label: "Raport", to: "raport", icon: <FileText /> },
      { key: "absensi", label: "Absensi", to: "absensi", icon: <UserCheck /> },
      { key: "catatan-hasil", label: "Catatan Hasil", to: "catatan-hasil", icon: <StickyNote /> },

      // ======================
      // JADWAL ROOT (/murid/jadwal)
      // ======================
      { key: "jadwal-root", label: "Jadwal", to: "jadwal", icon: <CalendarDays /> },

      // ======================
      // DETAIL KELAS (butuh param)
      // ======================
      {
        key: "kelas-materi",
        label: "Materi Kelas",
        icon: <BookText />,
        requiresParam: true,
        note: "Buka dari ‘Kelas Saya’",
      },
      {
        key: "kelas-tugas",
        label: "Tugas Kelas",
        icon: <NotebookPen />,
        requiresParam: true,
        note: "Buka dari ‘Kelas Saya’",
      },
      {
        key: "kelas-quiz",
        label: "Quiz Kelas",
        icon: <BadgeCheck />,
        requiresParam: true,
        note: "Buka dari ‘Kelas Saya’",
      },
      {
        key: "kelas-kehadiran",
        label: "Kehadiran Kelas",
        icon: <UserCheck />,
        requiresParam: true,
        note: "Buka dari ‘Kelas Saya’",
      },
    ],
    []
  );

  return <CMainMenuGridCard title="Akses Cepat Murid" items={items} />;
}
