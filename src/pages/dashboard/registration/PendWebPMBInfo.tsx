// src/pages/profile/website/website/pmb/PendWebPMBInfo.tsx
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  ArrowRight,
  Info,
  ClipboardList,
  Users,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

/* =========================
   Types & dummy data
========================= */

export type PMBClassRow = {
  class_id: string;
  class_slug: string;
  class_name: string;
  class_class_parent_name_snapshot: string;
  class_class_parent_level_snapshot: number;
  class_academic_term_name_snapshot: string;
  class_academic_term_angkatan_snapshot: string;
  class_delivery_mode: "online" | "offline" | "hybrid";
  class_registration_opens_at: string; // ISO string
  class_registration_closes_at: string; // ISO string
  class_quota_total: number | null;
  class_quota_taken: number;
  class_notes?: string | null;
};

// nanti tinggal ganti ini dengan hasil fetch dari backend
export const dummyClasses: PMBClassRow[] = [
  {
    class_id: "1",
    class_slug: "tk-a-pagi",
    class_name: "Kelompok A Pagi",
    class_class_parent_name_snapshot: "TK A",
    class_class_parent_level_snapshot: 1,
    class_academic_term_name_snapshot: "Tahun Ajaran 2025/2026",
    class_academic_term_angkatan_snapshot: "2025",
    class_delivery_mode: "offline",
    class_registration_opens_at: "2025-01-01T00:00:00Z",
    class_registration_closes_at: "2025-03-31T23:59:59Z",
    class_quota_total: 30,
    class_quota_taken: 18,
    class_notes:
      "Kelas pagi untuk usia 4–5 tahun. Fokus pembiasaan ibadah dan pengenalan huruf hijaiyah.",
  },
  {
    class_id: "2",
    class_slug: "sd-it-1",
    class_name: "Kelas 1 SD-IT",
    class_class_parent_name_snapshot: "SD Kelas 1",
    class_class_parent_level_snapshot: 2,
    class_academic_term_name_snapshot: "Tahun Ajaran 2025/2026",
    class_academic_term_angkatan_snapshot: "2025",
    class_delivery_mode: "offline",
    class_registration_opens_at: "2025-01-15T00:00:00Z",
    class_registration_closes_at: "2025-04-30T23:59:59Z",
    class_quota_total: 2, // bikin keliatan hampir penuh
    class_quota_taken: 2,
    class_notes:
      "Full day school dengan integrasi kurikulum nasional dan tahfidz juz 30.",
  },
  {
    class_id: "3",
    class_slug: "tahfidz-malam-online",
    class_name: "Program Tahfidz Malam Online",
    class_class_parent_name_snapshot: "Program Ekstrakurikuler",
    class_class_parent_level_snapshot: 3,
    class_academic_term_name_snapshot: "Program Khusus Ramadhan 1447 H",
    class_academic_term_angkatan_snapshot: "1447H",
    class_delivery_mode: "online",
    class_registration_opens_at: "2025-02-01T00:00:00Z",
    class_registration_closes_at: "2025-03-10T23:59:59Z",
    class_quota_total: null, // tanpa batas kuota
    class_quota_taken: 120,
    class_notes:
      "Kelas online ba'da Isya khusus hafalan dan murajaah. Terbuka untuk umum.",
  },
];

/* =========================
   Helpers
========================= */

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatRegWindow(openStr: string, closeStr: string): string {
  const o = formatDate(openStr);
  const c = formatDate(closeStr);
  if (o !== "-" && c !== "-") return `${o} s.d. ${c}`;
  if (o !== "-" && c === "-") return `Mulai ${o}`;
  if (o === "-" && c !== "-") return `Sampai ${c}`;
  return "Mengikuti kebijakan sekolah";
}

export function formatDeliveryMode(
  mode: PMBClassRow["class_delivery_mode"]
): string {
  switch (mode) {
    case "online":
      return "Online";
    case "offline":
      return "Tatap muka";
    case "hybrid":
      return "Hybrid (online + offline)";
    default:
      return "Mode belajar mengikuti kelas";
  }
}

/* =========================
   Component
========================= */

export default function PendWebPMBInfo() {
  const { school_slug } = useParams<{ school_slug: string }>();
  const navigate = useNavigate();

  const slug = school_slug ?? "sekolah";

  return (
    <div className="mx-auto py-10 px-4 md:py-14 md:px-6 space-y-10">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs md:text-sm bg-background/60 backdrop-blur">
            <Badge variant="outline" className="gap-1 px-2 py-0.5">
              <GraduationCap className="w-3 h-3" />
              PMB Online
            </Badge>
            <span className="text-muted-foreground">
              Penerimaan Murid Baru {slug}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Informasi Penerimaan Murid Baru
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl">
            Kamu belum terdaftar di sekolah ini. Silakan baca informasi singkat
            di bawah dan lanjutkan ke pendaftaran akun atau masuk dengan akun
            yang sudah ada.
          </p>
        </div>

        <div className="flex flex-col gap-2 md:items-end">
          <Button
            className="w-full md:w-auto"
            onClick={() => navigate("/register")}
          >
            Daftar Akun Baru
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={() => navigate(`/${slug}/login`)}
          >
            Saya sudah punya akun
          </Button>
        </div>
      </header>

      <Separator />

      {/* Kelas yang membuka pendaftaran (dummy) */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">
            Program / Kelas yang Membuka Pendaftaran
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm md:text-base">
          {dummyClasses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Saat ini belum ada kelas yang membuka pendaftaran. Silakan cek
              kembali secara berkala atau hubungi admin sekolah.
            </p>
          ) : (
            <div className="space-y-3">
              {dummyClasses.map((cls) => {
                const quotaInfo =
                  cls.class_quota_total != null
                    ? `${cls.class_quota_taken}/${cls.class_quota_total} kursi`
                    : `${cls.class_quota_taken} pendaftar`;

                const isFull =
                  cls.class_quota_total != null &&
                  cls.class_quota_taken >= cls.class_quota_total;
                const isAlmostFull =
                  cls.class_quota_total != null &&
                  cls.class_quota_taken >= cls.class_quota_total - 3 &&
                  !isFull;

                return (
                  <div
                    key={cls.class_id}
                    className="rounded-lg border px-3 py-3 md:px-4 md:py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">
                          {cls.class_name || "Kelas tanpa nama"}
                        </span>
                        {cls.class_class_parent_name_snapshot && (
                          <Badge variant="outline" className="text-xs">
                            {cls.class_class_parent_name_snapshot}
                          </Badge>
                        )}
                        {cls.class_academic_term_angkatan_snapshot && (
                          <Badge variant="secondary" className="text-xs">
                            Angkatan {cls.class_academic_term_angkatan_snapshot}
                          </Badge>
                        )}
                        {isFull && (
                          <Badge variant="destructive" className="text-[10px]">
                            Kuota penuh
                          </Badge>
                        )}
                        {!isFull && isAlmostFull && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-amber-500 text-amber-600"
                          >
                            Sisa sedikit
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs md:text-sm text-muted-foreground">
                        {formatDeliveryMode(cls.class_delivery_mode)}
                      </p>

                      {cls.class_notes && (
                        <p className="text-xs md:text-[13px] text-muted-foreground line-clamp-2">
                          {cls.class_notes}
                        </p>
                      )}
                    </div>

                    {/* Kanan: info periode + CTA Lihat & Daftar */}
                    <div className="flex flex-col gap-2 md:items-end md:text-right text-xs md:text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">
                          Periode pendaftaran:
                        </p>
                        <p className="font-medium">
                          {formatRegWindow(
                            cls.class_registration_opens_at,
                            cls.class_registration_closes_at
                          )}
                        </p>
                        <p className="text-muted-foreground text-[11px]">
                          Kuota: {quotaInfo}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="self-stretch md:self-end"
                        onClick={() => navigate(`${cls.class_id}`)}
                      >
                        Lihat &amp; Daftar
                        <ArrowRight className="w-3 h-3 ml-2" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Konten utama */}
      <div className="grid gap-6 md:grid-cols-[2fr,1.2fr]">
        {/* Alur pendaftaran */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              Alur Pendaftaran Online
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm md:text-base">
            {/* ... (bagian alur pendaftaran tetap sama) ... */}
            {/* === POTONGAN ASLI KAMU TETAPKAN DI SINI TANPA PERUBAHAN === */}
            {/* ... */}
          </CardContent>
        </Card>

        {/* Info singkat / kontak */}
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="w-4 h-4" />
                Informasi Singkat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Halaman ini hanya menampilkan informasi umum PMB. Detail jadwal,
                kuota, dan biaya dapat diatur oleh admin sekolah melalui panel
                Pendidikanku.
              </p>
              <p className="text-muted-foreground">
                Jika kamu ragu apakah sudah punya akun atau belum, coba dulu
                tombol <strong>Saya sudah punya akun</strong>. Jika tetap gagal,
                silakan daftar akun baru.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="w-4 h-4" />
                Persiapan Berkas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Data identitas orang tua / wali</li>
                <li>Data identitas calon murid</li>
                <li>Nomor kontak yang aktif (WhatsApp)</li>
                <li>Scan / foto dokumen yang diperlukan sekolah</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-4 h-4" />
                Bantuan
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Jika mengalami kesulitan, silakan hubungi admin sekolah atau
                kunjungi halaman kontak sekolah.
              </p>
              <Link
                to="/website/hubungi-kami"
                className="text-xs text-primary underline"
              >
                Hubungi tim Pendidikanku
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}