// src/pages/dashboard/unnasigned/UnnasignedInfo.tsx
import { useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  ArrowRight,
  Info,
  ClipboardList,
  Users,
  Loader2,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

/* =========================
   Types
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

  /** status pendaftaran, dipakai di UI & sorting */
  is_open_for_registration: boolean;
};

// === Bentuk response dari backend (disederhanakan) ===
type ApiFeeRuleAmountOption = {
  code: string;
  label: string;
  amount: number;
};

type ApiFeeRule = {
  fee_rule_id: string;
  fee_rule_school_id: string;
  fee_rule_scope: string;
  fee_rule_term_id: string | null;
  fee_rule_bill_code: string;
  fee_rule_option_code: string | null;
  fee_rule_amount_options: ApiFeeRuleAmountOption[] | null;
};

type ApiClass = {
  class_id: string;
  class_school_id: string;
  class_name: string;
  class_slug: string;
  class_start_date: string;
  class_end_date: string;
  class_registration_opens_at: string | null;
  class_registration_closes_at: string | null;
  class_quota_total: number | null;
  class_quota_taken: number;
  class_delivery_mode: "online" | "offline" | "hybrid";
  class_status: "active" | "inactive" | string;
  class_class_parent_id: string;
  class_parent_code_snapshot: string | null;
  class_parent_name_snapshot: string;
  class_parent_slug_snapshot: string | null;
  class_parent_level_snapshot: number;
  class_academic_term_id: string;
  class_academic_term_academic_year_snapshot: string;
  class_academic_term_name_snapshot: string;
  class_academic_term_slug_snapshot: string;
  class_academic_term_angkatan_snapshot: string;
  class_notes?: string | null;
};

type ApiTerm = {
  academic_term_id: string;
  academic_term_school_id: string;
  academic_term_academic_year: string;
  academic_term_name: string;
  academic_term_start_date: string;
  academic_term_end_date: string;
  academic_term_is_active: boolean;
  academic_term_angkatan: number | null;
  academic_term_slug: string | null;
};

type ApiTermItem = {
  term: ApiTerm;
  classes?: ApiClass[];
  fee_rules?: ApiFeeRule[];
};

type ApiListResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
};

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

// cek apakah kelas sedang buka pendaftaran (mirip logic di backend)
function isClassOpenForRegistration(cls: ApiClass, now: Date): boolean {
  if (cls.class_status.toLowerCase() !== "active") return false;

  const openAt = cls.class_registration_opens_at
    ? new Date(cls.class_registration_opens_at)
    : null;
  const closeAt = cls.class_registration_closes_at
    ? new Date(cls.class_registration_closes_at)
    : null;

  if (openAt && now < openAt) return false;
  if (closeAt && now > closeAt) return false;

  if (
    cls.class_quota_total != null &&
    cls.class_quota_taken >= cls.class_quota_total
  ) {
    return false;
  }

  return true;
}

function mapApiToPMBClasses(items: ApiTermItem[]): PMBClassRow[] {
  const now = new Date();
  const out: PMBClassRow[] = [];

  for (const item of items) {
    const term = item.term;
    const classes = item.classes ?? [];
    for (const cls of classes) {
      const isOpen = isClassOpenForRegistration(cls, now);

      out.push({
        class_id: cls.class_id,
        class_slug: cls.class_slug,
        class_name: cls.class_name,
        class_class_parent_name_snapshot: cls.class_parent_name_snapshot,
        class_class_parent_level_snapshot: cls.class_parent_level_snapshot,
        class_academic_term_name_snapshot:
          cls.class_academic_term_name_snapshot ||
          term.academic_term_name ||
          "",
        class_academic_term_angkatan_snapshot:
          cls.class_academic_term_angkatan_snapshot ||
          String(term.academic_term_angkatan ?? ""),
        class_delivery_mode: cls.class_delivery_mode,
        class_registration_opens_at:
          cls.class_registration_opens_at ??
          term.academic_term_start_date ??
          new Date().toISOString(),
        class_registration_closes_at:
          cls.class_registration_closes_at ??
          term.academic_term_end_date ??
          new Date().toISOString(),
        class_quota_total: cls.class_quota_total,
        class_quota_taken: cls.class_quota_taken,
        class_notes: cls.class_notes ?? undefined,
        is_open_for_registration: isOpen,
      });
    }
  }

  // sort: yang masih buka pendaftaran di atas, lalu urut tanggal buka
  out.sort((a, b) => {
    if (a.is_open_for_registration !== b.is_open_for_registration) {
      return a.is_open_for_registration ? -1 : 1;
    }
    const da = new Date(a.class_registration_opens_at).getTime();
    const db = new Date(b.class_registration_opens_at).getTime();
    return da - db;
  });

  return out;
}

/* =========================
   Component
========================= */

export default function UnnasignedInfo() {
  const { school_slug } = useParams<{ school_slug: string }>();
  const navigate = useNavigate();

  // slug sekarang murni buat tampilan & routing saja
  const slug = school_slug ?? "sekolah";

  // === Fetch dari API (school_id full dari token, bukan param/path) ===
  const { data, isLoading, isError } = useQuery({
    queryKey: ["pmb-terms"], // tidak tergantung slug, karena BE baca school dari JWT
    queryFn: async () => {
      const res = await api.get<ApiListResponse<ApiTermItem>>(
        "/u/academic-terms/list",
        {
          params: {
            include: "classes,fee_rules",
            per_page: 50,
          },
        }
      );
      return res.data;
    },
    enabled: true,
  });

  const classes: PMBClassRow[] = useMemo(
    () => (data ? mapApiToPMBClasses(data.data) : []),
    [data]
  );

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
      </header>

      <Separator />

      {/* Program / Kelas PMB */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">
            Program / Kelas Penerimaan Murid Baru
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm md:text-base">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Mengambil data program / kelas PMB...</span>
            </div>
          ) : isError ? (
            <p className="text-sm text-destructive">
              Gagal memuat data pendaftaran. Silakan coba beberapa saat lagi.
            </p>
          ) : classes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Saat ini belum ada program / kelas PMB yang terdaftar. Silakan cek
              kembali secara berkala atau hubungi admin sekolah.
            </p>
          ) : (
            <div className="space-y-3">
              {classes.map((cls) => {
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
                        {!cls.is_open_for_registration && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-slate-400 text-slate-600"
                          >
                            Pendaftaran ditutup
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

                    {/* Kanan: info periode + CTA */}
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
                        {!cls.is_open_for_registration && (
                          <p className="text-[11px] text-muted-foreground italic">
                            Pendaftaran saat ini tidak dibuka untuk kelas ini.
                          </p>
                        )}
                      </div>

                      <Button
                        variant={
                          cls.is_open_for_registration ? "outline" : "ghost"
                        }
                        size="sm"
                        className="self-stretch md:self-end"
                        onClick={() => navigate(`${cls.class_id}`)}
                      >
                        {cls.is_open_for_registration
                          ? "Lihat & Daftar"
                          : "Lihat detail"}
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
            {/* ... isi alur pendaftaran kamu di sini (tanpa perubahan) ... */}
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
                Madinah Salam.
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
                Hubungi tim Madinah Salam
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}