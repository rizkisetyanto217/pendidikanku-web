// src/pages/student/StudentEnrollmentPage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Users,
  BookOpen,
  MapPin,
  Search,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

/* Import untuk breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useNavigate } from "react-router-dom";
import { cardHover } from "@/components/costum/table/CDataTable";

/* ============================================
   Types
============================================ */

type ClassMode = "onsite" | "online" | "hybrid";

type OpenClassItem = {
  id: string;
  name: string;
  code?: string;
  levelLabel?: string;
  homeroomTeacher?: string;
  scheduleSummary: string;
  roomLabel?: string;
  mode: ClassMode;
  seatsLeft?: number;
  enrollmentEndLabel?: string;
  isEnrolled: boolean;
};

/* ============================================
   Demo data (nanti ganti pakai API)
============================================ */

const DEMO_OPEN_CLASSES: OpenClassItem[] = [
  {
    id: "1",
    name: "Tahfidz Juz 30 Dasar",
    code: "TFZ-30D",
    levelLabel: "SMP / 7",
    homeroomTeacher: "Ust. Ahmad",
    scheduleSummary: "Senin & Rabu, 07.00 - 08.30",
    roomLabel: "Ruang Tahfidz Lantai 2",
    mode: "onsite",
    seatsLeft: 5,
    enrollmentEndLabel: "Sampai 20 Nov 2025",
    isEnrolled: false,
  },
  {
    id: "2",
    name: "Fiqih Ibadah Praktis",
    code: "FQH-IBD",
    levelLabel: "SMA / X",
    homeroomTeacher: "Ustadzah Aisyah",
    scheduleSummary: "Selasa, 15.30 - 17.00",
    roomLabel: "Online (Google Meet)",
    mode: "online",
    seatsLeft: 0,
    enrollmentEndLabel: "Sampai 25 Nov 2025",
    isEnrolled: false,
  },
  {
    id: "3",
    name: "Matematika Wajib X IPA",
    code: "MTK-XIPA",
    levelLabel: "SMA / X",
    homeroomTeacher: "Bu Rani",
    scheduleSummary: "Senin, Rabu & Jumat, 08.00 - 09.30",
    roomLabel: "Gedung B, Lantai 1",
    mode: "hybrid",
    seatsLeft: 10,
    enrollmentEndLabel: "Sampai 30 Nov 2025",
    isEnrolled: true,
  },
];

/* ============================================
   Helper UI
============================================ */

function ModeBadge({ mode }: { mode: ClassMode }) {
  switch (mode) {
    case "onsite":
      return <Badge variant="outline">Tatap muka</Badge>;
    case "online":
      return <Badge variant="outline">Online</Badge>;
    case "hybrid":
      return <Badge variant="outline">Hybrid</Badge>;
    default:
      return null;
  }
}

function SeatsBadge({ seatsLeft }: { seatsLeft?: number }) {
  if (seatsLeft == null) return null;

  if (seatsLeft <= 0) {
    return <Badge variant="destructive">Penuh</Badge>;
  }

  if (seatsLeft <= 5) {
    return <Badge variant="secondary">Sisa {seatsLeft} kursi</Badge>;
  }

  return <Badge variant="outline">Tersedia ({seatsLeft})</Badge>;
}

/* ============================================
   Page Component
============================================ */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function StudentAdministrationEnrollment({ showBack = false, backTo }: Props) {
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  /* ✅ Breadcrumb */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Pendaftaran",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Administrasi" },
        { label: "Pendaftaran Kelas" },
      ],
      showBack,
    });
  }, [setHeader, showBack]);

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [items, setItems] = useState<OpenClassItem[]>(DEMO_OPEN_CLASSES);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter((item) => {
      if (levelFilter !== "all" && item.levelLabel) {
        if (!item.levelLabel.toLowerCase().includes(levelFilter)) {
          return false;
        }
      }

      if (!q) return true;

      const haystack = [
        item.name,
        item.code,
        item.levelLabel,
        item.homeroomTeacher,
        item.scheduleSummary,
        item.roomLabel,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [items, search, levelFilter]);

  const handleEnroll = (id: string) => {
    // TODO: sambungkan ke API POST /.../classes/:id/enroll
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isEnrolled: true } : item
      )
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="md:flex hidden gap-3 items-center">
        {showBack && (
          <Button
            onClick={handleBack}
            variant="ghost"
            size="icon"
            className="cursor-pointer self-start"
          >
            <ArrowLeft size={20} />
          </Button>
        )}
        <div>
          <h1 className="text-xl font-semibold md:text-xl">
            Pendaftaran Kelas
          </h1>
          <p className="text-sm text-muted-foreground">
            Lihat semua kelas yang sedang dibuka dan daftar langsung dari halaman
            ini.
          </p>
        </div>
      </div>



      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Cari kelas, guru, atau kode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Filter jenjang:
          </span>
          <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua jenjang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua jenjang</SelectItem>
              <SelectItem value="smp">SMP</SelectItem>
              <SelectItem value="sma">SMA</SelectItem>
              <SelectItem value="sd">SD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      <div className="rounded-md border bg-card/40 p-3 sm:p-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
            <BookOpen className="h-6 w-6" />
            <div className="text-sm font-medium">
              Belum ada kelas yang cocok dengan filter ini.
            </div>
            <p className="text-xs max-w-xs">
              Coba ganti kata kunci pencarian atau ubah filter jenjang.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <Card
              key={item.id}
              className={`border-muted bg-background/80 ${cardHover}`}
            >

              <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-base font-semibold leading-tight">
                      {item.name}
                    </CardTitle>
                    {item.code && (
                      <Badge variant="outline" className="text-[10px]">
                        {item.code}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {item.levelLabel && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {item.levelLabel}
                      </span>
                    )}
                    {item.homeroomTeacher && (
                      <>
                        <span className="text-muted-foreground/60">•</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Wali: {item.homeroomTeacher}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <ModeBadge mode={item.mode} />
                    <SeatsBadge seatsLeft={item.seatsLeft} />
                  </div>
                  {item.enrollmentEndLabel && (
                    <span className="text-[10px] text-muted-foreground">
                      Pendaftaran: {item.enrollmentEndLabel}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-3 pt-0">
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {item.scheduleSummary}
                  </span>

                  {item.roomLabel && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.roomLabel}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  {item.isEnrolled ? (
                    <div className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Anda sudah terdaftar di kelas ini.</span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground max-w-md">
                      Pastikan jadwal dan lokasi cocok sebelum mendaftar.
                    </p>
                  )}

                  <div className="flex justify-start sm:justify-end">
                    {item.isEnrolled ? (
                      <Button variant="outline" size="sm" disabled className="text-xs">
                        Sudah terdaftar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="text-xs"
                        onClick={() => handleEnroll(item.id)}
                        disabled={item.seatsLeft !== undefined && item.seatsLeft <= 0}
                      >
                        {item.seatsLeft !== undefined && item.seatsLeft <= 0
                          ? "Kelas penuh"
                          : "Daftar kelas"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
