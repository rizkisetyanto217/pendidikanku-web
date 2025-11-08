// src/constants/navs.ts
import {
  LayoutDashboard,
  Users,
  UserCog,
  BookOpen,
  Wallet,
  ClipboardCheck,
  FileSpreadsheet,
  CalendarDays,
  ChartBar,
  School,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavChild = {
  path: string; // relatif ke parent, tanpa leading slash, contoh: "terms"
  label: string;
  end?: boolean; // opsional: untuk exact match
};

export type NavItem = {
  path: "" | "." | string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  children?: NavChild[]; // ← tambahkan ini
};

export type NavDict = {
  sekolah: NavItem[];
  murid: NavItem[];
  guru: NavItem[];
};

export const NAVS: NavDict = {
  sekolah: [
    { path: "", label: "Dashboard", icon: LayoutDashboard, end: true },
    { path: "menu-utama", label: "Menu Utama", icon: ChartBar },
    { path: "guru", label: "Guru", icon: UserCog },
    { path: "kelas", label: "Kelas", icon: BookOpen },
    { path: "buku", label: "Buku", icon: BookOpen },
    {
      path: "akademik",
      label: "Akademik",
      icon: FileSpreadsheet,
      // ↓ contoh anak path (semua relatif ke "akademik")
      children: [
        { path: "terms", label: "Tahun Ajaran" },
        { path: "mapel", label: "Mata Pelajaran" },
        { path: "kelas-section", label: "Kelas & Section" },
        { path: "kalender", label: "Kalender Akademik" },
      ],
    },
    { path: "keuangan", label: "Keuangan", icon: Wallet },
    { path: "profil-sekolah", label: "Profil", icon: School },
  ],
  murid: [
    { path: "", label: "Dashboard", icon: LayoutDashboard, end: true },
    { path: "menu-utama", label: "Menu Utama", icon: ChartBar },
    { path: "progress", label: "Progress", icon: ClipboardCheck },
    { path: "keuangan", label: "Pembayaran", icon: Wallet },
    { path: "jadwal", label: "Jadwal", icon: CalendarDays },
    { path: "tugas", label: "Tugas", icon: ClipboardCheck },
    { path: "profil-murid", label: "Profil", icon: Users },
  ],
  guru: [
    { path: "", label: "Dashboard", icon: LayoutDashboard, end: true },
    { path: "menu-utama", label: "Menu Utama", icon: ChartBar },
    { path: "wali-kelas", label: "Wali Kelas", icon: Users },
    { path: "guru-mapel", label: "Guru Mapel", icon: UserCog },
    { path: "jadwal", label: "Jadwal", icon: CalendarDays },
    { path: "profil-guru", label: "Profil", icon: Users },
  ],
};