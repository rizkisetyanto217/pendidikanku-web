// file: src/pages/public/PublicProgramsPage.tsx
import React, { useMemo, useState } from "react";

/* icons */
import {
  CalendarDays,
  School,
  Search,
  Users,
  Wallet,
  Info,
  FileText,
  ListChecks,
  CheckCircle2,
} from "lucide-react";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

/* =====================
   Tipe data
   ===================== */

export interface PublicProgram {
  id: string;
  code?: string | null;

  title: string;
  short_desc?: string | null;

  level_label?: string | null;
  category_label?: string | null;

  enrollment_status: "open" | "upcoming" | "closed";

  enrollment_start_date?: string | null;
  enrollment_end_date?: string | null;

  period_label?: string | null;
  sessions_per_week_label?: string | null;

  registration_fee_idr?: number | null;
  tuition_fee_idr?: number | null;

  quota_total?: number | null;
  quota_remaining?: number | null;

  // gambar utama program (dummy dulu)
  image_url?: string | null;
}

/* =====================
   Dummy data
   ===================== */

const DUMMY_PROGRAMS: PublicProgram[] = [
  {
    id: "1",
    code: "TPA-PAGI-2025",
    title: "Program TPA Pagi Reguler",
    short_desc:
      "Program tahsin & tahfizh untuk anak usia SD dengan fokus bacaan tartil.",
    level_label: "TPA",
    category_label: "Reguler",
    enrollment_status: "open",
    enrollment_start_date: "2025-11-01",
    enrollment_end_date: "2025-12-15",
    period_label: "Januari – Juni 2026",
    sessions_per_week_label: "3x per pekan (Senin, Rabu, Jumat)",
    registration_fee_idr: 150000,
    tuition_fee_idr: 250000,
    quota_total: 30,
    quota_remaining: 8,
    image_url:
      "https://images.pexels.com/photos/5905718/pexels-photo-5905718.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "2",
    code: "PMB-SMPIT-2026",
    title: "PMB SMP IT Tahun Ajaran 2026/2027",
    short_desc:
      "Penerimaan murid baru untuk tingkat SMP IT dengan sistem full day school dan pembinaan karakter.",
    level_label: "SMP",
    category_label: "PMB",
    enrollment_status: "open",
    enrollment_start_date: "2025-10-20",
    enrollment_end_date: "2026-01-31",
    period_label: "Tahun ajaran 2026/2027",
    sessions_per_week_label: "Senin – Jumat (full day)",
    registration_fee_idr: 500000,
    tuition_fee_idr: 850000,
    quota_total: 90,
    quota_remaining: 27,
    image_url:
      "https://images.pexels.com/photos/5212336/pexels-photo-5212336.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "3",
    code: "TAHFIDZ-REM-AHAD",
    title: "Kelas Tahfidz Remaja Akhir Pekan",
    short_desc:
      "Kelas tahfidz intensif untuk remaja dengan target hafalan 3 juz per tahun.",
    level_label: "Remaja",
    category_label: "Tahfidz",
    enrollment_status: "upcoming",
    enrollment_start_date: "2025-12-01",
    enrollment_end_date: "2026-02-01",
    period_label: "Februari – Desember 2026",
    sessions_per_week_label: "Sabtu & Ahad pagi",
    registration_fee_idr: 200000,
    tuition_fee_idr: 300000,
    quota_total: 40,
    quota_remaining: 40,
    image_url:
      "https://images.pexels.com/photos/5427869/pexels-photo-5427869.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "4",
    code: "EKSKUL-ARABIC-2025",
    title: "Ekstrakurikuler Bahasa Arab",
    short_desc:
      "Program pengenalan bahasa Arab komunikatif untuk siswa SD & SMP.",
    level_label: "SD & SMP",
    category_label: "Ekstrakurikuler",
    enrollment_status: "closed",
    enrollment_start_date: "2025-07-01",
    enrollment_end_date: "2025-08-15",
    period_label: "Agustus – Desember 2025",
    sessions_per_week_label: "2x per pekan (Selasa & Kamis)",
    registration_fee_idr: 100000,
    tuition_fee_idr: 175000,
    quota_total: 25,
    quota_remaining: 0,
    image_url:
      "https://images.pexels.com/photos/5905499/pexels-photo-5905499.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

/* =====================
   Utility kecil
   ===================== */

function formatCurrencyIDR(v?: number | null): string {
  if (!v || v <= 0) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(v);
}

function formatDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getEnrollmentStatusBadge(status: PublicProgram["enrollment_status"]) {
  switch (status) {
    case "open":
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">
          Pendaftaran dibuka
        </Badge>
      );
    case "upcoming":
      return (
        <Badge className="bg-amber-500 hover:bg-amber-500 text-white">
          Segera dibuka
        </Badge>
      );
    case "closed":
    default:
      return (
        <Badge variant="outline" className="border-gray-400 text-gray-600">
          Pendaftaran ditutup
        </Badge>
      );
  }
}

/* =====================
   Komponen utama
   ===================== */

const PublicProgramsPage: React.FC = () => {
  // schoolSlug belum dipakai di dummy, nanti bisa dipakai untuk fetch API

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [showAllPrograms, setShowAllPrograms] = useState<boolean>(false); // false = hanya yang buka

  const programs = DUMMY_PROGRAMS;

  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      const q = search.trim().toLowerCase();

      // Search
      if (q) {
        const haystack = [
          p.title,
          p.short_desc,
          p.level_label,
          p.category_label,
          p.code,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(q)) return false;
      }

      // Filter jenjang
      if (levelFilter !== "all") {
        if ((p.level_label || "").toLowerCase() !== levelFilter.toLowerCase()) {
          return false;
        }
      }

      // Filter mode: hanya yang sedang dibuka vs semua program
      if (!showAllPrograms) {
        // hanya yang open / upcoming
        if (
          !(
            p.enrollment_status === "open" || p.enrollment_status === "upcoming"
          )
        ) {
          return false;
        }
      }

      return true;
    });
  }, [programs, search, levelFilter, showAllPrograms]);

  const uniqueLevels = useMemo(() => {
    const set = new Set<string>();
    programs.forEach((p) => {
      if (p.level_label) set.add(p.level_label);
    });
    return Array.from(set);
  }, [programs]);

  return (
    <div className="min-h-screen bg-background">
      {/* Full width, hanya padding */}
      <div className="w-full px-4 py-8 space-y-8 md:px-8 lg:px-12">
        {/* Header */}
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
            <School className="h-3 w-3" />
            <span>Informasi Program Sekolah</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Program & Pendaftaran Peserta
          </h1>
          <p className="max-w-2xl text-sm md:text-base text-muted-foreground">
            Halaman ini menampilkan daftar seluruh program yang tersedia di
            sekolah beserta status pendaftarannya. Orang tua dan calon peserta
            dapat melihat informasi singkat, biaya, dan jadwal sebelum memulai
            proses pendaftaran.
          </p>
          <p className="max-w-xl text-xs md:text-sm text-muted-foreground">
            URL publik per sekolah nantinya menggunakan pola:{" "}
            <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
              /{`{school_slug}`}/program
            </span>
            . Saat ini data yang tampil masih berupa contoh (dummy).
          </p>
        </header>

        <Separator />

        {/* Filter bar */}
        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Kiri: search + filter level */}
          <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Cari program, jenjang, atau kata kunci..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="md:ml-3 w-full md:w-[180px]">
              <Select
                value={levelFilter}
                onValueChange={(val) => setLevelFilter(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semua jenjang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua jenjang</SelectItem>
                  {uniqueLevels.map((lvl) => (
                    <SelectItem key={lvl} value={lvl}>
                      {lvl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Kanan: toggle program dibuka / semua program */}
          <div className="flex items-center justify-start md:justify-end">
            <div className="inline-flex items-center rounded-full border bg-background p-1 text-xs">
              <Button
                type="button"
                variant={showAllPrograms ? "ghost" : "default"}
                size="sm"
                className={`rounded-full px-3 py-1 text-xs ${
                  showAllPrograms ? "shadow-none" : ""
                }`}
                onClick={() => setShowAllPrograms(false)}
              >
                Sedang dibuka
              </Button>
              <Button
                type="button"
                variant={showAllPrograms ? "default" : "ghost"}
                size="sm"
                className={`rounded-full px-3 py-1 text-xs ${
                  showAllPrograms ? "" : "shadow-none"
                }`}
                onClick={() => setShowAllPrograms(true)}
              >
                Semua program
              </Button>
            </div>
          </div>
        </section>

        {/* Info kecil tentang filter */}
        <p className="text-xs text-muted-foreground">
          {showAllPrograms
            ? "Menampilkan seluruh program, termasuk yang pendaftarannya sudah ditutup."
            : "Menampilkan program yang sedang dibuka atau akan segera dibuka untuk pendaftaran."}
        </p>

        {/* Kalau kosong */}
        {filteredPrograms.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center text-muted-foreground">
            <Info className="h-6 w-6" />
            <div className="space-y-1">
              <p className="font-medium">Belum ada program yang cocok.</p>
              <p className="text-sm">
                Coba ubah kata kunci, filter jenjang, atau ubah tampilan dari
                “Sedang dibuka” ke “Semua program”.
              </p>
            </div>
          </div>
        )}

        {/* List program - full width grid */}
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredPrograms.map((p) => {
            const enrollmentStart = formatDate(p.enrollment_start_date);
            const enrollmentEnd = formatDate(p.enrollment_end_date);

            return (
              <Card
                key={p.id}
                className="flex h-full flex-col overflow-hidden border border-border/80 shadow-sm"
              >
                {/* Gambar program */}
                {p.image_url ? (
                  <div className="relative h-36 w-full overflow-hidden bg-muted md:h-40">
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-full bg-muted" />
                )}

                <CardHeader className="space-y-2 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {p.level_label && (
                      <Badge variant="outline" className="border-primary/40">
                        {p.level_label}
                      </Badge>
                    )}
                    {p.category_label && (
                      <Badge
                        variant="outline"
                        className="border-muted-foreground/40"
                      >
                        {p.category_label}
                      </Badge>
                    )}
                    {getEnrollmentStatusBadge(p.enrollment_status)}
                  </div>

                  <CardTitle className="text-base md:text-lg">
                    {p.title}
                  </CardTitle>

                  {p.short_desc && (
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {p.short_desc}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-3 pb-4 text-xs md:text-sm">
                  {/* Info: periode & jadwal */}
                  <div className="space-y-1">
                    {p.period_label && (
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">Periode:</span>
                        <span>{p.period_label}</span>
                      </div>
                    )}

                    {p.sessions_per_week_label && (
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">Jadwal:</span>
                        <span>{p.sessions_per_week_label}</span>
                      </div>
                    )}

                    {(enrollmentStart || enrollmentEnd) && (
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">Pendaftaran:</span>
                        <span>
                          {enrollmentStart && enrollmentEnd
                            ? `${enrollmentStart} – ${enrollmentEnd}`
                            : enrollmentStart || enrollmentEnd}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info: biaya & kuota */}
                  <div className="flex flex-wrap gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="font-medium">Biaya</span>
                        <span className="text-[11px] text-muted-foreground">
                          Registrasi:{" "}
                          {formatCurrencyIDR(p.registration_fee_idr)}
                          {p.tuition_fee_idr
                            ? ` • SPP/Periode: ${formatCurrencyIDR(
                                p.tuition_fee_idr
                              )}`
                            : ""}
                        </span>
                      </div>
                    </div>

                    {(p.quota_total || p.quota_remaining) && (
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="font-medium">Kuota</span>
                          <span className="text-[11px] text-muted-foreground">
                            {p.quota_total
                              ? `Total ${p.quota_total} peserta`
                              : "Kuota terbatas"}
                            {typeof p.quota_remaining === "number" &&
                              p.quota_remaining >= 0 &&
                              ` • Sisa ${p.quota_remaining}`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <Button
                      size="sm"
                      className="text-xs md:text-sm"
                      disabled={p.enrollment_status === "closed"}
                      onClick={() => {
                        // Nanti sambungkan ke:
                        // - halaman detail program, atau
                        // - form pendaftaran langsung
                        // misal: navigate(`/daftar/${p.id}`)
                      }}
                    >
                      {p.enrollment_status === "closed"
                        ? "Pendaftaran ditutup"
                        : "Daftar sekarang"}
                    </Button>

                    {p.code && (
                      <span className="text-[11px] text-muted-foreground">
                        Kode program: {p.code}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Sekilas tentang program + alur pendaftaran */}
        <section className="mt-8 rounded-xl border bg-muted/40 px-4 py-6 md:px-6 md:py-8 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              <span>Sekilas mengenai program & pendaftaran</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Sekilas program */}
            <Card className="border-border/70">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-primary">
                  <School className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Sekilas Program
                  </span>
                </div>
                <CardTitle className="mt-2 text-sm md:text-base">
                  Ragam program sesuai jenjang & kebutuhan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs md:text-sm text-muted-foreground">
                <p>
                  Program di sekolah ini mencakup TPA, tahfidz, program reguler
                  tingkat SD–SMP, hingga ekstrakurikuler pendukung. Setiap
                  program memiliki jadwal, biaya, dan target capaian yang
                  berbeda.
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Pilihan program pagi, siang, atau akhir pekan.</li>
                  <li>
                    Fokus berbeda: tahsin, tahfidz, akademik, atau bahasa.
                  </li>
                  <li>
                    Informasi kuota membantu orang tua melihat ketersediaan.
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Alur pendaftaran */}
            <Card className="border-border/70">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-primary">
                  <ListChecks className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Alur Pendaftaran
                  </span>
                </div>
                <CardTitle className="mt-2 text-sm md:text-base">
                  Langkah sederhana untuk mendaftar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs md:text-sm text-muted-foreground">
                <ol className="list-decimal pl-4 space-y-1">
                  <li>
                    Pilih program yang sesuai dari daftar di atas dan klik{" "}
                    <span className="font-medium">“Daftar sekarang”</span>.
                  </li>
                  <li>
                    Isi formulir pendaftaran dengan data peserta dan orang tua
                    secara lengkap.
                  </li>
                  <li>
                    Lakukan konfirmasi pendaftaran (misalnya via pembayaran
                    biaya registrasi atau verifikasi data).
                  </li>
                  <li>
                    Pantau status pendaftaran dan informasi lanjutan melalui
                    dashboard peserta.
                  </li>
                </ol>
                <p className="pt-1 text-[11px]">
                  Catatan: detail alur bisa berbeda di tiap sekolah (misalnya
                  ada tahap wawancara, tes seleksi, atau pengumpulan berkas
                  tambahan).
                </p>
              </CardContent>
            </Card>

            {/* Setelah terdaftar */}
            <Card className="border-border/70">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Setelah Terdaftar
                  </span>
                </div>
                <CardTitle className="mt-2 text-sm md:text-base">
                  Apa saja yang akan didapat peserta?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs md:text-sm text-muted-foreground">
                <p>
                  Setelah peserta dinyatakan diterima, akun akan diarahkan ke
                  dashboard untuk mengakses informasi harian.
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Jadwal belajar dan pengajar di tiap pertemuan.</li>
                  <li>Informasi kehadiran dan rekap keaktifan peserta.</li>
                  <li>
                    Pengumuman khusus dari wali kelas atau pengelola program.
                  </li>
                  <li>
                    Rincian tagihan dan riwayat pembayaran (jika diaktifkan).
                  </li>
                </ul>
                <p className="pt-1 text-[11px]">
                  Semua fitur ini akan terhubung langsung dengan sistem
                  Pendidikanku sehingga sekolah dapat mengelola data secara
                  terpusat.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PublicProgramsPage;
