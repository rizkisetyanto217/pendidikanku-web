import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import { useEffect, useMemo } from "react";
import {
  BookText,
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
  FileCheck2,
  IdCard,
  ListChecks,
  NotebookPen,
  Pencil,
  RefreshCcw,
  School,
  UserCheck,
  UserCircle,
  UsersRound,
  Wallet,
} from "lucide-react";
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

  /* ===============================
      MENU GRID BERKELOMPOK
  =============================== */
  const groups = useMemo(
    () => [

      /* ===== Kelas ===== */
      {
        title: "Kelas",
        items: [
          { key: "kelas-saya", label: "Kelas Saya", to: "kelas-saya", icon: <School /> },
          { key: "progress", label: "Progress", to: "progress", icon: <ListChecks /> },
          { key: "tugas", label: "Tugas", to: "tugas", icon: <Pencil /> },
          { key: "ujian", label: "Ujian", to: "ujian", icon: <FileCheck2 /> },
          { key: "kontak", label: "Kontak", to: "kontak", icon: <UsersRound /> },

          /* Detail kelas (requiresParam) */
          {
            key: "kelas-materi",
            label: "Materi",
            icon: <BookText />,
            requiresParam: true,
            note: "Buka dari Kelas Saya",
          },
          {
            key: "kelas-tugas-param",
            label: "Tugas Kelas",
            icon: <NotebookPen />,
            requiresParam: true,
            note: "Buka dari Kelas Saya",
          },
          {
            key: "kelas-quiz",
            label: "Quiz Kelas",
            icon: <ClipboardCheck />,
            requiresParam: true,
            note: "Buka dari Kelas Saya",
          },
          {
            key: "kelas-kehadiran",
            label: "Kehadiran Kelas",
            icon: <UserCheck />,
            requiresParam: true,
            note: "Buka dari Kelas Saya",
          },
        ],
      },

      /* ===== Jadwal ===== */
      {
        title: "Jadwal",
        items: [
          {
            key: "agenda",
            label: "Agenda",
            to: "agenda",
            icon: <CalendarDays />,
          },
          {
            key: "rutin",
            label: "Rutin",
            to: "rutin",
            icon: <CalendarRange />,
          },

        ],
      },

      /* ===== Administrasi ===== */
      {
        title: "Administrasi",
        items: [
          {
            key: "pendaftaran",
            label: "Pendaftaran",
            to: "pendaftaran",
            icon: <IdCard />,
          },
          {
            key: "daftar-ulang",
            label: "Daftar Ulang",
            to: "daftar-ulang",
            icon: <RefreshCcw />,
          },
          {
            key: "keuangan",
            label: "Keuangan",
            to: "keuangan",
            icon: <Wallet />,
          },
        ],
      },

      /* ===== Profil ===== */
      {
        title: "Profil",
        items: [
          {
            key: "profil-murid",
            label: "Profil Murid",
            to: "profil-murid",
            icon: <UserCircle />,
          },
        ],
      },
    ],
    []
  );

  /* ========== RENDER ========== */
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <CMainMenuGridCard key={group.title} title={group.title} items={group.items} />
      ))}
    </div>
  );
}