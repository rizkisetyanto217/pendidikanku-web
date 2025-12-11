// src/pages/sekolahislamku/teachers/csst/TeacherCSST.tsx
import { useState, useMemo, useDeferredValue, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  MapPin,
  Search,
  ChevronRight,
  LayoutGrid,
  LayoutList,
  AlertTriangle,
  ArrowLeft,
  IdCard,
  Hash,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* axios (token dipakai otomatis via interceptor) */
import axios from "@/lib/axios";

/* Tambahan untuk breadcrumb sistem dashboard */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import CMenuSearch from "@/components/costum/common/CMenuSearch";
import { cardHover } from "@/components/costum/table/CDataTable";

/* =====================
   Types API CSST (mode=compact)
   ===================== */

type DeliveryMode = "offline" | "online" | "hybrid" | string;

type ApiTeacherCache = {
  id?: string | null;
  name?: string | null;
  gender?: string | null;
  avatar_url?: string | null;
  teacher_code?: string | null;
  title_prefix?: string | null;
  title_suffix?: string | null;
  whatsapp_url?: string | null;
};

type ApiCSSTItem = {
  class_section_subject_teacher_id: string;
  class_section_subject_teacher_class_subject_id: string;
  class_section_subject_teacher_school_teacher_id: string;
  class_section_subject_teacher_delivery_mode: DeliveryMode;

  class_section_subject_teacher_class_section_slug_cache: string;
  class_section_subject_teacher_class_section_name_cache: string;
  class_section_subject_teacher_class_section_code_cache: string;

  class_section_subject_teacher_school_teacher_slug_cache: string;
  class_section_subject_teacher_school_teacher_cache: ApiTeacherCache;

  class_section_subject_teacher_subject_id: string;
  class_section_subject_teacher_subject_name_cache: string;
  class_section_subject_teacher_subject_code_cache: string;
  class_section_subject_teacher_subject_slug_cache: string;

  class_section_subject_teacher_status: string;
  class_section_subject_teacher_created_at: string;
  class_section_subject_teacher_updated_at: string;
};

type ApiCSSTListResponse = {
  success: boolean;
  message: string;
  data: ApiCSSTItem[];
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

/* =====================
   View model untuk UI
   ===================== */

type TeacherSubject = {
  id: string; // CSST id
  classSubjectId: string;
  schoolTeacherId: string;

  // kelas
  classSectionName: string;
  classSectionCode: string;

  // guru
  teacherName: string;
  teacherTitlePrefix: string;
  teacherTitleSuffix: string;
  teacherCode: string;

  // mapel
  subjectId: string;
  subjectName: string;
  subjectCode: string;

  deliveryMode: DeliveryMode;
  status: string;
  createdAt: string;
  updatedAt: string;
};

/* =====================
   Helper format tanggal
   ===================== */

function formatDateTime(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("id-ID", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =====================
   Fetch dari API (teacher=me & mode=compact)
   ===================== */

async function fetchTeacherSubjectsFromApi(): Promise<TeacherSubject[]> {
  const res = await axios.get<ApiCSSTListResponse>(
    "/u/class-section-subject-teachers/list",
    {
      params: {
        teacher: "me",
        mode: "compact",
      },
    }
  );

  const items = res.data?.data ?? [];

  const mapped: TeacherSubject[] = items.map((it) => {
    const t = it.class_section_subject_teacher_school_teacher_cache || {};

    const teacherName = t.name ?? "";
    const titlePrefix = t.title_prefix ?? "";
    const titleSuffix = t.title_suffix ?? "";

    return {
      id: it.class_section_subject_teacher_id,
      classSubjectId: it.class_section_subject_teacher_class_subject_id,
      schoolTeacherId: it.class_section_subject_teacher_school_teacher_id,

      classSectionName:
        it.class_section_subject_teacher_class_section_name_cache,
      classSectionCode:
        it.class_section_subject_teacher_class_section_code_cache,

      teacherName,
      teacherTitlePrefix: titlePrefix,
      teacherTitleSuffix: titleSuffix,
      teacherCode: t.teacher_code ?? "",

      subjectId: it.class_section_subject_teacher_subject_id,
      subjectName: it.class_section_subject_teacher_subject_name_cache,
      subjectCode: it.class_section_subject_teacher_subject_code_cache,

      deliveryMode: it.class_section_subject_teacher_delivery_mode,
      status: it.class_section_subject_teacher_status,
      createdAt: it.class_section_subject_teacher_created_at,
      updatedAt: it.class_section_subject_teacher_updated_at,
    };
  });

  return mapped;
}

function useTeacherSubjects() {
  return useQuery({
    queryKey: ["teacher-subjects"],
    queryFn: fetchTeacherSubjectsFromApi,
    staleTime: 60_000,
  });
}

/* =====================
   Main Component
   ===================== */

type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function TeacherCSST({ showBack = false, backTo }: Props) {
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Mata Pelajaran",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Guru Mata Pelajaran" },
      ],
      showBack,
    });
  }, [setHeader, showBack]);

  const {
    data: subjects = [],
    isLoading,
    isError,
    error,
  } = useTeacherSubjects();

  const [viewMode, setViewMode] = useState<"detailed" | "simple">("detailed");
  const [search, setSearch] = useState("");
  const [sortBy] = useState<"name" | "status">("name");
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    let list = subjects;

    const q = deferredSearch.toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.subjectName.toLowerCase().includes(q) ||
          s.classSectionName.toLowerCase().includes(q)
      );
    }

    if (sortBy === "name") {
      list = [...list].sort((a, b) =>
        a.subjectName.localeCompare(b.subjectName)
      );
    } else if (sortBy === "status") {
      list = [...list].sort((a, b) => a.status.localeCompare(b.status));
    }

    return list;
  }, [subjects, deferredSearch, sortBy]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground gap-2">
        <Clock size={16} className="animate-spin" />
        Memuat daftar mata pelajaran…
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">
            Gagal memuat mata pelajaran.
          </p>
          <p className="text-sm text-muted-foreground break-all">
            {(error as any)?.message ??
              "Periksa koneksi atau coba beberapa saat lagi."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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
            <h1 className="md:text-xl text-lg font-semibold mb-4">
              Mata Pelajaran
            </h1>
          </div>
        </div>

        <CMenuSearch
          value={search}
          onChange={setSearch}
          placeholder="Cari nama mapel / rombel..."
          className="mb-4"
        />

        {/* Toggle View Mode */}
        <div className="flex justify-end mt-4 mb-4">
          <div className="flex items-center gap-2 border rounded-xl p-1 bg-background">
            <Button
              variant={viewMode === "detailed" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("detailed")}
              className="flex items-center gap-2"
            >
              <LayoutGrid size={16} /> Detail
            </Button>
            <Button
              variant={viewMode === "simple" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("simple")}
              className="flex items-center gap-2"
            >
              <LayoutList size={16} /> Simple
            </Button>
          </div>
        </div>

        {/* Cards */}
        <div
          className={`grid gap-6 ${viewMode === "simple"
              ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
              : "grid-cols-1 lg:grid-cols-2"
            }`}
        >
          {filtered.map((s) => {
            const teacherLabel = [
              s.teacherTitlePrefix,
              s.teacherName,
              s.teacherTitleSuffix,
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <Card
                key={s.id}
                className={`border rounded-xl bg-card ${cardHover}`}
              >
                <CardHeader className="flex justify-between items-start pb-3 gap-4">
                  <div>
                    <CardTitle className="text-lg font-bold">
                      {s.subjectName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {s.classSectionName}
                    </p>
                  </div>

                  {/* Pojok kanan atas diisi badge + tanggal dibuat */}
                  <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className="px-2 py-0.5 flex items-center gap-1"
                      >
                        <MapPin size={12} />
                        {s.classSectionCode}
                      </Badge>
                      <Badge variant="outline" className="px-2 py-0.5">
                        {s.subjectCode}
                      </Badge>
                    </div>
                    <span>Dibuat: {formatDateTime(s.createdAt)}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 text-sm pt-0">
                  {/* Guru */}
                  <div className="flex items-center gap-2">
                    <IdCard size={14} className="text-primary" />
                    <span className="font-medium truncate">
                      {teacherLabel || "Guru tidak diketahui"}
                    </span>
                  </div>

                  {/* Mode + kode guru/mapel */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge
                      variant="outline"
                      className="capitalize px-2 py-0.5 text-xs"
                    >
                      {s.deliveryMode}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Hash size={13} />
                      <span className="truncate">
                        Kode guru: {s.teacherCode || "-"}
                        {"  •  "}
                        Kode mapel: {s.subjectCode || "-"}
                      </span>
                    </span>
                  </div>

                  {/* Status & waktu update */}
                  <div className="flex items-center justify-between mt-2">
                    <Badge
                      variant="outline"
                      className="text-xs capitalize px-2 py-0.5"
                    >
                      Status: {s.status}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={12} />
                      <span>Diperbarui: {formatDateTime(s.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Button */}
                  <div className="pt-3 flex justify-end">
                    <Link
                      to={`${s.id}`}
                      state={{
                        clsOverride: {
                          id: s.id,
                          name: s.subjectName,
                          room: s.classSectionCode,
                          academicTerm: "",
                          cohortYear: new Date().getFullYear(),
                          studentsCount: 0,
                          todayAttendance: {
                            hadir: 0,
                            online: 0,
                            sakit: 0,
                            izin: 0,
                            alpa: 0,
                          },
                          materialsCount: 0,
                          assignmentsCount: 0,
                        },
                      }}
                    >
                      <Button size="sm" className="flex items-center gap-2">
                        Buka Mapel <ChevronRight size={16} />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="p-10 text-center rounded-2xl border bg-background shadow-md">
            <div className="flex justify-center mb-4">
              <Search size={32} className="text-primary" />
            </div>
            <p className="font-semibold text-foreground mb-2">
              Tidak ada mata pelajaran ditemukan
            </p>
            <p className="text-sm text-muted-foreground">
              Coba ubah kata kunci atau filter untuk melihat hasil lainnya.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}