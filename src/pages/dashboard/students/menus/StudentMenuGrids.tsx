import { useMemo } from "react";
import {
  BookOpen,
  Wallet,
  CalendarDays,
  IdCard,
  FileText,
  BadgeCheck,
  UserCheck,
  StickyNote,
  ListChecks,
  NotebookPen,
  FileStack,
  BookText,
} from "lucide-react";

import CMainMenuGridCard, {
  type CMenuItem,
} from "@/pages/dashboard/components/card/CMainMenuGridCard";

/* ================= Components ================= */
export default function StudentMenuGrids() {
  const items: CMenuItem[] = useMemo(
    () => [
      // ===== Menu utama (lokal) =====
      { key: "kelas-saya", label: "Kelas Saya", to: "kelas-saya", icon: <BookOpen /> },
      { key: "keuangan", label: "Pembayaran", to: "keuangan", icon: <Wallet /> },
      { key: "jadwal-local", label: "Jadwal", to: "jadwal", icon: <CalendarDays /> },
      { key: "profil", label: "Profil Murid", to: "profil-murid", icon: <IdCard /> },

      // ===== Root pages (/murid/*) =====
      { key: "tugas", label: "Daftar Tugas", to: "tugas", icon: <NotebookPen /> },
      { key: "keuangan-list", label: "Daftar Tagihan", to: "keuangan", icon: <FileStack /> },

      // ===== Progress cluster =====
      { key: "progress", label: "Progress Akademik", to: "progress", icon: <ListChecks /> },
      { key: "raport", label: "Raport", to: "progress/raport", icon: <FileText /> },
      { key: "absensi", label: "Absensi", to: "progress/absensi", icon: <UserCheck /> },
      { key: "catatan-hasil", label: "Catatan Hasil", to: "progress/catatan-hasil", icon: <StickyNote /> },

      // ===== Jadwal root (duplikasi aman: versi root) =====
      { key: "jadwal-root", label: "Jadwal (Root)", to: "jadwal", icon: <CalendarDays /> },

      // ===== Halaman dengan param (:id) =====
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
