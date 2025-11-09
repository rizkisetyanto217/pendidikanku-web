import { type ReactNode, useMemo } from "react";
import { Link } from "react-router-dom";

// shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Icons
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

/* ================= Types ================= */
type MenuItem = {
  key: string;
  label: string;
  to?: string; // path yang bisa dikunjungi
  icon: ReactNode;
  note?: string; // keterangan kecil
  requiresParam?: boolean; // true jika route aslinya butuh param
};

/* ================= Components ================= */
export default function StudentMenuGrids() {
  // Catatan:
  // - Komponen ini dirender di bawah /murid/menu-utama
  // - Untuk halaman di bawah /murid/menu-utama -> pakai path relatif (mis. "kelas-saya", "keuangan", "jadwal", "profil-murid")
  // - Untuk halaman root /murid/* -> pakai path absolut (mis. "/murid/tugas", "/murid/progress", dst)
  // - Halaman yang butuh parameter (:id) ditampilkan non-klik dengan hint.

  const items: MenuItem[] = useMemo(
    () => [
      // ===== Menu utama (lokal) =====
      {
        key: "kelas-saya",
        label: "Kelas Saya",
        to: "kelas-saya",
        icon: <BookOpen />,
      },
      {
        key: "keuangan",
        label: "Pembayaran",
        to: "keuangan",
        icon: <Wallet />,
      },
      {
        key: "jadwal-local",
        label: "Jadwal",
        to: "jadwal",
        icon: <CalendarDays />,
      },
      {
        key: "profil",
        label: "Profil Murid",
        to: "profil-murid",
        icon: <IdCard />,
      },

      // ===== Root pages (/murid/*) =====
      {
        key: "tugas",
        label: "Daftar Tugas",
        to: "tugas",
        icon: <NotebookPen />,
      },
      {
        key: "keuangan-list",
        label: "Daftar Tagihan",
        to: "keuangan",
        icon: <FileStack />,
      },

      // ===== Progress cluster =====
      {
        key: "progress",
        label: "Progress Akademik",
        to: "progress",
        icon: <ListChecks />,
      },
      {
        key: "raport",
        label: "Raport",
        to: "progress/raport",
        icon: <FileText />,
      },
      {
        key: "absensi",
        label: "Absensi",
        to: "progress/absensi",
        icon: <UserCheck />,
      },
      {
        key: "catatan-hasil",
        label: "Catatan Hasil",
        to: "progress/catatan-hasil",
        icon: <StickyNote />,
      },

      // ===== Jadwal root (duplikasi aman: versi root) =====
      {
        key: "jadwal-root",
        label: "Jadwal (Root)",
        to: "jadwal",
        icon: <CalendarDays />,
      },

      // ===== Halaman yang memerlukan parameter (:id) -> non-aktif =====
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

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="mx-auto max-w-screen-2xl">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Akses Cepat Murid</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {items.map((it) => (
                  <MenuTile key={it.key} item={it} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function MenuTile({ item }: { item: MenuItem }) {
  const Inner = (
    <Card
      className={[
        "h-full w-full rounded-2xl border bg-card text-card-foreground transition-colors",
        item.requiresParam
          ? "opacity-60 cursor-not-allowed"
          : "hover:bg-accent/50",
      ].join(" ")}
      title={
        item.requiresParam
          ? item.note ?? "Halaman ini memerlukan parameter"
          : undefined
      }
      aria-disabled={item.requiresParam ? true : undefined}
    >
      <CardContent className="p-3 md:p-4 flex flex-col items-center justify-center text-center gap-2">
        <span className="h-12 w-12 md:h-14 md:w-14 grid place-items-center rounded-xl bg-primary/10 text-primary">
          <span className="size-6 md:size-7">{item.icon}</span>
        </span>
        <div className="text-xs md:text-sm font-medium leading-tight line-clamp-2">
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

  if (item.requiresParam || !item.to) {
    return (
      <div className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
        {Inner}
      </div>
    );
  }

  return (
    <Link
      to={item.to}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      {Inner}
    </Link>
  );
}
