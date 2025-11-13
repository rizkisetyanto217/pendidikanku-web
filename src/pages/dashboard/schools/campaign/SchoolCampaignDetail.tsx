// src/pages/sekolahislamku/campaign/SchoolCampaignDetailPage.tsx
import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

/* icons */
import {
  Heart,
  HeartHandshake,
  CalendarDays,
  Users,
  ArrowLeft,
  ArrowRight,
  Tag,
} from "lucide-react";

import type { CampaignItem } from "./SchoolCampaign";

/* =========================================================
   DEMO TOGGLE
========================================================= */
const __USE_DEMO__ = true;

/* =========================================================
   TYPES (Detail)
========================================================= */
type DonorItem = {
  id: string;
  name: string;
  amount: number;
  date: string; // ISO
  note?: string;
  isAnonymous?: boolean;
};

export type CampaignDetail = CampaignItem & {
  longDescription?: string;
  usagePlan?: string;
  bankInfo?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  }[];
  recentDonors?: DonorItem[];
};

/* =========================================================
   UTILS
========================================================= */
const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const dateFmt = (iso?: string | null): string => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const calcProgress = (target: number, collected: number): number => {
  if (!target || target <= 0) return 0;
  const pct = Math.round((collected / target) * 100);
  if (pct < 0) return 0;
  if (pct > 100) return 100;
  return pct;
};

const statusLabel = (s: CampaignItem["status"]): string => {
  switch (s) {
    case "open":
      return "Sedang Dibuka";
    case "closed":
      return "Selesai";
    case "scheduled":
      return "Terjadwal";
    case "draft":
      return "Draft";
    default:
      return s;
  }
};

const statusVariant = (
  s: CampaignItem["status"]
): "default" | "outline" | "destructive" => {
  switch (s) {
    case "open":
      return "default";
    case "scheduled":
      return "outline";
    case "closed":
      return "destructive";
    case "draft":
      return "outline";
    default:
      return "outline";
  }
};

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

/* =========================================================
   DEMO DATA DETAIL
========================================================= */
function makeDemoCampaignDetail(
  schoolId: string,
  slugOrId: string
): CampaignDetail | null {
  // supaya konsisten dengan list:
  const base: CampaignItem[] = [
    {
      id: "cmp-1",
      schoolId,
      title: "Renovasi Musholla Sekolah",
      slug: "renovasi-musholla-sekolah",
      shortDescription:
        "Penggalangan dana untuk renovasi musholla agar lebih nyaman digunakan untuk sholat berjamaah dan kajian.",
      imageUrl: "https://picsum.photos/seed/musholla/720/360",
      category: "Sarana Ibadah",
      targetAmount: 50_000_000,
      collectedAmount: 21_750_000,
      donorCount: 124,
      startDate: new Date(Date.now() - 7 * 864e5).toISOString(),
      endDate: new Date(Date.now() + 23 * 864e5).toISOString(),
      status: "open",
      isHighlighted: true,
    },
    {
      id: "cmp-2",
      schoolId,
      title: "Beasiswa Siswa Yatim & Dhuafa",
      slug: "beasiswa-yatim-dhuafa",
      shortDescription:
        "Bantu biaya pendidikan siswa yatim dan dhuafa agar tetap bisa belajar dengan tenang.",
      imageUrl: "https://picsum.photos/seed/beasiswa/720/360",
      category: "Beasiswa",
      targetAmount: 100_000_000,
      collectedAmount: 72_300_000,
      donorCount: 203,
      startDate: new Date(Date.now() - 14 * 864e5).toISOString(),
      endDate: new Date(Date.now() + 16 * 864e5).toISOString(),
      status: "open",
    },
    {
      id: "cmp-3",
      schoolId,
      title: "Pengadaan Al-Qur'an & Buku Iqro",
      slug: "pengadaan-alquran-buku-iqro",
      shortDescription:
        "Pengadaan mushaf Al-Qur'an dan buku Iqro baru untuk kelas tahfidz dan TPA sore.",
      imageUrl: "https://picsum.photos/seed/alquran/720/360",
      category: "Perlengkapan Ibadah",
      targetAmount: 15_000_000,
      collectedAmount: 15_000_000,
      donorCount: 89,
      startDate: new Date(Date.now() - 30 * 864e5).toISOString(),
      endDate: new Date(Date.now() - 1 * 864e5).toISOString(),
      status: "closed",
    },
  ];

  const found =
    base.find((c) => c.id === slugOrId || c.slug === slugOrId) ?? base[0];

  if (!found) return null;

  const detail: CampaignDetail = {
    ...found,
    longDescription:
      found.id === "cmp-1"
        ? `Renovasi musholla ini mencakup:
- Perbaikan atap dan plafon yang bocor
- Penggantian karpet dan sajadah
- Penambahan rak Al-Qur'an dan kitab
- Perbaikan sound system untuk adzan dan kajian

Targetnya, musholla menjadi pusat kegiatan ibadah siswa: sholat berjamaah, halaqoh, kajian pekanan, dan kegiatan keagamaan lain.`
        : found.id === "cmp-2"
        ? `Program beasiswa ini difokuskan untuk:
- Siswa yatim dan dhuafa dengan komitmen belajar tinggi
- Membantu biaya SPP, buku, dan perlengkapan sekolah
- Mengurangi risiko putus sekolah karena faktor ekonomi

Penyaluran beasiswa dilakukan per semester dengan mekanisme verifikasi yang ketat.`
        : `Campaign ini bertujuan menyediakan Al-Qur'an dan buku Iqro yang layak untuk siswa, khususnya kelas tahfidz dan TPA sore.`,
    usagePlan:
      found.id === "cmp-1"
        ? "70% dana untuk renovasi fisik (atap, lantai, karpet), 20% untuk fasilitas pendukung (sound system, rak), 10% untuk operasional dan dokumentasi."
        : found.id === "cmp-2"
        ? "80% dana langsung ke pembiayaan siswa (SPP, buku, seragam), 10% untuk kegiatan pendampingan, 10% untuk operasional pengelolaan."
        : "100% dana akan digunakan untuk pembelian mushaf Al-Qur'an dan buku Iqro, termasuk distribusi dan logistik internal.",
    bankInfo: [
      {
        bankName: "BCA",
        accountName: "Yayasan Pendidikan Islamku",
        accountNumber: "123 456 7890",
      },
      {
        bankName: "BSI",
        accountName: "Yayasan Pendidikan Islamku",
        accountNumber: "700 1234 567",
      },
    ],
    recentDonors: [
      {
        id: "d1",
        name: "Hamba Allah",
        isAnonymous: true,
        amount: 500_000,
        date: new Date(Date.now() - 2 * 3600_000).toISOString(),
        note: "Semoga berkah untuk para siswa.",
      },
      {
        id: "d2",
        name: "Keluarga Bapak Ahmad",
        amount: 1_000_000,
        date: new Date(Date.now() - 1 * 864e5).toISOString(),
      },
      {
        id: "d3",
        name: "Alumni Angkatan 2010",
        amount: 2_500_000,
        date: new Date(Date.now() - 3 * 864e5).toISOString(),
        note: "Titip doa untuk orang tua kami.",
      },
    ],
  };

  return detail;
}

/* =========================================================
   API (dengan fallback demo)
========================================================= */
const QK = {
  CAMPAIGN_DETAIL: (schoolId: string, slugOrId: string) =>
    ["school-campaign-detail", schoolId, slugOrId] as const,
};

async function fetchCampaignDetail(
  schoolId: string,
  slugOrId: string
): Promise<CampaignDetail | null> {
  if (__USE_DEMO__) return makeDemoCampaignDetail(schoolId, slugOrId);

  try {
    const res = await axios.get<{ data: CampaignDetail | null }>(
      `/api/a/${schoolId}/campaigns/${slugOrId}`,
      {
        withCredentials: true,
      }
    );
    return res.data?.data ?? null;
  } catch (e) {
    console.warn("[school-campaign-detail] API error, fallback demo", e);
    return makeDemoCampaignDetail(schoolId, slugOrId);
  }
}

/* =========================================================
   SMALL UI PIECES
========================================================= */
function DonorList({ donors }: { donors: DonorItem[] }) {
  if (!donors || donors.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">
        Belum ada donatur yang tercatat.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {donors.slice(0, 5).map((d) => (
        <div
          key={d.id}
          className="rounded-lg border p-2.5 flex items-start justify-between gap-2"
        >
          <div className="min-w-0">
            <div className="text-xs font-medium truncate">
              {d.isAnonymous ? "Hamba Allah" : d.name}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {dateFmt(d.date)}
            </div>
            {d.note && (
              <div className="text-xs mt-1 text-muted-foreground line-clamp-2">
                “{d.note}”
              </div>
            )}
          </div>
          <div className="text-right shrink-0 text-xs font-semibold">
            {formatIDR(d.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */
const SchoolCampaignDetailPage: React.FC = () => {
  const { schoolId = "", campaignSlugOrId = "" } = useParams<{
    schoolId: string;
    campaignSlugOrId: string;
  }>();
  const navigate = useNavigate();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: QK.CAMPAIGN_DETAIL(schoolId || "default", campaignSlugOrId),
    enabled: (!!schoolId && !!campaignSlugOrId) || __USE_DEMO__,
    queryFn: () =>
      fetchCampaignDetail(schoolId || "default", campaignSlugOrId || "cmp-1"),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const c = data || null;

  const progress = useMemo(
    () => (c ? calcProgress(c.targetAmount, c.collectedAmount) : 0),
    [c]
  );

  /* Skeleton */
  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto py-6 px-4 space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40 w-full md:col-span-2" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!c) {
    return (
      <div className="max-w-screen-2xl mx-auto py-6 px-4 space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="inline-flex items-center gap-1"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Campaign tidak ditemukan.
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOpen = c.status === "open";

  return (
    <div className="w-full bg-background text-foreground">
      <main className="max-w-screen-2xl mx-auto py-6 px-4 space-y-6">
        {/* Breadcrumb / Back */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="inline-flex items-center gap-1"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          {isFetching && (
            <div className="text-[11px] text-muted-foreground">
              Menyegarkan data…
            </div>
          )}
        </div>

        {/* Header & Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left: Image + summary */}
          <div className="lg:col-span-7 space-y-3">
            <Card className="shadow-sm overflow-hidden">
              {c.imageUrl ? (
                <img
                  src={c.imageUrl}
                  alt={c.title}
                  className="w-full h-60 md:h-72 lg:h-80 object-cover"
                />
              ) : (
                <div className="w-full h-60 md:h-72 lg:h-80 bg-muted grid place-items-center text-muted-foreground text-sm">
                  Tidak ada gambar
                </div>
              )}
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {c.category && (
                      <Badge variant="outline" className="inline-flex gap-1">
                        <Tag className="h-3.5 w-3.5" />
                        {c.category}
                      </Badge>
                    )}
                    <Badge variant={statusVariant(c.status)}>
                      {statusLabel(c.status)}
                    </Badge>
                    {c.isHighlighted && (
                      <Badge className="bg-primary text-primary-foreground inline-flex gap-1">
                        <HeartHandshake className="h-3.5 w-3.5" />
                        Campaign Utama
                      </Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground flex flex-col items-end">
                    <span>
                      Mulai: {dateFmt(c.startDate)}{" "}
                      {c.endDate ? `• Berakhir: ${dateFmt(c.endDate)}` : ""}
                    </span>
                  </div>
                </div>

                <h1 className="text-xl md:text-2xl font-semibold leading-tight">
                  {c.title}
                </h1>

                {/* Progress */}
                <div className="space-y-1.5">
                  <ProgressBar value={progress} />
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">
                      {formatIDR(c.collectedAmount)}{" "}
                      <span className="text-muted-foreground font-normal">
                        dari {formatIDR(c.targetAmount)}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      {progress}% tercapai
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {c.donorCount} donatur
                    </span>
                    {c.endDate ? (
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Target selesai: {dateFmt(c.endDate)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Tanpa batas waktu
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    className="inline-flex items-center gap-2"
                    variant={isOpen ? "default" : "outline"}
                    disabled={!isOpen}
                    onClick={() =>
                      (window.location.href = `/campaigns/${
                        c.slug ?? c.id
                      }/donate`)
                    }
                  >
                    <Heart className="h-4 w-4" />
                    {isOpen ? "Donasi Sekarang" : "Donasi Ditutup"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="inline-flex items-center gap-1 text-xs"
                    onClick={() =>
                      (window.location.href = "/campaigns/history")
                    }
                  >
                    Lihat riwayat donasi sekolah
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Ringkasan & Donors */}
          <div className="lg:col-span-5 space-y-4">
            {/* Ringkasan donasi */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="h-8 w-8 rounded-full grid place-items-center bg-primary/10 text-primary">
                    <Heart className="h-4 w-4" />
                  </span>
                  Ringkasan Donasi
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground mb-1">Terkumpul</div>
                    <div className="font-semibold">
                      {formatIDR(c.collectedAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Target</div>
                    <div className="font-semibold">
                      {formatIDR(c.targetAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Donatur</div>
                    <div className="font-semibold">{c.donorCount}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Status</div>
                    <div className="font-semibold">{statusLabel(c.status)}</div>
                  </div>
                </div>
                <Separator />
                <div className="text-[11px] text-muted-foreground">
                  Laporan penggunaan dana dapat diakses oleh admin sekolah dan
                  wali murid (fitur laporan transparansi bisa dihubungkan ke
                  modul keuangan).
                </div>
              </CardContent>
            </Card>

            {/* Informasi rekening */}
            {c.bankInfo && c.bankInfo.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Rekening Donasi Sekolah
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs">
                  {c.bankInfo.map((b) => (
                    <div
                      key={b.bankName + b.accountNumber}
                      className="rounded-lg border p-2.5"
                    >
                      <div className="font-semibold">{b.bankName}</div>
                      <div>{b.accountNumber}</div>
                      <div className="text-muted-foreground">
                        a.n. {b.accountName}
                      </div>
                    </div>
                  ))}
                  <div className="text-[11px] text-muted-foreground">
                    Setelah transfer manual, panitia bisa mencatat donasi di
                    sistem agar tercatat dalam laporan.
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Donatur terbaru */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  Donatur Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <DonorList donors={c.recentDonors ?? []} />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Deskripsi & Rencana penggunaan */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Tentang Campaign Ini
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {c.longDescription ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {c.longDescription.split("\n").map((line, idx) =>
                      line.startsWith("-") ? (
                        <li key={idx} className="ml-4">
                          {line.replace(/^-+\s*/, "")}
                        </li>
                      ) : (
                        <p key={idx}>{line}</p>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Belum ada deskripsi panjang untuk campaign ini.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Rencana Penggunaan Dana
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {c.usagePlan ? (
                  <p className="text-sm text-foreground/90 whitespace-pre-line">
                    {c.usagePlan}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Rencana penggunaan dana akan diinformasikan oleh pengelola
                    campaign.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SchoolCampaignDetailPage;
