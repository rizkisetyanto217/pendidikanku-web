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
  HeartHandshake,
  Building2,
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
  unassigned: NavItem[];
};

export const NAVS: NavDict = {
  /* =========================================================
   * SEKOLAH (admin/dkm/staff)
   * base: /:school_slug/sekolah
   * =======================================================*/
  sekolah: [
    // DASHBOARD
    {
      path: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      end: true, // /sekolah/dashboard
    },

    // Menu utama umum
    {
      path: "menu-utama",
      label: "Menu Utama",
      icon: ChartBar, // /sekolah/menu-utama
    },

    // 1) PROFIL
    {
      path: "profil",
      label: "Profil",
      icon: School,
      children: [
        {
          // profil sekolah (route existing: /sekolah/profil-sekolah)
          path: "profil-sekolah",
          label: "Sekolah",
          end: true,
        },
        {
          // daftar guru -> /sekolah/guru
          path: "guru",
          label: "Guru",
        },
      ],
    },

    // 2) AKADEMIK
    {
      path: "akademik",
      label: "Akademik",
      icon: FileSpreadsheet,
      children: [
        {
          // Index akademik -> /sekolah/akademik
          path: "tahun-akademik",
          label: "Tahun Akademik",
          end: true,
        },
        // Tiga item berikut diarahkan ke rute yang sudah ada (di luar /akademik)
        {
          path: "ruangan",
          label: "Ruangan",
        },
        {
          path: "buku",
          label: "Buku",
        },
        {
          path: "mata-pelajaran",
          label: "Mata Pelajaran",
        },
      ],
    },

    // 3) KELAS
    {
      path: "kelas",
      label: "Kelas",
      icon: BookOpen,
      children: [
        {
          // index kelas -> /sekolah/kelas
          path: "level",
          label: "Level",
          end: true,
        },
        {
          // -> /sekolah/kelas/daftar-kelas
          path: "daftar-kelas",
          label: "Daftar Kelas",
        },
        {
          // -> /sekolah/kelas/semua-kelas
          path: "semua-kelas",
          label: "Semua Kelas",
        },
        {
          // -> /sekolah/kelas/pelajaran
          path: "pelajaran",
          label: "Pelajaran",
        },
      ],
    },

    // 4) KEUANGAN
    {
      path: "keuangan",
      label: "Keuangan",
      icon: Wallet,
      children: [
        {
          // SPP route existing: /sekolah/spp (di luar /keuangan)
          path: "spp",
          label: "SPP",
        },
        {
          // index keuangan -> /sekolah/keuangan
          path: "lainnya",
          label: "Lainnya",
          end: true,
        },
        // kalau nanti ada /sekolah/keuangan/pengaturan:
        // { path: "pengaturan", label: "Pengaturan" }
      ],
    },

    // 5) JADWAL
    {
      path: "jadwal",
      label: "Jadwal",
      icon: CalendarDays,
      children: [
        {
          // -> /sekolah/jadwal/agenda
          path: "agenda",
          label: "Agenda",
        },
        {
          // -> /sekolah/jadwal/rutin
          path: "rutin",
          label: "Rutin",
        },
      ],
    },

    // 6) PENDAFTARAN
    {
      path: "pendaftaran",
      label: "Pendaftaran",
      icon: ClipboardCheck,
      children: [
        {
          // index -> /sekolah/pendaftaran
          path: "",
          label: "Periode",
          end: true,
        },
        {
          // -> /sekolah/pendaftaran/murid
          path: "murid",
          label: "Murid",
        },
        {
          // -> /sekolah/pendaftaran/pengaturan
          path: "pengaturan",
          label: "Pengaturan",
        },
      ],
    },

    // 7) DUKUNGAN
    {
      path: "dukungan",
      label: "Dukungan",
      icon: HeartHandshake,
      children: [
        {
          // index -> /sekolah/dukungan
          path: "donasi",
          label: "Donasi",
          end: true,
        },
      ],
    },
  ],

  /* =========================================================
   * MURID
   * base: /:school_slug/murid
   * =======================================================*/
  murid: [
    {
      path: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      end: true, // /murid/dashboard
    },
    {
      path: "menu-utama",
      label: "Menu Utama",
      icon: ChartBar, // /murid/menu-utama
    },

    {
      path: "kelas",
      label: "Kelas",
      icon: School,
      children: [
        {
          // -> /murid/kelas-saya
          path: "kelas-saya",
          label: "Kelas Saya",
        },
        {
          // -> /murid/progress
          path: "progress",
          label: "Progress",
        },
        {
          // -> /murid/tugas
          path: "tugas",
          label: "Tugas",
        },
        {
          // -> /murid/ujian
          path: "ujian",
          label: "Ujian",
        },
        {
          // -> /murid/kontak
          path: "kontak",
          label: "Kontak",
        },
      ],
    },

    {
      path: "jadwal",
      label: "Jadwal",
      icon: CalendarDays,
      children: [
        {
          // -> /murid/jadwal/agenda
          path: "agenda",
          label: "Agenda",
        },
        {
          // -> /murid/jadwal/rutin
          path: "rutin",
          label: "Rutin",
        },
      ],
    },

    {
      path: "administrasi",
      label: "Administrasi",
      icon: Building2,
      children: [
        {
          // -> /murid/pendaftaran
          path: "pendaftaran",
          label: "Pendaftaran",
        },
        {
          // -> /murid/daftar-ulang
          path: "daftar-ulang",
          label: "Daftar Ulang",
        },
        {
          // -> /murid/keuangan
          path: "keuangan",
          label: "Keuangan",
        },
        {
          // kalau mau beda page list:
          // -> /murid/keuangan/list
          path: "keuangan-list",
          label: "Keuangan List",
        },
      ],
    },

    {
      path: "profil-murid",
      label: "Profil",
      icon: Users, // /murid/profil-murid
    },
  ],

  /* =========================================================
   * GURU
   * base: /:school_slug/guru
   * =======================================================*/
  guru: [
    {
      path: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      end: true, // /guru/dashboard
    },
    {
      path: "menu-utama",
      label: "Menu Utama",
      icon: ChartBar, // /guru/menu-utama
    },
    {
      path: "wali-kelas",
      label: "Wali Kelas",
      icon: Users, // /guru/wali-kelas
    },
    {
      path: "guru-mapel",
      label: "Guru Mapel",
      icon: UserCog, // /guru/guru-mapel
    },
    {
      path: "jadwal",
      label: "Jadwal",
      icon: CalendarDays,
      children: [
        {
          // -> /guru/jadwal/agenda
          path: "agenda",
          label: "Agenda",
        },
        {
          // -> /guru/jadwal/rutin
          path: "rutin",
          label: "Rutin",
        },
      ],
    },
    {
      path: "profil-guru",
      label: "Profil",
      icon: Users, // /guru/profil-guru
    },
  ],

  /* =========================================================
   * UNASSIGNED (sudah login, punya membership, tapi belum ada role)
   * base biasanya tetap /:school_slug/sekolah
   * =======================================================*/
  unassigned: [
    {
      path: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      end: true, // /sekolah/dashboard
    },
    {
      path: "menu-utama",
      label: "Menu Utama",
      icon: ChartBar, // /sekolah/menu-utama
    },
    {
      path: "profil",
      label: "Profil",
      icon: Users, // misal: /sekolah/profil (profil user di sekolah)
    },
    {
      path: "administrasi",
      label: "Administrasi",
      icon: ClipboardCheck,
      children: [
        {
          // -> /sekolah/pendaftaran
          path: "pendaftaran",
          label: "Pendaftaran",
          to: "pendaftaran",
        },
        {
          // -> /sekolah/keuangan
          path: "keuangan",
          label: "Keuangan",
          to: "keuangan",
        },
      ],
    },
    {
      path: "dukungan",
      label: "Dukungan",
      icon: HeartHandshake,
      children: [
        {
          // -> /sekolah/dukungan
          path: "",
          label: "Donasi",
          end: true,
        },
      ],
    },
  ],
};