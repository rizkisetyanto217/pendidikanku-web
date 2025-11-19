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
    {
      path: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      end: true,
    },

    // (Opsional) Menu Utama tetap ada bila mau ditampilkan
    {
      path: "menu-utama",
      label: "Menu Utama",
      icon: ChartBar,
    },
    // 1) PROFIL
    {
      path: "profil",
      label: "Profil",
      icon: School,
      children: [
        {
          path: "profil-sekolah",
          label: "Sekolah",
          end: true,
        }, // → /sekolah/profil-sekolah
        {
          path: "guru",
          label: "Guru",
          to: "guru",
        }, // → /sekolah/guru
      ],
    },

    // 2) AKADEMIK
    {
      path: "akademik",
      label: "Akademik",
      icon: FileSpreadsheet,
      children: [
        // Tahun Akademik memang index-nya halaman akademik
        {
          path: "tahun-akademik",
          label: "Tahun Akademik",
          end: true,
        }, // → /sekolah/akademik
        // Tiga item berikut diarahkan ke rute yang sudah ada (di luar /akademik)
        {
          path: "ruangan",
          label: "Ruangan",
          to: "ruangan",
        }, // → /sekolah/menu-utama/ruangan
        {
          path: "buku",
          label: "Buku",
          to: "buku",
        }, // → /sekolah/buku
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
        {
          path: "level",
          label: "Level",
          end: true,
        }, // → /sekolah/kelas
        {
          path: "daftar-kelas",
          label: "Daftar Kelas",
          to: "daftar-kelas",
        }, // → /sekolah/kelas/akademik
        {
          path: "semua-kelas",
          label: "Semua Kelas",
          to: "semua-kelas",
        }, // → /sekolah/kelas/kelas
        {
          path: "pelajaran",
          label: "Pelajaran",
          to: "pelajaran",
        }, // → /sekolah/kelas/pelajaran
      ],
    },

    // 4) KEUANGAN
    {
      path: "keuangan",
      label: "Keuangan",
      icon: Wallet,
      children: [
        {
          path: "spp",
          label: "SPP",
          to: "spp",
        }, // → /sekolah/spp
        {
          path: "lainnya",
          label: "Lainnya",
          end: true,
        }, // → /sekolah/keuangan
        // kalau nanti ada route khusus pengaturan keuangan, ganti to: "keuangan/pengaturan"
      ],
    },

    // 3) KELAS
    {
      path: "jadwal",
      label: "Jadwal",
      icon: CalendarDays,
      children: [
        {
          path: "agenda",
          label: "Agenda",
          to: "agenda",
        },
        {
          path: "rutin",
          label: "Rutin",
          to: "rutin",
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
          path: "",
          label: "Periode",
          end: true,
        }, // → /sekolah/pendaftaran
        {
          path: "murid",
          label: "Murid",
        }, // → /sekolah/pendaftaran/murid
        {
          path: "pengaturan",
          label: "Pengaturan",
        }, // → /sekolah/pendaftaran/pengaturan
      ],
    },

    // 6) DUKUNGAN
    {
      path: "dukungan",
      label: "Dukungan",
      icon: HeartHandshake,
      children: [
        {
          path: "donasi",
          label: "Donasi",
          end: true,
        }, // → /sekolah/dukungan
      ],
    },
  ],

  // tetap
  murid: [
    {
      path: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      path: "menu-utama",
      label: "Menu Utama",
      icon: ChartBar,
    },
    // 3) KELAS
    {
      path: "kelas",
      label: "Kelas",
      icon: BookOpen,
      children: [
        {
          path: "kelas-saya",
          label: "Kelas Saya",
          to: "kelas-saya",
        },
        {
          path: "progress",
          label: "Progress",
          to: "progress",
        },
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
    // 3) KELAS
    {
      path: "jadwal",
      label: "Jadwal",
      icon: CalendarDays,
      children: [
        {
          path: "agenda",
          label: "Agenda",
          to: "agenda",
        },
        {
          path: "rutin",
          label: "Rutin",
          to: "rutin",
        },
      ],
    },
    {
      path: "Administrasi",
      label: "Administrasi",
      icon: CalendarDays,
      children: [
        {
          path: "pendaftaran",
          label: "Pendaftaran",
          to: "pendaftaran",
        },
        {
          path: "daftar-ulang",
          label: "Daftar Ulang",
          to: "daftar-ulang",
        },
        {
          path: "Keuangan",
          label: "Keuangan",
          to: "keuangan",
        },
        {
          path: "keuangan-list",
          label: "Keuangan List",
          to: "keuangan",
        },
      ],
    },

    {
      path: "profil-murid",
      label: "Profil",
      icon: Users,
    },
  ],
  guru: [
    {
      path: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      path: "menu-utama",
      label: "Menu Utama",
      icon: ChartBar,
    },
    {
      path: "wali-kelas",
      label: "Wali Kelas",
      icon: Users,
    },
    {
      path: "guru-mapel",
      label: "Guru Mapel",
      icon: UserCog,
    },
    // 3) KELAS
    {
      path: "jadwal",
      label: "Jadwal",
      icon: CalendarDays,
      children: [
        {
          path: "agenda",
          label: "Agenda",
          to: "agenda",
        },
        {
          path: "rutin",
          label: "Rutin",
          to: "rutin",
        },
      ],
    },
    {
      path: "profil-guru",
      label: "Profil",
      icon: Users,
    },
  ],
};
