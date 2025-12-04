// src/pages/sekolahislamku/teachers/csst/TeacherCSST.tsx
import { useState, useMemo, useDeferredValue, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  Clock,
  Users,
  GraduationCap,
  MapPin,
  Search,
  ChevronRight,
  LayoutGrid,
  LayoutList,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* axios + token helper */
import axios, { getAccessToken } from "@/lib/axios";

/* Tambahan untuk breadcrumb sistem dashboard */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import CMenuSearch from "@/components/costum/common/CMenuSearch";

/* =====================
   Types API CSST
===================== */

type DeliveryMode = "offline" | "online" | "hybrid" | string;

type ApiTeacherSnapshot = {
  id?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  title_prefix?: string | null;
  title_suffix?: string | null;
  whatsapp_url?: string | null;
};

type ApiBookSnapshot = {
  id?: string | null;
  slug?: string | null;
  title?: string | null;
  author?: string | null;
  image_url?: string | null;
};

type ApiSubjectSnapshot = {
  id?: string | null;
  url?: string | null;
  code?: string | null;
  name?: string | null;
  slug?: string | null;
};

type ApiClassSubjectBookSnapshot = {
  book?: ApiBookSnapshot | null;
  subject?: ApiSubjectSnapshot | null;
};

type ApiCSSTItem = {
  class_section_subject_teacher_id: string;
  class_section_subject_teacher_school_id: string;
  class_section_subject_teacher_slug: string;
  class_section_subject_teacher_total_attendance: number;
  class_section_subject_teacher_enrolled_count: number;
  class_section_subject_teacher_delivery_mode: DeliveryMode;
  class_section_subject_teacher_class_section_id: string;
  class_section_subject_teacher_class_section_slug_snapshot: string;
  class_section_subject_teacher_class_section_name_snapshot: string;
  class_section_subject_teacher_class_section_code_snapshot: string;
  class_section_subject_teacher_school_teacher_id: string;
  class_section_subject_teacher_school_teacher_snapshot?: ApiTeacherSnapshot | null;
  class_section_subject_teacher_school_teacher_name_snapshot?: string | null;
  class_section_subject_teacher_class_subject_book_id: string | null;
  class_section_subject_teacher_class_subject_book_snapshot?: ApiClassSubjectBookSnapshot | null;
  class_section_subject_teacher_book_title_snapshot?: string | null;
  class_section_subject_teacher_book_author_snapshot?: string | null;
  class_section_subject_teacher_book_slug_snapshot?: string | null;
  class_section_subject_teacher_book_image_url_snapshot?: string | null;
  class_section_subject_teacher_subject_name_snapshot?: string | null;
  class_section_subject_teacher_subject_code_snapshot?: string | null;
  class_section_subject_teacher_subject_slug_snapshot?: string | null;
  class_section_subject_teacher_is_active: boolean;
  class_section_subject_teacher_created_at: string;
  class_section_subject_teacher_updated_at: string;
  class_section_subject_teacher_deleted_at?: string | null;
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
  id: string; // id CSST
  classSectionId: string; // ⬅️ baru: id rombel untuk route siswa
  name: string;
  sectionName: string;
  room: string;
  day: string;
  time: string;
  level: string;
  studentsCount: number;
  academicTerm: string;
  nextTopic: string;
};

/* =====================
   JWT helper: ambil teacher_id
===================== */

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

/* =====================
   Fetch dari API
===================== */

async function fetchTeacherSubjectsFromApi(): Promise<TeacherSubject[]> {
  const teacherId = getTeacherIdFromToken();
  if (!teacherId) {
    throw new Error("Tidak dapat membaca teacher_id dari token.");
  }

  const res = await axios.get<ApiCSSTListResponse>(
    "/u/class-section-subject-teachers/list",
    {
      params: {
        teacher_id: teacherId,
      },
    }
  );

  const items = res.data?.data ?? [];

  // Map ApiCSSTItem -> TeacherSubject (view model)
  const mapped: TeacherSubject[] = items.map((it) => {
    const csBook = it.class_section_subject_teacher_class_subject_book_snapshot;
    const subj = csBook?.subject;

    const subjectName =
      it.class_section_subject_teacher_subject_name_snapshot ||
      subj?.name ||
      "Mata pelajaran tanpa nama";

    const sectionName =
      it.class_section_subject_teacher_class_section_name_snapshot ||
      "Rombel tanpa nama";

    return {
      id: it.class_section_subject_teacher_id,
      classSectionId: it.class_section_subject_teacher_class_section_id, // ⬅️ ini dikirim ke route siswa
      name: subjectName,
      sectionName,
      room:
        it.class_section_subject_teacher_class_section_code_snapshot ??
        sectionName,
      day: "-",
      time: "-",
      level: "-",
      studentsCount: it.class_section_subject_teacher_enrolled_count ?? 0,
      academicTerm: "—",
      nextTopic: "-",
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

  /* Atur breadcrumb dan title seperti SchoolAcademic */
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
  const [day] = useState("all");
  const [level] = useState("all");
  const [term] = useState("all");
  const [sortBy] = useState<"name" | "students">("name");
  const deferredSearch = useDeferredValue(search);

  // Karena day/level/term belum ada data real → tetap pakai opsi standar
  const filtered = useMemo(() => {
    let list = subjects;

    if (day !== "all") list = list.filter((s) => s.day === day);
    if (level !== "all") list = list.filter((s) => s.level === level);
    if (term !== "all") list = list.filter((s) => s.academicTerm === term);

    const q = deferredSearch.toLowerCase();
    if (q) list = list.filter((s) => s.name.toLowerCase().includes(q));

    if (sortBy === "name")
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "students")
      list = [...list].sort((a, b) => b.studentsCount - a.studentsCount);

    return list;
  }, [subjects, deferredSearch, day, level, term, sortBy]);

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
          placeholder="Cari nama mapel..."
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
          {filtered.map((s) => (
            <Card
              key={s.id}
              className="
              border 
              transition-all 
              duration-300 
              cursor-pointer 
              hover:bg-primary/5 
              hover:border-primary 
              hover:shadow-sm 
              hover:shadow-xl 
              hover:-translate-y-1"
            >
              <CardHeader className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-bold">{s.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{s.sectionName}</p>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin size={12} />
                  {s.room || "-"}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-2 text-sm">
                {viewMode === "detailed" && (
                  <>
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} className="text-primary" />
                      {s.day} • {s.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap size={14} className="text-primary" />
                      {s.academicTerm}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-primary" />
                      {s.studentsCount} siswa
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-primary" />
                      Materi berikutnya:{" "}
                      <span className="font-medium">{s.nextTopic}</span>
                    </div>
                  </>
                )}

                <div className="pt-3 flex justify-end">
                  <Link
                    to={`${s.id}`} //  sekarang yang dikirim class_section_id
                    state={{
                      clsOverride: {
                        id: s.id, // ini tetap CSST id buat header dll
                        name: s.name,
                        room: s.room,
                        academicTerm: s.academicTerm,
                        cohortYear: Number(
                          s.academicTerm.match(/^\d{4}/)?.[0] ??
                          new Date().getFullYear()
                        ),
                        studentsCount: s.studentsCount,
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
          ))}
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