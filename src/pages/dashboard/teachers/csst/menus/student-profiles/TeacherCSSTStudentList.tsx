// src/pages/teacher/classes/TeacherCSSTStudentList.tsx
import React, { useMemo, useState, useDeferredValue, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import axios from "@/lib/axios";

/* ---------- shadcn/ui ---------- */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ---------- Icons ---------- */
import { ArrowLeft } from "lucide-react";

/* ---------- DataTable ---------- */
import {
  CDataTable,
  type ColumnDef,
} from "@/components/costum/table/CDataTable";

import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* =========================================================
   TYPES — API terbaru (compact) student_csst_*
========================================================= */
type Gender = "male" | "female" | string;

type ApiStudentCSSTItem = {
  student_csst_id: string;
  student_csst_student_id: string;
  student_csst_csst_id: string;
  student_csst_is_active: boolean;

  student_csst_user_profile_name_cache?: string | null;
  student_csst_user_profile_avatar_url_cache?: string | null; // ✅ ada, tapi kita TIDAK render
  student_csst_school_student_code_cache?: string | null;
  student_csst_user_profile_gender_cache?: Gender | null;

  student_csst_created_at: string; // ✅ jadi "Bergabung"
  student_csst_updated_at: string;
};

type ApiStudentCSSTListResponse = {
  success: boolean;
  message: string;
  data: ApiStudentCSSTItem[];
  pagination?: any;
};

type AnyRec = Record<string, any>;

/* =========================================================
   UI MODEL — hanya yang dipakai di tabel
========================================================= */
type StudentRow = {
  id: string; // student_id (buat route detail)
  name: string;
  code?: string | null;
  gender?: string;
  joinedAt?: string; // tampil dari created_at
  isActive?: boolean;
};

/* =========================================================
   HELPERS
========================================================= */
function genderToLP(g?: Gender | null) {
  if (!g) return "";
  const v = String(g).toLowerCase();
  if (v === "male" || v === "laki-laki" || v === "l") return "L";
  if (v === "female" || v === "perempuan" || v === "p") return "P";
  return v;
}

function fmtDateTime(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString();
}

function extractErrorMessage(err: unknown): string {
  const ax = err as AxiosError<any>;
  const msgFromResp =
    ax?.response?.data?.message ||
    ax?.response?.data?.error ||
    ax?.response?.statusText;
  if (msgFromResp) return String(msgFromResp);
  if (ax?.message) return ax.message;
  return "Terjadi kesalahan saat memuat data.";
}

/* =========================================================
   API
========================================================= */
function useStudentsByCSST(csstId?: string | null) {
  return useQuery<ApiStudentCSSTItem[], AxiosError>({
    queryKey: ["teacher-csst-students-compact", csstId ?? null],
    enabled: !!csstId,
    queryFn: async () => {
      const res = await axios.get<ApiStudentCSSTListResponse>(
        "/api/u/student-class-section-subject-teachers/list",
        { params: { csst_id: csstId, mode: "compact" } }
      );
      return res.data?.data ?? [];
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

/* =========================================================
   PAGE
========================================================= */
const TeacherCSSTStudentList: React.FC = () => {
  const navigate = useNavigate();

  // ✅ sesuai route: <Route path=":csstId">
  const { csstId } = useParams<{ csstId: string }>();

  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Daftar Murid",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Wali kelas" },
        { label: "Detail Kelas", href: `wali-kelas/${csstId}` },
        { label: "Daftar Murid" },
      ],
      showBack: true,
    });
  }, [setHeader, csstId]);

  const sectionKey = csstId ?? null;
  const studentsQ = useStudentsByCSST(sectionKey);

  const isLoading = studentsQ.isLoading;
  const isError = studentsQ.isError;
  const errorMsg = isError ? extractErrorMessage(studentsQ.error) : null;

  // ✅ mapping “seadanya” dari API compact
  const rawRows: StudentRow[] = useMemo(() => {
    const items = studentsQ.data ?? [];
    return items.map((it) => ({
      id: it.student_csst_student_id,
      name: it.student_csst_user_profile_name_cache ?? "-",
      code: it.student_csst_school_student_code_cache ?? null,
      gender: genderToLP(it.student_csst_user_profile_gender_cache),
      joinedAt: it.student_csst_created_at, // ✅ bergabung
      isActive: !!it.student_csst_is_active,
    }));
  }, [studentsQ.data]);

  // search internal DataTable kamu tetap jalan, tapi kalau kamu mau hook q beneran,
  // tinggal sambung dari CDataTable kalau ada event-nya.
  const [q] = useState("");
  const deferredQ = useDeferredValue(q);

  const rows = useMemo(() => {
    const k = deferredQ.trim().toLowerCase();
    if (!k) return rawRows;

    return rawRows.filter((r) => {
      const hay = [r.name, r.code ?? "", r.gender ?? "", r.id]
        .join(" ")
        .toLowerCase();
      return hay.includes(k);
    });
  }, [rawRows, deferredQ]);

  const toStudentDetailPath = (studentId: string) =>
    `${encodeURIComponent(studentId)}`;

  const columns: ColumnDef<StudentRow>[] = [
    {
      id: "name",
      header: "Nama",
      minW: "260px",
      cell: (s) => (
        <div className="space-y-0.5">
          <div className="font-medium">{s.name}</div>
          {s.code ? (
            <div className="text-xs text-muted-foreground font-mono">
              {s.code}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      id: "gender",
      header: "L/P",
      cell: (s) =>
        s.gender ? (
          <Badge variant="outline" className="uppercase">
            {s.gender}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "joined",
      header: "Bergabung",
      minW: "220px",
      cell: (s) => (
        <span className="text-sm text-muted-foreground">
          {fmtDateTime(s.joinedAt)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (s) =>
        s.isActive ? (
          <Badge variant="secondary">Aktif</Badge>
        ) : (
          <Badge variant="outline">Nonaktif</Badge>
        ),
    },
  ];

  const statsSlot = (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <div>
        Total siswa: <span className="font-medium">{rawRows.length}</span>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6">
          <div className="md:flex hidden items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-lg font-semibold md:flex-xl">Daftar Murid</h1>
          </div>

          <CDataTable
            controlsPlacement="above"
            searchPlaceholder="Cari nama / kode / id…"
            statsSlot={statsSlot}
            loading={isLoading && !!sectionKey}
            error={
              !sectionKey
                ? "CSST ID tidak ditemukan di URL."
                : isError
                ? errorMsg || "Gagal memuat data murid."
                : null
            }
            columns={columns}
            rows={rows}
            getRowId={(s: AnyRec) => s.id ?? s.name}
            pageSize={20}
            onRowClick={(row) => navigate(toStudentDetailPath(row.id))}
          />
        </div>
      </main>
    </div>
  );
};

export default TeacherCSSTStudentList;
