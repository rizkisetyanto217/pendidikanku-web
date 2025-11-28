// src/pages/sekolahislamku/pages/academic/SchoolSubjectDetail.table.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* ui */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

/* === header layout hook === */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* DataTable */
import {
  DataTable,
  type ColumnDef,
} from "@/components/costum/table/CDataTable";
import CBadgeStatus from "@/components/costum/common/CBadgeStatus";

/* ====== Types ====== */
type SubjectStatus = "active" | "inactive";

type ClassSubjectItem = {
  class_subject_id: string;
  class_subject_school_id: string;
  class_subject_parent_id: string;
  class_subject_subject_id: string;
  class_subject_slug: string;
  class_subject_order_index: number | null;
  class_subject_hours_per_week: number | null;
  class_subject_min_passing_score: number | null;
  class_subject_weight_on_report: number | null;
  class_subject_is_core: boolean | null;
  class_subject_subject_name_snapshot: string;
  class_subject_subject_code_snapshot: string | null;
  class_subject_subject_slug_snapshot: string | null;
  class_subject_subject_url_snapshot: string | null;
  class_subject_is_active: boolean;
  class_subject_created_at: string;
  class_subject_updated_at: string;
};

type SubjectsAPIItem = {
  subject_id: string;
  subject_school_id: string;
  subject_code: string | null;
  subject_name: string;
  subject_desc?: string | null;
  subject_slug?: string | null;
  subject_image_url?: string | null;
  subject_is_active: boolean;
  subject_created_at: string;
  subject_updated_at: string;
};
type SubjectsAPIResp = { data: SubjectsAPIItem[] };

type ClassSubjectsAPIResp = { data: ClassSubjectItem[] };

type ClassSubjectBookItem = {
  class_subject_book_id: string;
  class_subject_book_school_id: string;
  class_subject_book_class_subject_id: string;
  class_subject_book_book_id: string;
  class_subject_book_slug: string;
  class_subject_book_is_active: boolean;
  class_subject_book_book_title_snapshot: string;
  class_subject_book_book_author_snapshot: string | null;
  class_subject_book_book_slug_snapshot: string;
  class_subject_book_book_image_url_snapshot: string | null;
  class_subject_book_subject_id_snapshot: string;
  class_subject_book_subject_code_snapshot: string;
  class_subject_book_subject_name_snapshot: string;
  class_subject_book_subject_slug_snapshot: string;
  class_subject_book_created_at: string;
  class_subject_book_updated_at: string;
};
type CSBListResp = { data: ClassSubjectBookItem[] };

const API_PREFIX = "/public";

/* ===== DUMMY SWITCH ===== */
const USE_DUMMY = true;

/* ===== helpers ===== */
function useResolvedSchoolId() {
  const { schoolId, school_id } = useParams<{
    schoolId?: string;
    school_id?: string;
  }>();
  const { search } = useLocation();
  const sp = useMemo(() => new URLSearchParams(search), [search]);
  return schoolId || school_id || sp.get("school_id") || "";
}

function sumHours(arr: ClassSubjectItem[]) {
  const hrs = arr
    .map((x) => x.class_subject_hours_per_week ?? 0)
    .filter((n) => Number.isFinite(n));
  if (hrs.length === 0) return null;
  return hrs.reduce((a, b) => a + b, 0);
}

/* ===== page ===== */
const SchoolSubjectDetail: React.FC = () => {
  const navigate = useNavigate();
  const schoolId = useResolvedSchoolId();
  const { subjectId = "" } = useParams<{ subjectId: string }>();

  const [qAssign, setQAssign] = useState("");
  const [qBooks, setQBooks] = useState("");

  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Detail Mapel",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Akademik" },
        { label: "Mapel", href: "akademik/mata-pelajaran" },
        { label: "Detail" },
      ],
      showBack: true,
    });
  }, [setHeader]);

  /* =========================
     REAL QUERIES (dipakai bila USE_DUMMY=false)
  ========================== */
  const subjQ = useQuery({
    queryKey: ["subject-detail", schoolId, subjectId],
    enabled: !USE_DUMMY && !!schoolId && !!subjectId,
    queryFn: async () => {
      const resp = await axios.get<SubjectsAPIResp>(
        `${API_PREFIX}/${schoolId}/subjects/list`,
        { params: { limit: 1000, offset: 0 } }
      );
      const found = resp.data.data.find((s) => s.subject_id === subjectId);
      if (!found) throw new Error("Subject tidak ditemukan");
      return found;
    },
  });

  const assignQ = useQuery({
    queryKey: ["class-subjects-by-subject", schoolId, subjectId],
    enabled: !USE_DUMMY && !!schoolId && !!subjectId,
    queryFn: async () => {
      const resp = await axios.get<ClassSubjectsAPIResp>(
        `${API_PREFIX}/${schoolId}/class-subjects/list`,
        { params: { limit: 2000, offset: 0 } }
      );
      return resp.data.data.filter(
        (cs) => cs.class_subject_subject_id === subjectId
      );
    },
  });

  const booksQ = useQuery({
    queryKey: ["class-subject-books-by-subject", schoolId, subjectId],
    enabled: !USE_DUMMY && !!schoolId && !!subjectId,
    queryFn: async () => {
      const resp = await axios.get<CSBListResp>(
        `${API_PREFIX}/${schoolId}/class-subject-books/list`,
        { params: { per_page: 2000, page: 1 } }
      );
      return resp.data.data.filter(
        (b) => b.class_subject_book_subject_id_snapshot === subjectId
      );
    },
  });

  /* =========================
     DUMMY DATA (aktif bila USE_DUMMY=true)
  ========================== */
  const [dummyLoading, setDummyLoading] = useState(true);
  const [dummySubject, setDummySubject] = useState<SubjectsAPIItem | null>(
    null
  );
  const [dummyAssign, setDummyAssign] = useState<ClassSubjectItem[]>([]);
  const [dummyBooks, setDummyBooks] = useState<ClassSubjectBookItem[]>([]);

  useEffect(() => {
    if (!USE_DUMMY) return;
    setDummyLoading(true);
    const t = setTimeout(() => {
      const now = new Date().toISOString();
      const subj: SubjectsAPIItem = {
        subject_id: subjectId || "subj-dummy-1",
        subject_school_id: schoolId || "school-dummy-1",
        subject_code: "MAT-7",
        subject_name: "Matematika",
        subject_desc: "Konsep dasar matematika SMP kelas 7.",
        subject_slug: "matematika-smp-7",
        subject_image_url: null,
        subject_is_active: true,
        subject_created_at: now,
        subject_updated_at: now,
      };

      const mkAssign = (i: number): ClassSubjectItem => ({
        class_subject_id: `cs-${i}`,
        class_subject_school_id: subj.subject_school_id,
        class_subject_parent_id: `class-parent-${(i % 3) + 1}`,
        class_subject_subject_id: subj.subject_id,
        class_subject_slug: `7${String.fromCharCode(65 + (i % 4))}`,
        class_subject_order_index: i,
        class_subject_hours_per_week: [2, 3, 4][i % 3],
        class_subject_min_passing_score: [65, 70, 75][i % 3],
        class_subject_weight_on_report: [2, 3, 4][i % 3],
        class_subject_is_core: i % 2 === 0,
        class_subject_subject_name_snapshot: subj.subject_name,
        class_subject_subject_code_snapshot: subj.subject_code,
        class_subject_subject_slug_snapshot: subj.subject_slug ?? null,
        class_subject_subject_url_snapshot: null,
        class_subject_is_active: i % 5 !== 0,
        class_subject_created_at: now,
        class_subject_updated_at: now,
      });

      const assigns = Array.from({ length: 10 }, (_, i) => mkAssign(i));

      const mkBook = (i: number): ClassSubjectBookItem => ({
        class_subject_book_id: `book-${i}`,
        class_subject_book_school_id: subj.subject_school_id,
        class_subject_book_class_subject_id:
          assigns[i % assigns.length].class_subject_id,
        class_subject_book_book_id: `b-${i}`,
        class_subject_book_slug: `mat-${i}`,
        class_subject_book_is_active: i % 4 !== 0,
        class_subject_book_book_title_snapshot: `Buku Matematika Jilid ${i + 1
          }`,
        class_subject_book_book_author_snapshot:
          i % 3 === 0 ? "Tim Penulis" : "A. Sutanto",
        class_subject_book_book_slug_snapshot: `buku-matematika-jilid-${i + 1}`,
        class_subject_book_book_image_url_snapshot: null,
        class_subject_book_subject_id_snapshot: subj.subject_id,
        class_subject_book_subject_code_snapshot: subj.subject_code || "",
        class_subject_book_subject_name_snapshot: subj.subject_name,
        class_subject_book_subject_slug_snapshot: subj.subject_slug || "",
        class_subject_book_created_at: now,
        class_subject_book_updated_at: now,
      });

      const books = Array.from({ length: 6 }, (_, i) => mkBook(i));

      setDummySubject(subj);
      setDummyAssign(assigns);
      setDummyBooks(books);
      setDummyLoading(false);
    }, 600); // simulasi loading
    return () => clearTimeout(t);
  }, [schoolId, subjectId]);

  /* === unify loading/error/data === */
  const loading = USE_DUMMY
    ? dummyLoading
    : subjQ.isLoading || assignQ.isLoading || booksQ.isLoading;
  const errored = USE_DUMMY
    ? false
    : subjQ.isError || assignQ.isError || booksQ.isError;

  const subject = USE_DUMMY ? dummySubject : subjQ.data || null;
  const assignRows = USE_DUMMY ? dummyAssign : assignQ.data ?? [];
  const bookRows = USE_DUMMY ? dummyBooks : booksQ.data ?? [];

  /* === derive === */
  const totalHours = useMemo(
    () => (assignRows ? sumHours(assignRows) : null),
    [assignRows]
  );

  const subjectStatus: SubjectStatus | null = useMemo(() => {
    if (!subject) return null;
    return subject.subject_is_active ? "active" : "inactive";
  }, [subject]);

  /* === columns: assignments === */
  const assignCols: ColumnDef<ClassSubjectItem>[] = [
    {
      id: "class_subject_slug",
      header: "Slug Kelas",
      align: "left",
      minW: "180px",
      cell: (r) => r.class_subject_slug || "-",
    },
    {
      id: "class_subject_hours_per_week",
      header: "Jam/Minggu",
      minW: "110px",
      cell: (r) => r.class_subject_hours_per_week ?? "-",
    },
    {
      id: "class_subject_min_passing_score",
      header: "Passing",
      minW: "100px",
      cell: (r) => r.class_subject_min_passing_score ?? "-",
    },
    {
      id: "class_subject_weight_on_report",
      header: "Bobot Rapor",
      minW: "110px",
      cell: (r) => r.class_subject_weight_on_report ?? "-",
    },
    {
      id: "class_subject_is_core",
      header: "Core",
      minW: "90px",
      cell: (r) => (r.class_subject_is_core ? "Ya" : "Tidak"),
    },
    {
      id: "class_subject_is_active",
      header: "Aktif",
      minW: "90px",
      cell: (r) => (
        <CBadgeStatus
          status={r.class_subject_is_active ? "active" : "inactive"}
        />
      ),
    }

  ];

  /* === columns: books === */
  const bookCols: ColumnDef<ClassSubjectBookItem>[] = [
    {
      id: "class_subject_book_book_title_snapshot",
      header: "Judul",
      align: "left",
      minW: "220px",
      cell: (r) => r.class_subject_book_book_title_snapshot,
    },
    {
      id: "class_subject_book_book_author_snapshot",
      header: "Penulis",
      align: "left",
      minW: "160px",
      cell: (r) => r.class_subject_book_book_author_snapshot || "-",
    },
    {
      id: "class_subject_book_book_slug_snapshot",
      header: "Slug Buku",
      align: "left",
      minW: "200px",
      cell: (r) => r.class_subject_book_book_slug_snapshot,
    },
    {
      id: "class_subject_book_is_active",
      header: "Aktif",
      minW: "90px",
      cell: (r) => (
        <CBadgeStatus
          status={r.class_subject_book_is_active ? "active" : "inactive"}
        />
      ),
    }

  ];

  return (
    <div className="w-full">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="md:flex hidden items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                size="icon"
              >
                <ArrowLeft size={20} />
              </Button>
              <h1 className="font-semibold text-lg md:text-xl">Detail Mapel</h1>
            </div>
          </div>

          {/* Loading/Error */}
          {loading && (
            <Card>
              <CardContent className="p-6 text-center flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin" /> Memuat…
              </CardContent>
            </Card>
          )}
          {errored && (
            <Card>
              <CardContent className="p-6 text-center text-destructive flex items-center gap-2">
                <AlertCircle /> Gagal memuat data.
              </CardContent>
            </Card>
          )}

          {!loading && !errored && subject && (
            <>
              {/* Summary */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Nama</div>
                      <div className="text-xl font-semibold">
                        {subject.subject_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Kode: {subject.subject_code || "-"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CBadgeStatus
                        status={subjectStatus === "active" ? "active" : "inactive"}
                      />

                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">
                        Kelas Ditugaskan
                      </div>
                      <div className="font-medium">{assignRows.length}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">
                        Total Jam/Minggu
                      </div>
                      <div className="font-medium">{totalHours ?? "-"}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">
                        Buku Terkait
                      </div>
                      <div className="font-medium">{bookRows.length}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">Slug</div>
                      <div className="font-medium">
                        {subject.subject_slug || "-"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabel Penugasan */}
              <div className="space-y-2">
                <h2 className="text-base font-semibold">Penugasan Per Kelas</h2>
                <DataTable<ClassSubjectItem>
                  defaultQuery={qAssign}
                  onQueryChange={setQAssign}
                  searchByKeys={
                    [
                      "class_subject_slug",
                      "class_subject_subject_name_snapshot",
                      "class_subject_subject_code_snapshot",
                    ] as any
                  }
                  rows={assignRows}
                  columns={assignCols}
                  getRowId={(r) => r.class_subject_id}
                  pageSize={30}
                  pageSizeOptions={[20, 30, 50]}
                  stickyHeader
                  zebra
                  minTableWidth={980}
                  onRowClick={undefined}
                />
              </div>

              {/* Tabel Buku */}
              <div className="space-y-2">
                <h2 className="text-base font-semibold">Buku Terkait</h2>
                <DataTable<ClassSubjectBookItem>
                  defaultQuery={qBooks}
                  onQueryChange={setQBooks}
                  searchByKeys={
                    [
                      "class_subject_book_book_title_snapshot",
                      "class_subject_book_book_author_snapshot",
                      "class_subject_book_book_slug_snapshot",
                    ] as any
                  }
                  rows={bookRows}
                  columns={bookCols}
                  getRowId={(r) => r.class_subject_book_id}
                  pageSize={30}
                  pageSizeOptions={[20, 30, 50]}
                  stickyHeader
                  zebra
                  minTableWidth={960}
                />
              </div>
            </>

          )}
        </div>
      </main>
    </div>
  );
};

export default SchoolSubjectDetail;
