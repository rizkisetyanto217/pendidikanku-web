// src/pages/sekolahislamku/campaign/SchoolCampaignPage.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/* icons */
import {
  Heart,
  HeartHandshake,
  CalendarDays,
  Users,
  ArrowRight,
  Filter,
  Tag,
  ArrowLeft,
} from "lucide-react";

/* ---------- BreadCrum ---------- */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* =========================================================
   DEMO TOGGLE
========================================================= */
const __USE_DEMO__ = true;

/* =========================================================
   TYPES
========================================================= */
type CampaignStatus = "open" | "closed" | "scheduled" | "draft";

export type CampaignItem = {
  id: string;
  schoolId: string;
  title: string;
  slug?: string;
  shortDescription?: string;
  imageUrl?: string | null;
  category?: string | null;

  targetAmount: number; // dalam rupiah
  collectedAmount: number; // dalam rupiah
  donorCount: number;

  startDate: string; // ISO
  endDate?: string | null; // ISO
  status: CampaignStatus;

  isHighlighted?: boolean;
};

type CampaignListResponse = {
  message?: string;
  data: CampaignItem[];
};

type StatusFilter = "all" | "open" | "closed" | "scheduled";

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

const statusLabel = (s: CampaignStatus): string => {
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
  s: CampaignStatus
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

/* Simple progress bar (tanpa komponen Progress) */
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
   DEMO DATA
========================================================= */
function makeDemoCampaigns(schoolId: string): CampaignItem[] {
  const now = new Date();
  const addDaysISO = (days: number) =>
    new Date(now.getTime() + days * 864e5).toISOString();
  const minusDaysISO = (days: number) =>
    new Date(now.getTime() - days * 864e5).toISOString();

  return [
    {
      id: "cmp-1",
      schoolId,
      title: "Renovasi Musholla Sekolah",
      slug: "renovasi-musholla-sekolah",
      shortDescription:
        "Penggalangan dana untuk renovasi musholla agar lebih nyaman digunakan untuk sholat berjamaah dan kajian.",
      imageUrl: "https://picsum.photos/seed/musholla/480/260",
      category: "Sarana Ibadah",
      targetAmount: 50_000_000,
      collectedAmount: 21_750_000,
      donorCount: 124,
      startDate: minusDaysISO(7),
      endDate: addDaysISO(23),
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
      imageUrl: "https://picsum.photos/seed/beasiswa/480/260",
      category: "Beasiswa",
      targetAmount: 100_000_000,
      collectedAmount: 72_300_000,
      donorCount: 203,
      startDate: minusDaysISO(14),
      endDate: addDaysISO(16),
      status: "open",
    },
    {
      id: "cmp-3",
      schoolId,
      title: "Pengadaan Al-Qur'an & Buku Iqro",
      slug: "pengadaan-alquran-buku-iqro",
      shortDescription:
        "Pengadaan mushaf Al-Qur'an dan buku Iqro baru untuk kelas tahfidz dan TPA sore.",
      imageUrl: "https://picsum.photos/seed/alquran/480/260",
      category: "Perlengkapan Ibadah",
      targetAmount: 15_000_000,
      collectedAmount: 15_000_000,
      donorCount: 89,
      startDate: minusDaysISO(30),
      endDate: minusDaysISO(1),
      status: "closed",
    },
    {
      id: "cmp-4",
      schoolId,
      title: "Pembangunan Perpustakaan Mini",
      slug: "pembangunan-perpustakaan-mini",
      shortDescription:
        "Perpustakaan mini untuk menunjang budaya literasi di lingkungan sekolah.",
      imageUrl: "https://picsum.photos/seed/perpus/480/260",
      category: "Fasilitas Sekolah",
      targetAmount: 80_000_000,
      collectedAmount: 0,
      donorCount: 0,
      startDate: addDaysISO(5),
      endDate: addDaysISO(45),
      status: "scheduled",
    },
  ];
}

/* =========================================================
   API (dengan fallback demo)
========================================================= */
const QK = {
  CAMPAIGNS: (schoolId: string) => ["school-campaigns", schoolId] as const,
};

async function fetchSchoolCampaigns(schoolId: string): Promise<CampaignItem[]> {
  if (__USE_DEMO__) return makeDemoCampaigns(schoolId);

  try {
    const res = await axios.get<CampaignListResponse>(
      `/api/a/${schoolId}/campaigns`,
      {
        withCredentials: true,
      }
    );
    return res.data?.data ?? [];
  } catch (e) {
    console.warn("[school-campaigns] API error, fallback demo", e);
    return makeDemoCampaigns(schoolId);
  }
}

/* =========================================================
   SMALL UI PIECES
========================================================= */
function CampaignCard({ c }: { c: CampaignItem }) {
  const progress = calcProgress(c.targetAmount, c.collectedAmount);
  const isOpen = c.status === "open";

  return (
    <Card
      className={`overflow-hidden ${c.isHighlighted ? "border-primary/60 shadow-md" : "shadow-sm"
        }`}
    >
      <div className="grid md:grid-cols-[220px,1fr]">
        {/* Image */}
        <div className="relative">
          {c.imageUrl ? (
            <img
              src={c.imageUrl}
              alt={c.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-muted grid place-items-center text-muted-foreground text-xs">
              Tidak ada gambar
            </div>
          )}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {c.category && (
              <Badge
                variant="outline"
                className="bg-background/80 backdrop-blur text-xs"
              >
                <Tag className="h-3 w-3 mr-1" />
                {c.category}
              </Badge>
            )}
            {c.isHighlighted && (
              <Badge
                variant="default"
                className="bg-primary text-primary-foreground text-xs"
              >
                <HeartHandshake className="h-3 w-3 mr-1" />
                Utama
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4 md:p-5 flex flex-col gap-3">
          {/* Title + status */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-base md:text-lg font-semibold leading-snug line-clamp-2">
                {c.title}
              </h3>
              {c.shortDescription && (
                <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-3">
                  {c.shortDescription}
                </p>
              )}
            </div>
            <Badge variant={statusVariant(c.status)} className="shrink-0">
              {statusLabel(c.status)}
            </Badge>
          </div>

          {/* Progress & numbers */}
          <div className="space-y-1">
            <ProgressBar value={progress} />
            <div className="flex items-center justify-between text-xs mt-1">
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
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{c.donorCount} donatur</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {c.endDate ? (
                <span>Berakhir: {dateFmt(c.endDate)}</span>
              ) : (
                <span>Tidak ada batas waktu</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <Button
              size="sm"
              variant={isOpen ? "default" : "outline"}
              disabled={!isOpen}
              onClick={() =>
              (window.location.href = c.slug
                ? `/campaigns/${c.slug}`
                : `/campaigns/${c.id}`)
              }
              className="inline-flex items-center gap-1"
            >
              <Heart className="h-4 w-4" />
              {isOpen ? "Donasi Sekarang" : "Lihat Detail"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs"
              onClick={() =>
              (window.location.href = c.slug
                ? `/campaigns/${c.slug}`
                : `/campaigns/${c.id}`)
              }
            >
              Detail campaign
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

const SchoolCampaign: React.FC<Props> = ({
  showBack = false,
  backTo,
}) => {
  const { schoolId = "" } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  const [statusFilter] = useState<StatusFilter>("open");

  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Donasi",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Dukungan" },
        { label: "Donasi" },
      ],
      actions: null, // bisa isi tombol kalau perlu
    });
  }, [setHeader]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: QK.CAMPAIGNS(schoolId || "default"),
    enabled: !!schoolId || __USE_DEMO__,
    queryFn: () => fetchSchoolCampaigns(schoolId || "default"),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const campaigns = data ?? [];

  const filteredCampaigns = useMemo(() => {
    if (statusFilter === "all") return campaigns;
    return campaigns.filter((c) => {
      if (statusFilter === "open") return c.status === "open";
      if (statusFilter === "closed") return c.status === "closed";
      if (statusFilter === "scheduled") return c.status === "scheduled";
      return true;
    });
  }, [campaigns, statusFilter]);

  const openCount = campaigns.filter((c) => c.status === "open").length;

  const totalTarget = campaigns.reduce((sum, c) => sum + c.targetAmount, 0);
  const totalCollected = campaigns.reduce(
    (sum, c) => sum + c.collectedAmount,
    0
  );

  /* Skeleton */
  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto py-6 px-4 space-y-4">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background text-foreground">
      <main className="max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-semibold text-lg md:text-xl">Donasi</h1>
        </div>
        <Card className="shadow-sm">
          <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="h-12 w-12 rounded-full grid place-items-center bg-primary/10 text-primary">
                <HeartHandshake className="h-6 w-6" />
              </span>
              <div>
                <div className="text-sm text-muted-foreground">
                  Campaign Donasi Sekolah
                </div>
                <div className="text-lg font-semibold leading-tight">
                  Program Kebaikan yang Sedang Berjalan
                </div>
                <div className="text-xs text-muted-foreground">
                  Kelola dan tampilkan penggalangan dana yang sedang dibuka
                  untuk sekolah.
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
              <Badge variant="outline">
                <Heart className="h-3.5 w-3.5 mr-1" />
                Campaign aktif: {openCount}
              </Badge>
              <Badge variant="outline">
                {formatIDR(totalCollected)}{" "}
                <span className="text-muted-foreground ml-1">
                  terkumpul dari {formatIDR(totalTarget)}
                </span>
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Filter & Stats mini */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-3 items-stretch">
          {/* Filter card */}
          <Card className="shadow-sm md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="h-8 w-8 rounded-xl grid place-items-center bg-muted text-primary">
                  <Filter className="h-4 w-4" />
                </span>
                Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground">
                Status campaign:
              </div>
              <div className="flex flex-wrap gap-2">
                {showBack && (
                  <Button
                    onClick={handleBack}
                    variant="ghost"
                    size="icon"
                    className="mb-3"
                  >
                    <ArrowLeft size={20} />
                  </Button>
                )}
                <h1 className="font-semibold text-lg md:text-xl">Donasi</h1>
              </div>
            </CardContent>
          </Card>

          {/* Mini stats */}
          <Card className="shadow-sm md:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="h-8 w-8 rounded-xl grid place-items-center bg-muted text-primary">
                  <Heart className="h-4 w-4" />
                </span>
                Ringkasan Donasi
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Total Campaign
                </div>
                <div className="text-lg font-semibold">{campaigns.length}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Campaign Aktif
                </div>
                <div className="text-lg font-semibold">{openCount}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Total Terkumpul
                </div>
                <div className="text-lg font-semibold">
                  {formatIDR(totalCollected)}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* List Campaign */}
        <section className="space-y-3">
          {isFetching && (
            <div className="text-xs text-muted-foreground">
              Menyegarkan data campaign…
            </div>
          )}

          {filteredCampaigns.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                Belum ada campaign dengan filter ini.
              </CardContent>
            </Card>
          ) : (
            filteredCampaigns.map((c) => <CampaignCard key={c.id} c={c} />)
          )}
        </section>
      </main>
    </div>
  );
};

export default SchoolCampaign;
