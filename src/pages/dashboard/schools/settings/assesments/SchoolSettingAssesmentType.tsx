// src/pages/dashboard/school/academic/SchoolSettingAssesmentType.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios, { getActiveschoolId } from "@/lib/axios";

import { Info, Loader2, ClipboardList, Percent } from "lucide-react";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/* Layout header hook */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* DataTable */
import {
  cardHover,
  CDataTable as DataTable,
  type ColumnDef,
  type ViewMode,
} from "@/components/costum/table/CDataTable";

/* Current user (ambil school_id dari token) */
import { useCurrentUser } from "@/hooks/useCurrentUser";
import CBadgeStatus from "@/components/costum/common/badges/CBadgeStatus";
import CRowActions from "@/components/costum/table/CRowAction";
import { cn } from "@/lib/utils";

/* ================= Types dari API ================= */

type AssessmentTypeCode = "training" | "daily_exam" | "exam" | string;

type ApiAssessmentType = {
  assessment_type_id: string;
  assessment_type_school_id: string;
  assessment_type_key: string;
  assessment_type_name: string;
  assessment_type_weight_percent: number;
  assessment_type: AssessmentTypeCode;
  assessment_type_is_active: boolean;
  assessment_type_is_graded: boolean;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data: ApiAssessmentType[];
  pagination?: {
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

type AssessmentTypeRow = {
  id: string;
  school_id: string;
  key: string;
  name: string;
  weight_percent: number;
  type_code: AssessmentTypeCode;
  type_label: string;
  is_active: boolean;
  is_graded: boolean;
};

/* ================= Helpers ================= */

function mapTypeLabel(code: AssessmentTypeCode): string {
  switch (code) {
    case "training":
      return "Latihan";
    case "daily_exam":
      return "Ulangan Harian";
    case "exam":
      return "Ujian";
    default:
      return code;
  }
}

function mapAssessmentType(x: ApiAssessmentType): AssessmentTypeRow {
  return {
    id: x.assessment_type_id,
    school_id: x.assessment_type_school_id,
    key: x.assessment_type_key,
    name: x.assessment_type_name,
    weight_percent: x.assessment_type_weight_percent,
    type_code: x.assessment_type,
    type_label: mapTypeLabel(x.assessment_type),
    is_active: x.assessment_type_is_active,
    is_graded: x.assessment_type_is_graded,
  };
}

async function fetchAssessmentTypes(
  schoolId: string | null
): Promise<AssessmentTypeRow[]> {
  if (!schoolId) return [];
  const res = await axios.get<ApiResponse>("/api/u/assessment-types/list", {
    params: {
      mode: "compact",
      page: 1,
      per_page: 100,
    },
  });
  return (res.data?.data ?? []).map(mapAssessmentType);
}

/* ================= Page ================= */


const SchoolSettingAssesmentType: React.FC = () => {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  const q = (sp.get("q") ?? "").trim();
  const [page, setPage] = useState(() => Number(sp.get("page") ?? 1) || 1);
  const [perPage, setPerPage] = useState(
    () => Number(sp.get("per") ?? 20) || 20
  );

  // Ambil school_id dari currentUser atau cookie
  const currentUserQ = useCurrentUser();
  const activeMembership = currentUserQ.data?.membership ?? null;
  const schoolIdFromMembership = activeMembership?.school_id ?? null;
  const schoolId = schoolIdFromMembership || getActiveschoolId() || null;
  const hasSchool = Boolean(schoolId);

  // sync page/perPage ke URL
  useEffect(() => {
    const copy = new URLSearchParams(sp);
    copy.set("page", String(page));
    copy.set("per", String(perPage));
    setSp(copy, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage]);

  /* Header */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Tipe Penilaian",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Pengaturan Akademik" },
        { label: "Tipe Penilaian" },
      ],
      actions: null,
    });
  }, [setHeader]);

  /* Query */
  const typesQ = useQuery({
    queryKey: ["assessment-types-compact", schoolId],
    enabled: hasSchool,
    queryFn: () => fetchAssessmentTypes(schoolId),
    staleTime: 60_000,
  });

  const allRows = typesQ.data ?? [];

  /* Filter + search FE */
  const filtered = useMemo(() => {
    if (!q) return allRows;
    const qq = q.toLowerCase();
    return allRows.filter((row) => {
      return (
        row.name.toLowerCase().includes(qq) ||
        row.key.toLowerCase().includes(qq) ||
        row.type_label.toLowerCase().includes(qq) ||
        row.type_code.toLowerCase().includes(qq)
      );
    });
  }, [allRows, q]);

  const totalLocal = filtered.length;
  const pagedRows = filtered.slice((page - 1) * perPage, page * perPage);

  /* Stats */
  const totalActive = filtered.filter((r) => r.is_active).length;
  const totalTraining = filtered.filter(
    (r) => r.type_code === "training"
  ).length;
  const totalDaily = filtered.filter(
    (r) => r.type_code === "daily_exam"
  ).length;
  const totalExam = filtered.filter((r) => r.type_code === "exam").length;
  const totalWeightActive = filtered
    .filter((r) => r.is_active)
    .reduce((acc, r) => acc + (r.weight_percent || 0), 0);

  const statsSlot = typesQ.isLoading ? (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="animate-spin" size={16} /> Memuat tipe penilaian…
    </div>
  ) : typesQ.isError ? (
    <div className="rounded-xl border p-4 text-sm space-y-2">
      <div className="flex items-center gap-2">
        <Info size={16} /> Gagal memuat tipe penilaian.
      </div>
      <Button size="sm" onClick={() => typesQ.refetch()}>
        Coba lagi
      </Button>
    </div>
  ) : (
    <div className="grid gap-3 md:grid-cols-4 text-sm">
      <div className="rounded-xl border p-3">
        <div className="text-xs text-muted-foreground">Jumlah Tipe</div>
        <div className="font-medium">{totalLocal}</div>
      </div>
      <div className="rounded-xl border p-3">
        <div className="text-xs text-muted-foreground">Aktif</div>
        <div className="font-medium">{totalActive}</div>
      </div>
      <div className="rounded-xl border p-3">
        <div className="text-xs text-muted-foreground">
          Distribusi (Lat / UH / Ujian)
        </div>
        <div className="font-medium">
          {totalTraining} / {totalDaily} / {totalExam}
        </div>
      </div>
      <div className="rounded-xl border p-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Percent className="h-3 w-3" /> Total Bobot Aktif
        </div>
        <div
          className={cn(
            "font-medium",
            totalWeightActive !== 100 && "text-amber-600"
          )}
        >
          {totalWeightActive}%
        </div>
        {totalWeightActive !== 100 && (
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            Sebaiknya total bobot aktif = 100%.
          </div>
        )}
      </div>
    </div>
  );

  /* Columns */
  type Row = AssessmentTypeRow;

  const columns: ColumnDef<Row>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Nama Tipe",
        minW: "260px",
        align: "left",
        className: "text-left",
        cell: (r) => (
          <div className="space-y-0.5">
            <div className="font-medium truncate">{r.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              Key: <span className="font-mono">{r.key}</span>
            </div>
          </div>
        ),
      },
      {
        id: "type",
        header: "Kategori",
        minW: "160px",
        align: "left",
        cell: (r) => (
          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
            <ClipboardList className="mr-1 h-3 w-3" />
            {r.type_label}
          </span>
        ),
      },
      {
        id: "weight",
        header: "Bobot (%)",
        minW: "100px",
        align: "center",
        cell: (r) => (
          <span className="tabular-nums font-medium">{r.weight_percent}%</span>
        ),
      },
      {
        id: "graded",
        header: "Dinilai?",
        minW: "110px",
        align: "center",
        cell: (r) => (
          <span className="text-xs">
            {r.is_graded ? "Ya, menghasilkan nilai" : "Tidak (latihan saja)"}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        minW: "110px",
        align: "center",
        cell: (r) => (
          <CBadgeStatus status={r.is_active ? "active" : "inactive"} />
        ),
      },
    ],
    []
  );

  /* Handlers */
  const handleQueryChange = (val: string) => {
    const copy = new URLSearchParams(sp);
    if (val) copy.set("q", val);
    else copy.delete("q");
    copy.set("page", "1");
    setSp(copy, { replace: true });
    setPage(1);
  };

  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-4 lg:gap-6">
          {/* Header sederhana */}
          <div className="md:flex hidden gap-3 items-center">
            <h1 className="font-semibold text-lg md:text-xl">Tipe Penilaian</h1>
          </div>

          {/* DataTable */}
          <DataTable<Row>
            onAdd={() => navigate("new")}
            addLabel="Tambah Tipe"
            controlsPlacement="above"
            defaultQuery={q}
            onQueryChange={handleQueryChange}
            filterer={() => true}
            searchByKeys={["name", "key", "type_label", "type_code"]}
            searchPlaceholder="Cari nama/key/kategori…"
            statsSlot={statsSlot}
            loading={typesQ.isLoading}
            error={
              typesQ.isError ? (typesQ.error as any)?.message ?? "Error" : null
            }
            columns={columns}
            rows={pagedRows}
            getRowId={(r) => r.id}
            defaultAlign="left"
            stickyHeader
            zebra
            viewModes={["table", "card"] as ViewMode[]}
            defaultView="table"
            storageKey={`assessment-types:${schoolId ?? "unknown"}`}
            onRowClick={(r) => navigate(`${r.id}`)}
            pageSize={perPage}
            pageSizeOptions={[10, 20, 50, 100, 200]}
            /* Actions */
            renderActions={(row, view) => (
              <CRowActions
                row={row}
                mode="inline"
                size="sm"
                onView={() => navigate(`${row.id}`)}
                onEdit={() => navigate(`edit/${row.id}`)}
                onDelete={() => console.log("delete", row.id)}
                forceMenu={view === "table"}
              />
            )}
            /* Card view */
            renderCard={(r) => (
              <div
                className={cn(
                  "rounded-xl border p-4 space-y-3 bg-card",
                  cardHover
                )}
                onClick={() => navigate(`${r.id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{r.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      Key: <span className="font-mono">{r.key}</span>
                    </div>
                    <div className="mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
                      <ClipboardList className="mr-1 h-3 w-3" />
                      {r.type_label}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-muted-foreground">
                      Bobot
                    </div>
                    <div className="text-base font-semibold">
                      {r.weight_percent}%
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {r.is_graded ? "Menghasilkan nilai" : "Latihan saja"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span className="font-medium">Status:</span>
                    <CBadgeStatus
                      status={r.is_active ? "active" : "inactive"}
                    />
                  </div>

                  <div
                    className="flex justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <CRowActions
                      row={r}
                      mode="inline"
                      size="sm"
                      onView={() => navigate(`${r.id}`)}
                      onEdit={() => navigate(`edit/${r.id}`)}
                      onDelete={() => console.log("delete", r.id)}
                      forceMenu={false}
                    />
                  </div>
                </div>
              </div>
            )}
          />

          {/* Footer pagination */}
          <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <div className="order-1 sm:order-2 flex items-center gap-2">
              <span className="text-xs">Tampil per halaman:</span>
              <Select
                value={String(perPage)}
                onValueChange={(v) => {
                  setPerPage(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[90px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100, 200].map((opt) => (
                    <SelectItem key={opt} value={String(opt)}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SchoolSettingAssesmentType;
