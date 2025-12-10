// src/pages/dashboard/school/academic/SchoolSettingAttendanceType.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios, { getActiveschoolId } from "@/lib/axios";

import {
  Info,
  Loader2,
  CalendarCheck,
  Clock,
  HelpCircle,
  BookOpenCheck,
  ClipboardList,
  ClipboardCheck,
} from "lucide-react";

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

type AttendanceWindowMode =
  | "same_day"
  | "before_and_same_day"
  | "flexible"
  | string;

type ApiAttendanceSessionType = {
  class_attendance_session_type_id: string;
  class_attendance_session_type_name: string;
  class_attendance_session_type_description?: string | null;
  class_attendance_session_type_color?: string | null;
  class_attendance_session_type_icon?: string | null;
  class_attendance_session_type_is_active: boolean;
  class_attendance_session_type_sort_order: number;
  class_attendance_session_type_allow_student_self_attendance: boolean;
  class_attendance_session_type_attendance_window_mode: AttendanceWindowMode;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data: ApiAttendanceSessionType[];
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

type SessionTypeRow = {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  is_active: boolean;
  sort_order: number;
  allow_self: boolean;
  window_mode: AttendanceWindowMode;
  window_mode_label: string;
};

/* ================= Helpers ================= */

function mapWindowModeLabel(mode: AttendanceWindowMode): string {
  switch (mode) {
    case "same_day":
      return "Hanya di hari yang sama";
    case "before_and_same_day":
      return "Sebelum & hari H";
    case "flexible":
      return "Fleksibel";
    default:
      return mode || "-";
  }
}

function mapAttendanceSessionType(x: ApiAttendanceSessionType): SessionTypeRow {
  return {
    id: x.class_attendance_session_type_id,
    name: x.class_attendance_session_type_name,
    description: x.class_attendance_session_type_description ?? null,
    color: x.class_attendance_session_type_color ?? null,
    icon: x.class_attendance_session_type_icon ?? null,
    is_active: x.class_attendance_session_type_is_active,
    sort_order: x.class_attendance_session_type_sort_order,
    allow_self: x.class_attendance_session_type_allow_student_self_attendance,
    window_mode: x.class_attendance_session_type_attendance_window_mode,
    window_mode_label: mapWindowModeLabel(
      x.class_attendance_session_type_attendance_window_mode
    ),
  };
}

async function fetchAttendanceSessionTypes(
  schoolId: string | null
): Promise<SessionTypeRow[]> {
  if (!schoolId) return [];
  const res = await axios.get<ApiResponse>(
    "/api/u/attendance-session-types/list",
    {
      params: {
        mode: "compact",
        page: 1,
        per_page: 100,
      },
    }
  );
  return (res.data?.data ?? []).map(mapAttendanceSessionType);
}

/* Icon renderer (string → lucide icon) */
function AttendanceIcon({ name }: { name?: string | null }) {
  if (!name) {
    return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
  }

  switch (name) {
    case "BookOpenCheck":
      return <BookOpenCheck className="h-4 w-4" />;
    case "ClipboardList":
      return <ClipboardList className="h-4 w-4" />;
    case "ClipboardCheck":
      return <ClipboardCheck className="h-4 w-4" />;
    default:
      return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
  }
}

/* ================= Page ================= */

const SchoolSettingAttendanceType: React.FC = () => {
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
      title: "Pengaturan Kehadiran",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Pengaturan Akademik" },
        { label: "Tipe Sesi Kehadiran" },
      ],
      actions: null,
    });
  }, [setHeader]);

  /* Query */
  const typesQ = useQuery({
    queryKey: ["attendance-session-types-compact", schoolId],
    enabled: hasSchool,
    queryFn: () => fetchAttendanceSessionTypes(schoolId),
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
        (row.description ?? "").toLowerCase().includes(qq) ||
        row.window_mode_label.toLowerCase().includes(qq)
      );
    });
  }, [allRows, q]);

  const totalLocal = filtered.length;
  const pagedRows = filtered.slice((page - 1) * perPage, page * perPage);

  /* Stats */
  const totalActive = filtered.filter((r) => r.is_active).length;
  const totalSelf = filtered.filter((r) => r.allow_self).length;

  const statsSlot = typesQ.isLoading ? (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="animate-spin" size={16} /> Memuat tipe sesi kehadiran…
    </div>
  ) : typesQ.isError ? (
    <div className="rounded-xl border p-4 text-sm space-y-2">
      <div className="flex items-center gap-2">
        <Info size={16} /> Gagal memuat tipe sesi kehadiran.
      </div>
      <Button size="sm" onClick={() => typesQ.refetch()}>
        Coba lagi
      </Button>
    </div>
  ) : (
    <div className="grid gap-3 md:grid-cols-3 text-sm">
      <div className="rounded-xl border p-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarCheck className="h-3 w-3" />
          Jumlah Tipe
        </div>
        <div className="font-medium">{totalLocal}</div>
      </div>
      <div className="rounded-xl border p-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarCheck className="h-3 w-3" />
          Aktif
        </div>
        <div className="font-medium">{totalActive}</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">
          Hanya tipe aktif yang akan digunakan di kelas.
        </div>
      </div>
      <div className="rounded-xl border p-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          Self Attendance &amp; Window
        </div>
        <div className="font-medium">{totalSelf} tipe izinkan self-check</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">
          Mode window diatur per tipe sesi (hari yang sama / lainnya).
        </div>
      </div>
    </div>
  );

  /* Columns */
  type Row = SessionTypeRow;

  const columns: ColumnDef<Row>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Nama Sesi",
        minW: "260px",
        align: "left",
        className: "text-left",
        cell: (r) => (
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md border text-foreground"
              style={
                r.color
                  ? {
                      backgroundColor: r.color,
                      color: "#fff",
                      borderColor: "transparent",
                    }
                  : undefined
              }
            >
              <AttendanceIcon name={r.icon} />
            </div>
            <div className="space-y-0.5">
              {/* ⬇️ HAPUS truncate, ganti whitespace-normal + break-words */}
              <div className="font-medium whitespace-normal break-words">
                {r.name}
              </div>
              {r.description && (
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {r.description}
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        id: "window",
        header: "Window Absensi",
        minW: "180px",
        align: "left",
        cell: (r) => (
          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
            <Clock className="mr-1 h-3 w-3" />
            {r.window_mode_label}
          </span>
        ),
      },
      {
        id: "self",
        header: "Self attendance",
        minW: "140px",
        align: "center",
        cell: (r) => (
          <span className="text-xs">
            {r.allow_self ? "Diizinkan" : "Tidak diizinkan"}
          </span>
        ),
      },
      {
        id: "sort_order",
        header: "Urutan",
        minW: "80px",
        align: "center",
        cell: (r) => (
          <span className="tabular-nums text-xs font-medium">
            {r.sort_order}
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
            <h1 className="font-semibold text-lg md:text-xl">
              Tipe Sesi Kehadiran
            </h1>
          </div>

          {/* DataTable */}
          <DataTable<Row>
            onAdd={() => navigate("new")}
            addLabel="Tambah Tipe Sesi"
            controlsPlacement="above"
            defaultQuery={q}
            onQueryChange={handleQueryChange}
            filterer={() => true}
            searchByKeys={["name", "description", "window_mode_label"]}
            searchPlaceholder="Cari nama/slug/deskripsi…"
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
            storageKey={`attendance-session-types:${schoolId ?? "unknown"}`}
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
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg border"
                      style={
                        r.color
                          ? {
                              backgroundColor: r.color,
                              color: "#fff",
                              borderColor: "transparent",
                            }
                          : undefined
                      }
                    >
                      <AttendanceIcon name={r.icon} />
                    </div>
                    <div>
                      <div className="font-semibold">{r.name}</div>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <div className="text-[11px] text-muted-foreground">
                      Urutan
                    </div>
                    <div className="font-mono text-sm">
                      {r.sort_order ?? "-"}
                    </div>
                    <div className="mt-1">
                      <CBadgeStatus
                        status={r.is_active ? "active" : "inactive"}
                      />
                    </div>
                  </div>
                </div>

                {r.description && (
                  <p className="text-xs text-muted-foreground">
                    {r.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5">
                      <Clock className="mr-1 h-3 w-3" />
                      {r.window_mode_label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Self attendance:{" "}
                      <span className="font-medium">
                        {r.allow_self ? "Diizinkan" : "Tidak"}
                      </span>
                    </span>
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

export default SchoolSettingAttendanceType;
