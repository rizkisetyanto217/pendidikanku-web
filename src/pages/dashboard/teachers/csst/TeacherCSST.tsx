// src/pages/sekolahislamku/teachers/csst/TeacherCSST.tsx
import { useState, useMemo, useDeferredValue, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  Search,
  ChevronRight,
  LayoutGrid,
  LayoutList,
  AlertTriangle,
  IdCard,
  Hash,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import axios from "@/lib/axios";
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import CMenuSearch from "@/components/costum/common/CMenuSearch";
import { cardHover } from "@/components/costum/table/CDataTable";

/* =========================================================
   Types API (TERBARU – csst_* semua)
========================================================= */

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
  csst_id: string;
  csst_class_subject_id: string;
  csst_school_teacher_id: string;
  csst_delivery_mode: DeliveryMode;

  csst_class_section_slug_cache: string;
  csst_class_section_name_cache: string;
  csst_class_section_code_cache: string;

  csst_school_teacher_slug_cache?: string | null;
  csst_school_teacher_cache?: ApiTeacherCache | null;

  csst_subject_id: string;
  csst_subject_name_cache: string;
  csst_subject_code_cache: string;
  csst_subject_slug_cache: string;

  csst_status: string;
  csst_created_at: string;
  csst_updated_at: string;
};

type ApiCSSTListResponse = {
  success: boolean;
  message: string;
  data: ApiCSSTItem[];
  pagination: any;
};

/* =========================================================
   View Model UI
========================================================= */

type TeacherSubject = {
  id: string;

  classSubjectId: string;
  schoolTeacherId: string;

  classSectionName: string;
  classSectionCode: string;

  teacherName: string;
  teacherTitlePrefix: string;
  teacherTitleSuffix: string;
  teacherCode: string;
  teacherWhatsappUrl?: string;

  subjectId: string;
  subjectName: string;
  subjectCode: string;

  deliveryMode: DeliveryMode;
  status: string;
  createdAt: string;
  updatedAt: string;
};

/* =========================================================
   Helpers
========================================================= */

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

/* =========================================================
   Fetch API (teacher=me, mode=compact)
========================================================= */

async function fetchTeacherSubjectsFromApi(): Promise<TeacherSubject[]> {
  const res = await axios.get<ApiCSSTListResponse>(
    "/api/u/class-section-subject-teachers/list",
    {
      params: {
        teacher: "me",
        mode: "compact",
      },
    }
  );

  const items = res.data?.data ?? [];

  return items.map((it) => {
    const t = it.csst_school_teacher_cache ?? {};

    return {
      id: it.csst_id,
      classSubjectId: it.csst_class_subject_id,
      schoolTeacherId: it.csst_school_teacher_id,

      classSectionName: it.csst_class_section_name_cache,
      classSectionCode: it.csst_class_section_code_cache,

      teacherName: t.name ?? "",
      teacherTitlePrefix: t.title_prefix ?? "",
      teacherTitleSuffix: t.title_suffix ?? "",
      teacherCode: t.teacher_code ?? "-",
      teacherWhatsappUrl: t.whatsapp_url ?? undefined,

      subjectId: it.csst_subject_id,
      subjectName: it.csst_subject_name_cache,
      subjectCode: it.csst_subject_code_cache,

      deliveryMode: it.csst_delivery_mode,
      status: it.csst_status,
      createdAt: it.csst_created_at,
      updatedAt: it.csst_updated_at,
    };
  });
}

function useTeacherSubjects() {
  return useQuery({
    queryKey: ["teacher-csst-me-compact"],
    queryFn: fetchTeacherSubjectsFromApi,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

/* =========================================================
   Main Component
========================================================= */

type Props = { showBack?: boolean; backTo?: string };

export default function TeacherCSST({ showBack = false }: Props) {
  // const navigate = useNavigate();
  // const handleBack = () => (backTo ? navigate(backTo) : navigate(-1))

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

    return [...list].sort((a, b) => a.subjectName.localeCompare(b.subjectName));
  }, [subjects, deferredSearch]);

  /* ================= Loading & Error ================= */

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground gap-2">
        <Clock size={16} className="animate-spin" />
        Memuat daftar mata pelajaran…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="font-semibold">Gagal memuat mata pelajaran</p>
        <p className="text-sm text-muted-foreground break-all">
          {(error as any)?.message}
        </p>
      </div>
    );
  }

  /* ================= Render ================= */

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <CMenuSearch
          value={search}
          onChange={setSearch}
          placeholder="Cari nama mapel / rombel..."
          className="mb-4"
        />

        {/* Toggle view */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-2 border rounded-xl p-1">
            <Button
              variant={viewMode === "detailed" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("detailed")}
            >
              <LayoutGrid size={16} /> Detail
            </Button>
            <Button
              variant={viewMode === "simple" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("simple")}
            >
              <LayoutList size={16} /> Simple
            </Button>
          </div>
        </div>

        <div
          className={`grid gap-6 ${
            viewMode === "simple"
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
              <Card key={s.id} className={`rounded-xl ${cardHover}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold">
                    {s.subjectName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {s.classSectionName}
                  </p>
                </CardHeader>

                <CardContent className="space-y-2 text-sm pt-0">
                  <div className="flex items-center gap-2">
                    <IdCard size={14} />
                    <span className="font-medium truncate">
                      {teacherLabel || "Guru tidak diketahui"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{s.deliveryMode}</Badge>
                    <span className="flex items-center gap-1">
                      <Hash size={12} />
                      Kode guru: {s.teacherCode} • Mapel: {s.subjectCode}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <Badge variant="outline">Status: {s.status}</Badge>
                    <span className="flex items-center gap-1 text-xs">
                      <Clock size={12} />
                      {formatDateTime(s.updatedAt)}
                    </span>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <Link to={`${s.id}`}>
                      <Button size="sm">
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
          <div className="p-10 text-center rounded-xl border mt-6">
            <Search size={32} className="mx-auto mb-3 text-primary" />
            <p className="font-semibold">Tidak ada mata pelajaran</p>
            <p className="text-sm text-muted-foreground">
              Coba ubah kata kunci pencarian.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
