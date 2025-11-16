import { useMemo, useEffect } from "react";
import {
  CalendarDays,
  Building2,
  Layers,
  CheckCircle2,
  CreditCard,
  Banknote,
  UserCog,
  IdCard,
  BookOpen,
  LibraryBig,
  CalendarRange,
  NotebookPen,
  BookOpenCheck,
  FileText,
} from "lucide-react";

import CMainMenuGridCard, {
  type CMenuItem,
} from "@/pages/dashboard/components/card/CMainMenuGridCard";

/* Tambahan untuk breadcrumb sistem dashboard */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/** ================= Component ================= */
export default function SchoolMenuGrids() {

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
      // ======== PROFIL & KEUANGAN ========
      {
        key: "profil",
        label: "Profil Sekolah",
        to: "profil/profil-sekolah",
        icon: <IdCard />,
      },
      {
        key: "keuangan",
        label: "Keuangan",
        to: "keuangan",
        icon: <CreditCard />,
      },
      {
        key: "keu-detail",
        label: "Detail Tagihan",
        icon: <FileText />,
        requiresParam: true,
        note: "Buka dari daftar tagihan",
      },
      {
        key: "spp",
        label: "SPP",
        to: "spp",
        icon: <Banknote />,
      },

      // ======== AKADEMIK ========
      {
        key: "akademik",
        label: "Periode Akademik",
        to: "tahun-akademik",
        icon: <CalendarDays />,
      },
      {
        key: "akademik-detail",
        label: "Detail Akademik",
        icon: <NotebookPen />,
        requiresParam: true,
        note: "Buka dari Periode Akademik",
      },

      // ======== KELAS & SECTION ========
      {
        key: "kelas-all",
        label: "Seluruh Kelas",
        to: "kelas",
        icon: <Layers />,
      },
      {
        key: "kelas-aktif",
        label: "Kelas Aktif",
        to: "kelas-aktif",
        icon: <CheckCircle2 />,
      },
      {
        key: "kelas-kelola",
        label: "Kelola Kelas",
        icon: <Layers />,
        requiresParam: true,
        note: "Pilih kelas dulu",
      },
      {
        key: "section-detail",
        label: "Detail Section",
        icon: <Layers />,
        requiresParam: true,
        note: "Buka dari Kelola Kelas",
      },
      {
        key: "kelas-tingkat",
        label: "Kelas per Tingkat",
        icon: <Layers />,
        requiresParam: true,
        note: "Butuh levelId",
      },
      {
        key: "kelas-by-id",
        label: "Kelas (ID)",
        icon: <Layers />,
        requiresParam: true,
        note: "Butuh classId",
      },

      // ======== JADWAL ========
      {
        key: "jadwal",
        label: "Jadwal",
        to: "jadwal",
        icon: <CalendarRange />,
      },
      {
        key: "jadwal-detail",
        label: "Detail Jadwal",
        icon: <CalendarRange />,
        requiresParam: true,
        note: "Buka dari Jadwal",
      },

      // ======== GURU & MURID ========
      {
        key: "guru",
        label: "Guru",
        to: "profil/guru",
        icon: <UserCog />,
      },
      {
        key: "guru-detail",
        label: "Detail Guru",
        icon: <UserCog />,
        requiresParam: true,
        note: "Buka dari daftar guru",
      },

      // ======== INVENTORI AKADEMIK ========
      {
        key: "ruangan",
        label: "Ruangan",
        to: "ruangan",
        icon: <Building2 />,
      },
      {
        key: "ruangan-detail",
        label: "Detail Ruangan",
        icon: <Building2 />,
        requiresParam: true,
        note: "Buka dari Ruangan",
      },
      {
        key: "mata-pelajaran",
        label: "Mapel",
        to: "mata-pelajaran",
        icon: <LibraryBig />,
      },
      {
        key: "buku",
        label: "Buku",
        to: "buku",
        icon: <BookOpen />,
      },
      {
        key: "buku-detail",
        label: "Detail Buku",
        icon: <BookOpenCheck />,
        requiresParam: true,
        note: "Buka dari Buku",
      },

      // ======== KALENDER AKADEMIK ========
      {
        key: "kalender",
        label: "Kalender Akademik",
        to: "kalender",
        icon: <CalendarRange />,
      },
    ],
    []
  );

  return (
    <CMainMenuGridCard
      title="Akses Cepat Sekolah"
      items={items}
      columns={{ base: 3, sm: 3, md: 4, xl: 6 }}
    />
  );
}
