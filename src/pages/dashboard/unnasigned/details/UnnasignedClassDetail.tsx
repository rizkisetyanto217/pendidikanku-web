// src/pages/dashboard/unnasigned/details/UnnasignedClassDetail.tsx

import { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { GraduationCap, Users, Info, Loader2 } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// helpers (formatting) tetap pakai file lama
import { formatDeliveryMode, formatRegWindow } from "../UnnasignedInfo";
import type { PMBClassRow } from "../UnnasignedInfo";

/* =========================
   API types (disederhanakan)
========================= */

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

export default function PendWebPMBClassDetail() {
  const { school_slug, id } = useParams<{
    school_slug: string;
    id: string;
  }>();
  const navigate = useNavigate();

  const slug = school_slug ?? "sekolah";

  // === Fetch academic terms + classes (school_id dari token, bukan dari path/params) ===
  const { data, isLoading, isError } = useQuery({
    queryKey: ["pmb-terms-detail"], // tidak tergantung slug, BE pakai school context
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
    enabled: !!id, // cukup id saja, slug cuma buat UI
  });

  // ==== Cari kelas yang cocok dengan :id, lalu bentuk PMBClassRow ====
  const cls: PMBClassRow | undefined = useMemo(() => {
    if (!data || !id) return undefined;

    const now = new Date();

    for (const item of data.data) {
      const term = item.term;
      const classes = item.classes ?? [];
      for (const c of classes) {
        if (c.class_id !== id) continue;

        // fallback tanggal kalau null → pakai term
        const regOpen =
          c.class_registration_opens_at ?? term.academic_term_start_date;
        const regClose =
          c.class_registration_closes_at ?? term.academic_term_end_date;

        const angkatan =
          c.class_academic_term_angkatan_snapshot ??
          (term.academic_term_angkatan != null
            ? String(term.academic_term_angkatan)
            : "");

        // sama kayak helper isClassOpenForRegistration di UnnasignedInfo
        const openAt = c.class_registration_opens_at
          ? new Date(c.class_registration_opens_at)
          : null;
        const closeAt = c.class_registration_closes_at
          ? new Date(c.class_registration_closes_at)
          : null;

        let isOpen = true;

        if (c.class_status.toLowerCase() !== "active") {
          isOpen = false;
        } else {
          if (openAt && now < openAt) isOpen = false;
          if (closeAt && now > closeAt) isOpen = false;
          if (
            c.class_quota_total != null &&
            c.class_quota_taken >= c.class_quota_total
          ) {
            isOpen = false;
          }
        }

        const view: PMBClassRow = {
          class_id: c.class_id,
          class_slug: c.class_slug,
          class_name: c.class_name,
          class_class_parent_name_snapshot: c.class_parent_name_snapshot,
          class_class_parent_level_snapshot: c.class_parent_level_snapshot,
          class_academic_term_name_snapshot:
            c.class_academic_term_name_snapshot || term.academic_term_name,
          class_academic_term_angkatan_snapshot: angkatan,
          class_delivery_mode: c.class_delivery_mode,
          class_registration_opens_at: regOpen,
          class_registration_closes_at: regClose,
          class_quota_total: c.class_quota_total,
          class_quota_taken: c.class_quota_taken,
          class_notes: c.class_notes ?? null,
          // 🔴 properti baru yang tadinya bikin error
          is_open_for_registration: isOpen,
        };

        return view;
      }
    }

    return undefined;
  }, [data, id]);

  // ====== STATE: loading / error / not found ======

  if (isLoading) {
    return (
      <div className="w-full mx-auto py-10 px-4 md:py-14 md:px-6 space-y-6">
        <div>
          <Link
            to={`/${slug}/pmb`}
            className="text-xs text-muted-foreground hover:underline"
          >
            ← Kembali ke daftar program
          </Link>
        </div>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              Memuat detail program...
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Silakan tunggu sebentar.</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full mx-auto py-10 px-4 md:py-14 md:px-6 space-y-6">
        <div>
          <Link
            to={`/${slug}/pmb`}
            className="text-xs text-muted-foreground hover:underline"
          >
            ← Kembali ke daftar program
          </Link>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              Gagal memuat program
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Terjadi kesalahan saat memuat detail program.</p>
            <p>Silakan coba refresh halaman atau kembali ke daftar program.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="w-full mx-auto py-10 px-4 md:py-14 md:px-6 space-y-6">
        <div>
          <Link
            to={`/${slug}/pmb`}
            className="text-xs text-muted-foreground hover:underline"
          >
            ← Kembali ke daftar program
          </Link>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              Program tidak ditemukan
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Maaf, program / kelas PMB yang kamu buka tidak ditemukan atau
              sudah tidak aktif.
            </p>
            <p>
              Kamu bisa kembali ke daftar program untuk melihat pilihan lain.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ====== Normal view (cls sudah ada) ======

  const quotaInfo =
    cls.class_quota_total != null
      ? `${cls.class_quota_taken}/${cls.class_quota_total} kursi`
      : `${cls.class_quota_taken} pendaftar`;

  const isFull =
    cls.class_quota_total != null &&
    cls.class_quota_taken >= cls.class_quota_total;

  return (
    <div className="w-full mx-auto py-10 px-4 md:py-14 md:px-6 space-y-8">
      {/* Breadcrumb sederhana */}
      <div className="flex items-center justify-between gap-2">
        <Link
          to={`/${slug}/pmb`}
          className="text-xs text-muted-foreground hover:underline"
        >
          ← Kembali ke daftar program
        </Link>
      </div>

      {/* Header */}
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs bg-background/60 backdrop-blur">
          <Badge variant="outline" className="gap-1 px-2 py-0.5">
            <GraduationCap className="w-3 h-3" />
            PMB Online
          </Badge>
          <span className="text-muted-foreground">
            Program {school_slug ?? "sekolah"}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {cls.class_name}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {cls.class_class_parent_name_snapshot} •{" "}
          {cls.class_academic_term_name_snapshot}
        </p>
      </header>

      {/* Card utama detail kelas */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base md:text-lg flex flex-wrap items-center gap-2">
            <span>Detail Program &amp; Pendaftaran</span>
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
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-sm md:text-base">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Mode belajar</p>
              <p className="font-medium">
                {formatDeliveryMode(cls.class_delivery_mode)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Periode pendaftaran
              </p>
              <p className="font-medium">
                {formatRegWindow(
                  cls.class_registration_opens_at,
                  cls.class_registration_closes_at
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Kuota</p>
              <p className="font-medium">{quotaInfo}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Sekolah</p>
              <p className="font-medium">{school_slug ?? "Sekolah"}</p>
            </div>
          </div>

          {/* Deskripsi program – pakai class_notes sebagai trigger */}
          {cls.class_notes && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Deskripsi Program Diploma Ilmi – Sastra Arab
              </p>

              <p className="text-sm md:text-base text-muted-foreground">
                Diploma Ilmi jurusan{" "}
                <span className="font-semibold">Sastra Arab</span> adalah
                program pendalaman bahasa Arab yang berfokus pada pemahaman teks
                sastra, adab, dan karya-karya ulama klasik. Program ini
                dirancang untuk santri yang sudah memiliki dasar bahasa Arab dan
                ingin naik ke level memahami kitab sastra, menulis, serta mampu
                berdiskusi ilmiah dalam bahasa Arab.
              </p>

              <div className="grid gap-3 md:grid-cols-2 text-[13px] md:text-sm">
                <div className="space-y-1">
                  <h3 className="font-semibold">Durasi & pola belajar</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Lama belajar kurang-lebih 2 tahun (4 semester).</li>
                    <li>
                      Pertemuan rutin 3–4 kali per pekan (online/offline).
                    </li>
                    <li>
                      Kombinasi halaqah kitab, tugas terstruktur, dan ujian
                      akhir.
                    </li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">Fokus & karakter program</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Pemahaman teks sastra Arab klasik & modern.</li>
                    <li>
                      Penguatan kaidah nahwu, sharaf, dan balaghah terpakai.
                    </li>
                    <li>
                      Latihan menulis esai & makalah singkat berbahasa Arab.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-1 text-[13px] md:text-sm">
                <h3 className="font-semibold">Target capaian lulusan</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>
                    Mampu membaca dan menjelaskan isi kitab sastra Arab tingkat
                    menengah.
                  </li>
                  <li>
                    Mampu menulis paragraf hingga esai pendek dengan bahasa Arab
                    baku.
                  </li>
                  <li>
                    Terbiasa berdiskusi dan presentasi materi ilmiah dalam
                    bahasa Arab.
                  </li>
                  <li>
                    Memiliki fondasi kuat untuk melanjutkan ke tingkat lanjut
                    atau spesialisasi lain.
                  </li>
                </ul>
              </div>

              <div className="space-y-1 text-[13px] md:text-sm">
                <h3 className="font-semibold">
                  Contoh kitab & referensi utama
                </h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>
                    Qishash & teks pilihan dari karya sastra Arab klasik dan
                    modern.
                  </li>
                  <li>
                    Kitab nahwu & sharaf terapan (contoh:{" "}
                    <em>An-Nahwu Al-Wadlih</em> dan sejenisnya).
                  </li>
                  <li>
                    Pengantar balaghah dan uslub bahasa dalam Al-Qur’an & hadis.
                  </li>
                  <li>
                    Modul internal Diploma Ilmi yang disusun tim pengajar.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* CTA gabung */}
          <div className="pt-2 space-y-2">
            <Button
              className="w-full md:w-auto"
              disabled={isFull}
              onClick={() =>
                navigate(`biaya`, {
                  state: {
                    pmb_class_id: cls.class_id,
                    pmb_class_slug: cls.class_slug,
                    from_pmb_detail: true,
                  },
                })
              }
            >
              <Users className="w-4 h-4 mr-2" />
              {isFull ? "Kuota penuh" : "Gabung ke kelas ini"}
            </Button>

            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3" />
              Setelah login atau membuat akun, sistem bisa mengarahkan langsung
              ke formulir PMB kelas ini (gunakan state <code>
                pmb_class_id
              </code>{" "}
              / <code>pmb_class_slug</code>).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}