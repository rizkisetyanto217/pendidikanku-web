// src/pages/profile/website/website/pmb/PendWebPMBClassDetail.tsx
import { useParams, useNavigate, Link } from "react-router-dom";
import { GraduationCap, ArrowRight, Users, Info } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// value imports
import {
  dummyClasses,
  formatDeliveryMode,
  formatRegWindow,
} from "../PendWebPMBInfo";

// type-only import
import type { PMBClassRow } from "../PendWebPMBInfo";

export default function PendWebPMBClassDetail() {
  const { school_slug, id } = useParams<{
    school_slug: string;
    id: string;
  }>();
  const navigate = useNavigate();

  const slug = school_slug ?? "sekolah";

  const cls: PMBClassRow | undefined = dummyClasses.find(
    (c) => c.class_id === id
  );

  if (!cls) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 md:py-14 md:px-6 space-y-6">
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

  const quotaInfo =
    cls.class_quota_total != null
      ? `${cls.class_quota_taken}/${cls.class_quota_total} kursi`
      : `${cls.class_quota_taken} pendaftar`;

  const isFull =
    cls.class_quota_total != null &&
    cls.class_quota_taken >= cls.class_quota_total;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 md:py-14 md:px-6 space-y-8">
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

          {/* Deskripsi program – dibuat lebih padat & rinci */}
          {cls.class_notes && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Deskripsi Program Diploma Ilmi – Sastra Arab
              </p>

              <p className="text-sm md:text-base text-muted-foreground">
                Diploma Ilmi jurusan{" "}
                <span className="font-semibold">Sastra Arab</span>
                adalah program pendalaman bahasa Arab yang berfokus pada{" "}
                pemahaman teks sastra, adab, dan karya-karya ulama klasik.
                Program ini dirancang untuk santri yang sudah memiliki dasar
                bahasa Arab dan ingin naik ke level memahami kitab sastra,
                menulis, serta mampu berdiskusi ilmiah dalam bahasa Arab.
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
                navigate(`/${slug}/login`, {
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

            <Button
              variant="outline"
              className="w-full md:w-auto"
              onClick={() =>
                navigate("/register", {
                  state: {
                    pmb_class_id: cls.class_id,
                    pmb_class_slug: cls.class_slug,
                    school_slug: slug,
                  },
                })
              }
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Daftar akun baru dulu
            </Button>

            {/* 🔹 Tombol ke rincian biaya */}
            <Button
              variant="ghost"
              className="w-full md:w-auto"
              onClick={() => navigate(`/${slug}/pmb/${cls.class_id}/biaya`)}
            >
              <Info className="w-4 h-4 mr-2" />
              Lihat rincian biaya pendidikan
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
