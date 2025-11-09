import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
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
  ClipboardList,
  BookOpenCheck,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/** ================= Types ================= */
type MenuItem = {
  key: string;
  label: string;
  to?: string; // path yang bisa dikunjungi
  icon: LucideIcon;
  note?: string; // keterangan kecil
  requiresParam?: boolean; // true jika route aslinya butuh :id sehingga di-grid dibuat non-aktif
};

/** ================= Component ================= */
export default function SchoolMenuGrids() {
  // Mapping ini “mencerminkan” SchoolRoutes kamu.
  const items: MenuItem[] = useMemo(
    () => [
      // ======== MENU UTAMA / PROFIL & KEUANGAN ========
      {
        key: "profil",
        label: "Profil Sekolah",
        to: "profil-sekolah",
        icon: IdCard,
      },
      { key: "keuangan", label: "Keuangan", to: "keuangan", icon: CreditCard },
      {
        key: "keu-detail",
        label: "Detail Tagihan",
        icon: FileText,
        requiresParam: true,
        note: "Buka dari daftar tagihan",
      },
      { key: "spp", label: "SPP", to: "spp", icon: Banknote },

      // ======== AKADEMIK ========
      {
        key: "akademik",
        label: "Periode Akademik",
        to: "akademik",
        icon: CalendarDays,
      },
      {
        key: "akademik-detail",
        label: "Detail Akademik",
        icon: NotebookPen,
        requiresParam: true,
        note: "Buka dari Periode Akademik",
      },
      {
        key: "akademik-kelola",
        label: "Kelola Akademik",
        to: "akademik/kelola",
        icon: ClipboardList,
      },

      // ======== KELAS & SECTION ========
      { key: "kelas-all", label: "Seluruh Kelas", to: "kelas", icon: Layers },
      {
        key: "kelas-aktif",
        label: "Kelas Aktif",
        to: "kelas-aktif",
        icon: CheckCircle2,
      },
      {
        key: "kelas-kelola",
        label: "Kelola Kelas",
        icon: Layers,
        requiresParam: true,
        note: "Pilih kelas dulu",
      },
      {
        key: "section-detail",
        label: "Detail Section",
        icon: Layers,
        requiresParam: true,
        note: "Buka dari Kelola Kelas",
      },
      {
        key: "kelas-tingkat",
        label: "Kelas per Tingkat",
        icon: Layers,
        requiresParam: true,
        note: "Butuh levelId",
      },
      {
        key: "kelas-by-id",
        label: "Kelas (ID)",
        icon: Layers,
        requiresParam: true,
        note: "Butuh classId",
      },

      // ======== JADWAL ========
      { key: "jadwal", label: "Jadwal", to: "jadwal", icon: CalendarRange },
      {
        key: "jadwal-detail",
        label: "Detail Jadwal",
        icon: CalendarRange,
        requiresParam: true,
        note: "Buka dari Jadwal",
      },

      // ======== GURU & MURID ========
      { key: "guru", label: "Guru", to: "guru", icon: UserCog },
      {
        key: "guru-detail",
        label: "Detail Guru",
        icon: UserCog,
        requiresParam: true,
        note: "Buka dari daftar guru",
      },

      // ======== AKADEMIK: INVENTORI ========
      {
        key: "ruangan",
        label: "Ruangan",
        to: "ruangan",
        icon: Building2,
      },
      {
        key: "ruangan-detail",
        label: "Detail Ruangan",
        icon: Building2,
        requiresParam: true,
        note: "Buka dari Ruangan",
      },
      {
        key: "pelajaran",
        label: "Pelajaran",
        to: "pelajaran",
        icon: LibraryBig,
      },
      { key: "buku", label: "Buku", to: "buku", icon: BookOpen },
      {
        key: "buku-detail",
        label: "Detail Buku",
        icon: BookOpenCheck,
        requiresParam: true,
        note: "Buka dari Buku",
      },

      // ======== KALENDER AKADEMIK ========
      {
        key: "kalender",
        label: "Kalender Akademik",
        to: "kalender",
        icon: CalendarRange,
      },
    ],
    []
  );

  return (
    <div className="w-full">
      <main className="w-full">
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-6 p-4 md:p-6">
          <div className="mb-2 font-semibold text-lg">Akses Cepat</div>

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {items.map((it) => (
              <MenuTile key={it.key} item={it} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

/** ================= Tile ================= */
function MenuTile({ item }: { item: MenuItem }) {
  const Icon = item.icon;

  const Inner = (
    <Card
      className={[
        "h-full transition-transform focus-visible:outline-none",
        item.requiresParam
          ? "opacity-60"
          : "hover:scale-[1.02] active:scale-[0.99]",
      ].join(" ")}
      aria-disabled={item.requiresParam ? true : undefined}
      title={
        item.requiresParam
          ? item.note ?? "Halaman ini butuh parameter"
          : undefined
      }
    >
      <CardContent className="p-3 md:p-4 h-full flex flex-col items-center justify-center text-center gap-2">
        <span
          className="h-12 w-12 md:h-14 md:w-14 grid place-items-center rounded-xl bg-primary/10 text-primary"
          aria-hidden
        >
          <Icon size={22} />
        </span>
        <div className="text-sm md:text-sm font-medium leading-tight line-clamp-2">
          {item.label}
        </div>
        {item.note && (
          <div className="text-[11px] md:text-xs text-muted-foreground">
            {item.note}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Jika route butuh param, jadikan non-klik; selain itu pakai <Link />
  if (item.requiresParam || !item.to) {
    return (
      <div
        className="block rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-not-allowed"
        aria-label={item.label}
        role="button"
        tabIndex={-1}
      >
        {Inner}
      </div>
    );
  }

  return (
    <Link
      to={item.to}
      className="block rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={item.label}
    >
      {Inner}
    </Link>
  );
}
