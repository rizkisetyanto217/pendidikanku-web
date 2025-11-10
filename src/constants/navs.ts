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
  /** Relatif ke parent.path (tanpa leading slash) */
  path: string;
  label: string;
  end?: boolean;
  /** ABSOLUTE/relatif custom override — kalau diisi, pakai ini untuk navigasi */
  to?: string;
};

export type NavItem = {
  /** Relatif terhadap root "/sekolah" (tanpa leading slash) */
  path: "" | "." | string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  children?: NavChild[];
};

export type NavDict = {
  sekolah: NavItem[];
  murid: NavItem[];
  guru: NavItem[];
};

export const NAVS: NavDict = {
  sekolah: [
    // DASHBOARD
    { path: "dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },

    // (Opsional) Menu Utama tetap ada bila mau ditampilkan
    { path: "menu-utama", label: "Menu Utama", icon: ChartBar },
    // 1) PROFIL
    {
      path: "profil",
      label: "Profil",
      icon: School,
      children: [
        { path: "profil-sekolah", label: "Sekolah", end: true }, // → /sekolah/profil-sekolah
        { path: "guru", label: "Guru", to: "guru" }, // → /sekolah/guru
      ],
    },

    // 2) AKADEMIK
    {
      path: "akademik",
      label: "Akademik",
      icon: FileSpreadsheet,
      children: [
        // Tahun Akademik memang index-nya halaman akademik
        { path: "tahun-akademik", label: "Tahun Akademik", end: true }, // → /sekolah/akademik
        // Tiga item berikut diarahkan ke rute yang sudah ada (di luar /akademik)
        { path: "ruangan", label: "Ruangan", to: "ruangan" }, // → /sekolah/menu-utama/ruangan
        { path: "buku", label: "Buku", to: "buku" }, // → /sekolah/buku
        {
          path: "mata-pelajaran",
          label: "Mata Pelajaran",
          to: "mata-pelajaran",
        }, // → /sekolah/menu-utama/pelajaran
      ],
    },

    // 3) KELAS
    {
      path: "kelas",
      label: "Kelas",
      icon: BookOpen,
      children: [
        { path: "data-kelas", label: "Data Kelas", end: true }, // → /sekolah/kelas
        {
          path: "daftar-kelas",
          label: "Daftar Kelas",
          to: "menu-utama/kelas-aktif",
        }, // → /sekolah/menu-utama/kelas-aktif
      ],
    },

    // 4) KEUANGAN
    {
      path: "keuangan",
      label: "Keuangan",
      icon: Wallet,
      children: [
        { path: "spp", label: "SPP", to: "spp" }, // → /sekolah/spp
        { path: "lainnya", label: "Lainnya", end: true }, // → /sekolah/keuangan
        // kalau nanti ada route khusus pengaturan keuangan, ganti to: "keuangan/pengaturan"
        { path: "pengaturan", label: "Pengaturan", to: "keuangan" },
      ],
    },

    // 5) JADWAL
    {
      path: "jadwal",
      label: "Jadwal",
      icon: CalendarDays,
    },

    // 6) PENDAFTARAN
    {
      path: "pendaftaran",
      label: "Pendaftaran",
      icon: ClipboardCheck,
      children: [
        { path: "", label: "Periode", end: true }, // → /sekolah/pendaftaran
        { path: "murid", label: "Murid" }, // → /sekolah/pendaftaran/murid
        { path: "pengaturan", label: "Pengaturan" }, // → /sekolah/pendaftaran/pengaturan
      ],
    },
  ],

  // tetap
  murid: [
    { path: "dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
    { path: "menu-utama", label: "Menu Utama", icon: ChartBar },
    // 3) KELAS
    {
      path: "kelas",
      label: "Kelas",
      icon: BookOpen,
      children: [
        { path: "progress", label: "Progress", to: "progress" },
        {
          path: "tugas",
          label: "Tugas",
          to: "tugas",
        },
        {
          path: "ujian",
          label: "Ujian",
          to: "ujian",
        },
        {
          path: "kontak",
          label: "Kontak",
          to: "kontak",
        },
      ],
    },
    { path: "keuangan", label: "Pembayaran", icon: Wallet },
    { path: "jadwal", label: "Jadwal", icon: CalendarDays },
    { path: "tugas", label: "Tugas", icon: ClipboardCheck },
    { path: "profil-murid", label: "Profil", icon: Users },
  ],
  guru: [
    { path: "dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
    { path: "menu-utama", label: "Menu Utama", icon: ChartBar },
    { path: "wali-kelas", label: "Wali Kelas", icon: Users },
    { path: "guru-mapel", label: "Guru Mapel", icon: UserCog },
    { path: "jadwal", label: "Jadwal", icon: CalendarDays },
    { path: "profil-guru", label: "Profil", icon: Users },
  ],
};