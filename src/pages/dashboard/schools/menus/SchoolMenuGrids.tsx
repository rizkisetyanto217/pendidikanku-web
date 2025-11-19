import { useMemo, useEffect } from "react";
import {
  CalendarDays,
  Layers,
  CheckCircle2,
  Banknote,
  IdCard,
  BookOpen,
  CalendarRange,
  School,
  Wallet,
  CalendarClock,
  ListTree,
  User,
  DoorClosed,
  BookOpenText,
  Settings,
  HeartHandshake,
} from "lucide-react";

import CMainMenuGridCard, {
} from "@/pages/dashboard/components/card/CMainMenuGridCard";

/* Tambahan breadcrumb */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

export default function SchoolMenuGrids() {
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

  /* =============================== */
  /*    MENU GRID BERKELOMPOK        */
  /* =============================== */
  const groups = useMemo(
    () => [
      /* ========= PROFIL ========= */
      {
        title: "Profil",
        items: [
          {
            key: "profil",
            label: "Sekolah",
            to: "profil/profil-sekolah",
            icon: <School />,
          },
          {
            key: "guru",
            label: "Guru",
            to: "profil/guru",
            icon: <User />,
          },
        ],
      },

      /* ========= AKADEMIK ========= */
      {
        title: "Akademik",
        items: [
          {
            key: "periode",
            label: "Tahun Akademik",
            to: "tahun-akademik",
            icon: <CalendarClock />,
          },
          {
            key: "ruangan",
            label: "Ruangan",
            to: "ruangan",
            icon: <DoorClosed />,
          },
          {
            key: "buku",
            label: "Buku",
            to: "buku",
            icon: <BookOpen />,
          },
          {
            key: "mapel",
            label: "Mata Pelajaran",
            to: "mata-pelajaran",
            icon: <BookOpenText />,
          },
        ],
      },

      /* ========= KELAS ========= */
      {
        title: "Kelas",
        items: [
          {
            key: "level",
            label: "Level",
            to: "level",
            icon: <ListTree />,
          },
          {
            key: "kelas-daftar",
            label: "Daftar Kelas",
            to: "daftar-kelas",
            icon: <Layers />,
          },
          {
            key: "kelas-semua",
            label: "Semua Kelas",
            to: "semua-kelas",
            icon: <CheckCircle2 />,
          },
          {
            key: "kelas-pelajaran",
            label: "Pelajaran",
            to: "pelajaran",
            icon: <BookOpenText />,
          },
        ],
      },

      /* ========= KEUANGAN ========= */
      {
        title: "Keuangan",
        items: [
          {
            key: "keuangan",
            label: "Keuangan Sekolah",
            to: "keuangan",
            icon: <Wallet />,
          },
          {
            key: "spp",
            label: "SPP",
            to: "spp",
            icon: <Banknote />,
          },
        ],
      },

      /* ========= JADWAL ========= */
      {
        title: "Jadwal",
        items: [
          {
            key: "jadwal",
            label: "Agenda",
            to: "agenda",
            icon: <CalendarDays />,
          },
          {
            key: "jadwal-rutin",
            label: "Jadwal Rutin",
            to: "rutin",
            icon: <CalendarRange />,
          },
        ],
      },

      /* ========= PENDAFTARAN ========= */
      {
        title: "Pendaftaran",
        items: [
          {
            key: "pendaftaran",
            label: "Periode",
            to: "pendaftaran",
            icon: <IdCard />,
          },
          {
            key: "pendaftaran-murid",
            label: "Murid",
            to: "pendaftaran/murid",
            icon: <User />,
          },
          {
            key: "pengaturan-daftar",
            label: "Pengaturan",
            to: "pendaftaran/pengaturan",
            icon: <Settings />,
          },
        ],
      },

      /* ========= DUKUNGAN ========= */
      {
        title: "Dukungan",
        items: [
          {
            key: "donasi",
            label: "Donasi",
            to: "donasi",
            icon: <HeartHandshake />,
          },
        ],
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <CMainMenuGridCard
          key={group.title}
          title={group.title}
          items={group.items}
        />
      ))}
    </div>
  );
}
