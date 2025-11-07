import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Layers,
  IdCard,
  CalendarDays,
  Settings,
  NotebookPen,
  CheckCheck,
} from "lucide-react";

/* ================= Types ================= */
type MenuItem = {
  key: string;
  label: string;
  to?: string; // path yang bisa dikunjungi
  icon: React.ReactNode;
  note?: string; // keterangan kecil
  requiresParam?: boolean; // true jika route aslinya butuh param => tampil non-aktif
  absolute?: boolean; // gunakan path absolut (mulai dengan /guru/…)
};

/* ================= Component ================= */
export default function TeacherMenuGrids() {
  // Catatan:
  // - Item di bawah ini mencerminkan routes di TeacherRoutes.
  // - Untuk rute di bawah /guru/menu-utama/* -> pakai path relatif (mis. "kelas", "jadwal", dst)
  // - Untuk rute root /guru/* -> pakai absolute: "/guru/penilaian", "/guru/kehadiran", dst
  const items: MenuItem[] = useMemo(
    () => [

      // ===== Kelas (di bawah menu-utama) =====
      {
        key: "kelas",
        label: "Kelas Saya",
        to: "kelas",
        icon: <Users className="w-5 h-5" />,
      },
      {
        key: "kelas-detail",
        label: "Detail Kelas",
        icon: <Layers className="w-5 h-5" />,
        requiresParam: true,
        note: "Buka dari daftar kelas",
      },
      {
        key: "kelas-absensi",
        label: "Absensi Kelas",
        icon: <CheckCheck className="w-5 h-5" />,
        requiresParam: true,
        note: "Pilih kelas dulu",
      },
      {
        key: "kelas-tugas",
        label: "Tugas per Kelas",
        icon: <NotebookPen className="w-5 h-5" />,
        requiresParam: true,
        note: "Pilih kelas dulu",
      },

      // ===== Tugas (entry umum di menu-utama) =====
      {
        key: "tugas",
        label: "Tugas",
        to: "tugas",
        icon: <NotebookPen className="w-5 h-5" />,
      },

      // ===== Guru Mapel & Jadwal (menu-utama) =====
      {
        key: "guru-mapel",
        label: "Guru Mapel",
        to: "guru-mapel",
        icon: <Layers className="w-5 h-5" />,
      },
      {
        key: "jadwal",
        label: "Jadwal",
        to: "jadwal",
        icon: <CalendarDays className="w-5 h-5" />,
      },

      // ===== Profil & Penilaian (root /guru/*) =====
      {
        key: "profil-guru",
        label: "Profil Guru",
        to: "profil-guru",
        icon: <IdCard className="w-5 h-5" />,
        absolute: true,
      },


      // ===== Kehadiran (root /guru/kehadiran) =====
      {
        key: "kehadiran",
        label: "Kehadiran",
        to: "kehadiran",
        icon: <CheckCheck className="w-5 h-5" />,
        absolute: true,
      },
      {
        key: "kehadiran-detail",
        label: "Detail Kehadiran",
        icon: <CheckCheck className="w-5 h-5" />,
        requiresParam: true,
        note: "Buka dari Kehadiran",
      },

      // ===== Kelola Kelas (root /guru/kelola-kelas/:name) =====
      {
        key: "kelola-kelas",
        label: "Kelola Kelas",
        icon: <Layers className="w-5 h-5" />,
        requiresParam: true,
        note: "Butuh nama kelas",
      },

      // ===== QuizClass =====
      // Ada route /guru/quizClass/detail (tanpa param). Jika butuh context, tetap bisa diklik dari sini.
      {
        key: "quiz-class-detail",
        label: "QuizClass Detail",
        to: "quizClass/detail",
        icon: <NotebookPen className="w-5 h-5" />,
        absolute: true,
      },

      // ===== Pengaturan (komentar di routes) =====
      {
        key: "pengaturan",
        label: "Pengaturan",
        icon: <Settings className="w-5 h-5" />,
        note: "Segera hadir",
      },
    ],
    []
  );

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 md:p-6">
        <section className="flex-1 flex flex-col space-y-6 min-w-0">
          <Card className="p-4 md:p-5 border border-border bg-card text-card-foreground shadow-sm">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-lg font-semibold">
                Akses Cepat Guru
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {items.map((it) => (
                  <MenuTile key={it.key} item={it} />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

/* ================= Tile Component ================= */
function MenuTile({ item }: { item: MenuItem }) {
  const Inner = (
    <div
      className={[
        "h-full w-full rounded-2xl border border-border bg-card p-3 md:p-4 flex flex-col items-center justify-center text-center gap-2 shadow-sm transition-all",
        item.requiresParam
          ? "opacity-60 cursor-not-allowed"
          : "hover:bg-accent hover:text-accent-foreground",
      ].join(" ")}
      title={
        item.requiresParam
          ? item.note ?? "Halaman ini memerlukan parameter"
          : undefined
      }
      aria-disabled={item.requiresParam ? true : undefined}
    >
      <span className="h-12 w-12 md:h-14 md:w-14 grid place-items-center rounded-xl bg-primary/10 text-primary transition-colors">
        {item.icon}
      </span>
      <div className="text-xs md:text-sm font-medium leading-tight line-clamp-2">
        {item.label}
      </div>
      {item.note && (
        <div className="text-[11px] md:text-xs text-muted-foreground">
          {item.note}
        </div>
      )}
    </div>
  );

  // Non-klik untuk item yang membutuhkan parameter (atau belum tersedia)
  if (item.requiresParam || !item.to) {
    return <div className="group block">{Inner}</div>;
  }

  // Gunakan Link (relatif atau absolut sesuai 'to')
  return (
    <Link
      to={item.to}
      className="group block transition-transform hover:scale-[1.02] active:scale-[0.99] focus:outline-none"
    >
      {Inner}
    </Link>
  );
}
