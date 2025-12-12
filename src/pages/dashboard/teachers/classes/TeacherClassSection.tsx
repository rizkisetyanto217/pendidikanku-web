// src/pages/dashboard/teacher/classes/TeacherClassSection.tsx
import { useMemo, useState, useDeferredValue, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  CalendarDays,
  UserSquare2,
  ArrowLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

/* axios */
import axios from "@/lib/axios";

/* Tambahan untuk breadcrumb sistem dashboard */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import CBadgeStatus from "@/components/costum/common/badges/CBadgeStatus";
import CMenuSearch from "@/components/costum/common/CMenuSearch";
import { cardHover } from "@/components/costum/table/CDataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/* ==========================================================
   Types API (disesuaikan dengan response terbaru)
========================================================== */

type ApiClassSectionTeacherSnapshot = {
  id: string;
  name: string;
  avatar_url?: string | null;
  title_prefix?: string | null;
  title_suffix?: string | null;
  whatsapp_url?: string | null;
  gender?: string | null;
  teacher_code?: string | null;
};

type ApiClassSectionItem = {
  class_section_id: string;
  class_section_academic_term_id?: string | null;
  class_section_slug: string;
  class_section_name: string;
  class_section_code: string;
  class_section_image_url?: string | null;
  class_section_quota_total?: number | null;
  class_section_quota_taken?: number | null;
  class_section_status: string; // "active" | "inactive" | dll
  class_section_academic_term_name_cache?: string | null;
  class_section_academic_term_slug_cache?: string | null;
  class_section_school_teacher_id: string;
  class_section_school_teacher?: ApiClassSectionTeacherSnapshot | null;
};

type ApiClassSectionListResponse = {
  success: boolean;
  message: string;
  data: ApiClassSectionItem[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
    count: number;
    per_page_options: number[];
  };
  include?: Record<string, unknown>;
};

/* ==========================================================
   View Model untuk UI
========================================================== */
export type SectionRow = {
  id: string;
  schoolId?: string;
  name: string;
  slug?: string;
  code?: string;
  termName?: string;
  termYearLabel?: string;
  totalStudents: number;
  isActive: boolean;
  createdAt?: string;

  // info gambar
  imageUrl?: string | null;

  // info guru
  teacherId: string;
  teacherName?: string;
  teacherAvatarUrl?: string | null;
  teacherTitlePrefix?: string | null;
  teacherTitleSuffix?: string | null;
  teacherWhatsappUrl?: string | null;
  teacherCode?: string | null;

  // kuota
  quotaTotal?: number | null;
  quotaTaken?: number | null;

  // field lama yang masih dipakai di filter/search
  roomName?: string;
  roomLocation?: string;
  homeroomName?: string;
  assistantName?: string;
  scheduleText?: string;
};

/* ==========================================================
   Helper kecil
========================================================== */

function getInitials(name?: string) {
  if (!name) return "K";
  return name
    .split(" ")
    .filter(Boolean)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ==========================================================
   Fetch dari API /u/class-sections/list?teacher=me
========================================================== */

async function fetchSections(): Promise<SectionRow[]> {
  const res = await axios.get<ApiClassSectionListResponse>(
    "/u/class-sections/list",
    {
      params: {
        teacher: "me",
      },
    }
  );

  const items = res.data?.data ?? [];

  const mapped: SectionRow[] = items.map((it) => {
    const teacherSnap = it.class_section_school_teacher;

    const teacherName = teacherSnap?.name ?? it.class_section_school_teacher_id;
    const termName = it.class_section_academic_term_name_cache || undefined;

    const termYearLabel =
      termName && /\d{4}\/\d{4}/.test(termName)
        ? termName.match(/\d{4}\/\d{4}/)?.[0] ?? undefined
        : undefined;

    return {
      id: it.class_section_id,
      schoolId: undefined, // belum ada di response
      name: it.class_section_name,
      slug: it.class_section_slug,
      code: it.class_section_code,

      termName,
      termYearLabel,

      totalStudents: it.class_section_quota_total ?? 0,
      isActive: it.class_section_status === "active",
      createdAt: undefined,

      imageUrl: it.class_section_image_url ?? null,

      teacherId: it.class_section_school_teacher_id,
      teacherName: teacherName,
      teacherAvatarUrl: teacherSnap?.avatar_url ?? null,
      teacherTitlePrefix: teacherSnap?.title_prefix ?? null,
      teacherTitleSuffix: teacherSnap?.title_suffix ?? null,
      teacherWhatsappUrl: teacherSnap?.whatsapp_url ?? null,
      teacherCode: teacherSnap?.teacher_code ?? null,

      quotaTotal: it.class_section_quota_total ?? null,
      quotaTaken: it.class_section_quota_taken ?? null,

      // belum ada data ruang/jadwal di response terbaru
      roomName: undefined,
      roomLocation: undefined,
      homeroomName: teacherName,
      assistantName: undefined,
      scheduleText: undefined,
    };
  });

  return mapped;
}

function useSections() {
  return useQuery({
    queryKey: ["teacher-class-sections"],
    queryFn: fetchSections,
    staleTime: 2 * 60_000,
  });
}

/* ==========================================================
   Filter logic
========================================================== */
function useFilters(rows: SectionRow[]) {
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);
  const [term, setTerm] = useState<string>("all");
  const [room, setRoom] = useState<string>("all");
  const [active, setActive] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "students" | "created">("name");

  const terms = useMemo<string[]>(
    () => [
      "all",
      ...Array.from(
        new Set(
          rows
            .map((r) => r.termName)
            .filter((x): x is string => typeof x === "string" && x.length > 0)
        )
      ),
    ],
    [rows]
  );

  const rooms = useMemo<string[]>(
    () => [
      "all",
      ...Array.from(
        new Set(
          rows
            .map((r) => r.roomName)
            .filter((x): x is string => typeof x === "string" && x.length > 0)
        )
      ),
    ],
    [rows]
  );

  const filtered = useMemo(() => {
    let list = rows;

    if (dq) {
      const qLower = dq.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(qLower) ||
          (r.teacherName ?? "").toLowerCase().includes(qLower) ||
          (r.roomName ?? "").toLowerCase().includes(qLower)
      );
    }

    if (term !== "all") list = list.filter((r) => r.termName === term);
    if (room !== "all") list = list.filter((r) => r.roomName === room);
    if (active === "active") list = list.filter((r) => r.isActive);
    if (active === "inactive") list = list.filter((r) => !r.isActive);

    if (sortBy === "name")
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "students")
      list = [...list].sort((a, b) => b.totalStudents - a.totalStudents);
    if (sortBy === "created")
      list = [...list].sort((a, b) =>
        (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
      );

    return list;
  }, [rows, dq, term, room, active, sortBy]);

  return {
    q,
    setQ,
    term,
    setTerm,
    terms,
    room,
    setRoom,
    rooms,
    active,
    setActive,
    sortBy,
    setSortBy,
    filtered,
  };
}

/* ==========================================================
   Section Card – lebih padat, tampilkan guru + kuota
========================================================== */
function SectionCard({ s }: { s: SectionRow }) {
  const teacherFullName = [
    s.teacherTitlePrefix?.trim() || "",
    s.teacherName || "",
    s.teacherTitleSuffix ? `, ${s.teacherTitleSuffix.trim()}` : "",
  ]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const quotaText =
    s.quotaTotal != null && s.quotaTaken != null
      ? `Terisi ${s.quotaTaken}/${s.quotaTotal} siswa`
      : s.quotaTotal != null
      ? `Kuota ${s.quotaTotal} siswa`
      : `${s.totalStudents} siswa`;

  return (
    <Card className={`p-4 border rounded-xl bg-card ${cardHover}`}>
      <div className="flex items-start gap-3">
        {/* Thumbnail kelas */}
        <div className="shrink-0">
          {s.imageUrl ? (
            <img
              src={s.imageUrl}
              alt={s.name}
              className="h-14 w-14 rounded-lg object-cover border"
            />
          ) : (
            <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
              {s.code ?? "KLS"}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title + status */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base truncate">{s.name}</h3>
                {s.code && (
                  <Badge variant="outline" className="text-[11px] px-1.5 py-0">
                    {s.code}
                  </Badge>
                )}
              </div>
              {s.termName && (
                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                  {s.termName}
                </div>
              )}
              {s.slug && (
                <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  {s.slug}
                </div>
              )}
            </div>
            <CBadgeStatus
              status={s.isActive ? "active" : "inactive"}
              className="text-xs shrink-0"
            />
          </div>

          {/* Guru */}
          <div className="mt-3 flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage
                src={s.teacherAvatarUrl || ""}
                alt={teacherFullName}
              />
              <AvatarFallback className="text-[10px]">
                {getInitials(s.teacherName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">
                <UserSquare2 className="inline mr-1 h-3.5 w-3.5" />
                {teacherFullName || "-"}
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                {s.teacherCode ? `Kode guru: ${s.teacherCode}` : ""}
              </div>
            </div>
          </div>

          {/* Kuota + term */}
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <div>
              <Users className="inline h-3.5 w-3.5 mr-1" />
              {quotaText}
            </div>
            {s.termYearLabel && (
              <div className="truncate text-right">
                <CalendarDays className="inline h-3.5 w-3.5 mr-1" />
                {s.termYearLabel}
              </div>
            )}
          </div>

          {/* Action */}
          <div className="pt-4 text-right">
            <Link to={`${s.id}`}>
              <Button size="sm" className="inline-flex items-center">
                Buka Kelas
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ==========================================================
   Main Page
========================================================== */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function TeacherClassSection({
  showBack = false,
  backTo,
}: Props) {
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));
  const { data: sections = [], isLoading, isError, error } = useSections();
  const f = useFilters(sections);

  /* Atur breadcrumb dan title seperti SchoolAcademic */
  const { setHeader } = useDashboardHeader();

  useEffect(() => {
    setHeader({
      title: "Wali Kelas",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Wali Kelas" },
      ],
      showBack,
    });
  }, [setHeader, showBack]);

  if (isLoading) {
    return (
      <div className="w-full bg-background text-foreground">
        <main className="mx-auto max-w-5xl px-3 py-10 md:px-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4 animate-spin" />
            Memuat kelas yang Anda ajar…
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full bg-background text-foreground">
        <main className="mx-auto max-w-5xl px-3 py-10 md:px-4 space-y-3">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>Gagal memuat data kelas.</span>
          </div>
          <div className="text-xs text-muted-foreground break-all">
            {(error as any)?.message ??
              "Periksa koneksi atau coba beberapa saat lagi."}
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6">
          {/* Header Section */}
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
            <h1 className="text-xl font-semibold md:text-xl">
              Kelas yang Saya Ajar
            </h1>
          </div>

          {/* Filters */}
          <CMenuSearch
            value={f.q}
            onChange={f.setQ}
            placeholder="Cari nama kelas / wali…"
            className="w-full"
          />

          <div className="flex flex-wrap gap-3">
            <Select value={f.active} onValueChange={f.setActive}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            {f.filtered.length ? (
              f.filtered.map((s) => <SectionCard key={s.id} s={s} />)
            ) : (
              <Card className="col-span-2 p-10 text-center">
                Tidak ada kelas ditemukan.
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
