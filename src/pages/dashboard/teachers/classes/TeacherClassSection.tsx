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
} from "@/components/ui/select";
import {
  Users,
  CalendarDays,
  MapPin,
  UserSquare2,
  ArrowLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

/* axios + token helper */
import axios, { getAccessToken } from "@/lib/axios";

/* Tambahan untuk breadcrumb sistem dashboard */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import CBadgeStatus from "@/components/costum/common/badges/CBadgeStatus";
import CMenuSearch from "@/components/costum/common/CMenuSearch";
import { cardHover } from "@/components/costum/table/CDataTable";

/* ==========================================================
   Types API
========================================================== */

type ApiClassRoomSnapshot = {
  name?: string | null;
  slug?: string | null;
  join_url?: string | null;
  platform?: string | null;
  is_virtual?: boolean | null;
};

type ApiTeacherSnapshot = {
  name?: string | null;
  title_prefix?: string | null;
  title_suffix?: string | null;
  whatsapp_url?: string | null;
};

type ApiClassSectionItem = {
  class_section_id: string;
  class_section_school_id: string;
  class_section_class_id: string;
  class_section_slug: string;
  class_section_name: string;
  class_section_code: string;
  class_section_schedule: string | null;
  class_section_capacity: number | null;
  class_section_total_students: number;
  class_section_group_url: string | null;
  class_section_image_url: string | null;
  class_section_image_object_key: string | null;
  class_section_image_url_old: string | null;
  class_section_image_object_key_old: string | null;
  class_section_image_delete_pending_until: string | null;
  class_section_is_active: boolean;
  class_section_created_at: string;
  class_section_updated_at: string;
  class_section_class_name_snapshot: string;
  class_section_class_slug_snapshot: string;
  class_section_class_parent_id: string;
  class_section_class_parent_name_snapshot: string;
  class_section_class_parent_slug_snapshot: string;
  class_section_class_parent_level_snapshot: number;
  class_section_school_teacher_id: string;
  class_section_school_teacher_snapshot?: ApiTeacherSnapshot | null;
  class_section_class_room_id: string | null;
  class_section_class_room_slug_snapshot: string | null;
  class_section_class_room_name_snapshot: string | null;
  class_section_class_room_snapshot?: ApiClassRoomSnapshot | null;
  class_section_academic_term_id: string | null;
  class_section_snapshot_updated_at: string;
  class_section_subject_teachers_enrollment_mode: string | null;
  class_section_subject_teachers_self_select_requires_approval: boolean;
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
};

/* ==========================================================
   View Model untuk UI
========================================================== */
export type SectionRow = {
  id: string;
  schoolId: string;
  name: string;
  slug?: string;
  code?: string;
  roomName?: string;
  roomLocation?: string;
  homeroomName?: string;
  assistantName?: string;
  termName?: string;
  termYearLabel?: string;
  scheduleText?: string;
  totalStudents: number;
  isActive: boolean;
  createdAt?: string;
};

/* ==========================================================
   JWT Helper: ambil teacher_id dari token
========================================================== */

function parseJwt(token: string): any | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getTeacherIdFromToken(): string | null {
  const token = getAccessToken();
  if (!token) return null;
  const payload = parseJwt(token);
  if (!payload) return null;

  // sesuaikan dengan claim yang kamu pakai di backend
  return (
    payload.school_teacher_id || payload.teacher_id || payload.teacherID || null
  );
}

/* ==========================================================
   Fetch dari API /u/class-sections/list?teacher_id=
========================================================== */

async function fetchSections(): Promise<SectionRow[]> {
  const teacherId = getTeacherIdFromToken();
  if (!teacherId) {
    throw new Error("Tidak dapat membaca teacher_id dari token.");
  }

  const res = await axios.get<ApiClassSectionListResponse>(
    "/u/class-sections/list",
    {
      params: {
        teacher_id: teacherId,
      },
    }
  );

  const items = res.data?.data ?? [];

  const mapped: SectionRow[] = items.map((it) => {
    const teacher = it.class_section_school_teacher_snapshot;
    const roomSnap = it.class_section_class_room_snapshot;

    const homeroomName =
      teacher?.name ?? it.class_section_school_teacher_id ?? undefined;

    const termName = it.class_section_class_parent_name_snapshot || undefined;

    const termYearLabel =
      termName && /\d{4}\/\d{4}/.test(termName)
        ? termName.match(/\d{4}\/\d{4}/)?.[0] ?? undefined
        : undefined;

    const scheduleText =
      it.class_section_schedule ??
      (roomSnap?.is_virtual ? "Kelas daring (jadwal belum diatur)" : undefined);

    return {
      id: it.class_section_id,
      schoolId: it.class_section_school_id,
      name: it.class_section_name,
      slug: it.class_section_slug,
      code: it.class_section_code,
      roomName:
        it.class_section_class_room_name_snapshot ??
        roomSnap?.name ??
        undefined,
      roomLocation: roomSnap?.platform ?? undefined,
      homeroomName,
      assistantName: undefined,
      termName,
      termYearLabel,
      scheduleText: scheduleText ?? undefined,
      totalStudents: it.class_section_total_students ?? 0,
      isActive: it.class_section_is_active,
      createdAt: it.class_section_created_at,
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
          (r.homeroomName ?? "").toLowerCase().includes(qLower) ||
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
   Section Card
========================================================== */
function SectionCard({ s }: { s: SectionRow }) {
  return (
    <Card
      className={`p-4 border rounded-xl bg-card ${cardHover}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base truncate">{s.name}</h3>
            <CBadgeStatus
              status={s.isActive ? "active" : "inactive"}
              className="text-xs"
            />

          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            <UserSquare2 className="inline mr-1 h-4 w-4" />
            {s.homeroomName ?? "-"}
          </div>
        </div>

        <Badge variant="outline" className="shrink-0">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          {s.roomName ?? "—"}
        </Badge>
      </div>

      {s.scheduleText && (
        <div className="mt-3 text-sm text-muted-foreground">
          <CalendarDays className="inline h-4 w-4 mr-1" />
          {s.scheduleText}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="text-muted-foreground">
          <Users className="inline h-4 w-4 mr-1" />
          {s.totalStudents} siswa
        </div>
        <div className="text-muted-foreground truncate max-w-[60%] text-right">
          {s.termName ?? "-"}
        </div>
      </div>

      <div className="pt-4 text-right">
        <Link to={`${s.id}`}>
          <Button size="sm" className="inline-flex items-center">
            Buka Kelas
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
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
  backTo
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
          <Button
            variant="outline"
            onClick={() => navigate(-1)}>
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
            <h1 className="text-xl font-semibold md:text-xl">Kelas yang Saya Ajar</h1>
          </div>

          {/* Filters */}
          <CMenuSearch
            value={f.q}
            onChange={f.setQ}
            placeholder="Cari nama kelas / wali / ruang…"
            className="w-full"
          />

          <div className="flex flex-wrap gap-3">
            <Select value={f.active} onValueChange={f.setActive}>
              <SelectContent>
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