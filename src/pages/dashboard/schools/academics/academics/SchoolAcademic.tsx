import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Info,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  ArrowLeft,
} from "lucide-react";

/* ---------- shadcn/ui ---------- */
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

/* ---------- DataTable (baru) ---------- */
import {
  CDataTable,
  type ColumnDef,
  type Align,
} from "@/components/costum/table/CDataTable";

/* ---------- BreadCrum ---------- */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* 🔐 Context user dari simple-context (JWT) */
import { useCurrentUser } from "@/hooks/useCurrentUser";
import CBadgeStatus from "@/components/costum/common/CBadgeStatus";

/* ===================== Types ===================== */
type AcademicTerm = {
  id: string;
  school_id: string;
  academic_year: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  angkatan: number;
  slug?: string;
  created_at?: string;
  updated_at?: string;
};

type AcademicTermApi = {
  academic_term_id: string;
  academic_term_school_id: string;
  academic_term_academic_year: string;
  academic_term_name: string;
  academic_term_start_date: string;
  academic_term_end_date: string;
  academic_term_is_active: boolean;
  academic_term_angkatan: number;
  academic_term_slug?: string;
  academic_term_period?: string;
  academic_term_created_at?: string;
  academic_term_updated_at?: string;
};

type AdminTermsResponse = {
  success: boolean;
  message?: string;
  data: AcademicTermApi[];
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

/* ===================== Const & Helpers ===================== */
const USER_PREFIX = "/u";
const ADMIN_PREFIX = "/a";
const TERMS_QKEY = (schoolId?: string) =>
  ["academic-terms-merged", schoolId] as const;

const dateShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "-";

function extractErrorMessage(err: any) {
  const d = err?.response?.data;
  if (!d) return err?.message || "Request error";
  if (typeof d === "string") return d;
  if (d.message) return d.message;
  if (Array.isArray(d.errors)) {
    return d.errors
      .map((e: any) => [e.field, e.message].filter(Boolean).join(": "))
      .join("\n");
  }
  try {
    return JSON.stringify(d);
  } catch {
    return String(d);
  }
}

/* ===================== Mutations (CRUD) ===================== */
function useDeleteTerm(schoolId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(
        `${ADMIN_PREFIX}/${encodeURIComponent(schoolId!)}/academic-terms/${id}`
      );
      return data ?? { ok: true };
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: TERMS_QKEY(schoolId) });
      const previous = qc.getQueryData<AcademicTerm[]>(TERMS_QKEY(schoolId));
      if (previous) {
        qc.setQueryData<AcademicTerm[]>(
          TERMS_QKEY(schoolId),
          previous.filter((t) => t.id !== id)
        );
      }
      return { previous };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(TERMS_QKEY(schoolId), ctx.previous);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: TERMS_QKEY(schoolId) });
      await qc.refetchQueries({
        queryKey: TERMS_QKEY(schoolId),
        type: "active",
      });
    },
  });
}

/* ===================== Actions Menu ===================== */
function ActionsMenu({
  onView,
  onEdit,
  onDelete,
}: {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Aksi">
          <MoreHorizontal size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onView} className="gap-2">
          <Eye size={14} /> Lihat
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit} className="gap-2">
          <Pencil size={14} /> Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 size={14} /> Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ===================== Page (pakai DataTable) ===================== */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

const SchoolAcademic: React.FC<Props> = ({ showBack = false, backTo }) => {
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  // 🔐 Ambil konteks sekolah dari simple-context (JWT)
  const { data: currentUser } = useCurrentUser();
  const schoolId = currentUser?.membership?.school_id ?? "";
  const schoolSlug = currentUser?.membership?.school_slug ?? "";

  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Tahun Akademik",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Akademik" },
        { label: "Tahun Akademik" },
      ],
      showBack,
    });
  }, [setHeader, showBack]);

  const termsQ = useQuery<AcademicTerm[], Error>({
    queryKey: TERMS_QKEY(schoolId || undefined),
    enabled: !!schoolId, // cuma fetch kalau context sudah ada
    staleTime: 5 * 60 * 1000,
    retry: 1,
    placeholderData: [] as AcademicTerm[],
    queryFn: async () => {
      const res = await axios.get<AdminTermsResponse>(
        `${USER_PREFIX}/academic-terms/list`,
        {
          params: {
            page: 1,
            per_page: 100,
          },
        }
      );
      const raw = res.data?.data ?? [];
      return raw.map((x) => ({
        id: x.academic_term_id,
        school_id: x.academic_term_school_id,
        academic_year: x.academic_term_academic_year,
        name: x.academic_term_name,
        start_date: x.academic_term_start_date,
        end_date: x.academic_term_end_date,
        is_active: x.academic_term_is_active,
        angkatan: x.academic_term_angkatan,
        slug: x.academic_term_slug,
        created_at: x.academic_term_created_at,
        updated_at: x.academic_term_updated_at,
      }));
    },
  });

  const terms: AcademicTerm[] = termsQ.data ?? [];

  const activeTerm: AcademicTerm | null = useMemo(() => {
    if (!terms.length) return null;
    const actives = terms.filter((t) => t.is_active);
    return actives[0] ?? terms[0] ?? null;
  }, [terms]);

  const deleteTerm = useDeleteTerm(schoolId || undefined);

  const [toDelete, setToDelete] = useState<AcademicTerm | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    await deleteTerm.mutateAsync(toDelete.id);
    setConfirmOpen(false);
  };

  const columns: ColumnDef<AcademicTerm>[] = [
    {
      id: "academic_year",
      header: "Tahun Ajaran",
      minW: "160px",
      cell: (t) => <span className="font-medium">{t.academic_year}</span>,
    },
    {
      id: "name",
      header: "Nama",
      minW: "140px",
      cell: (t) => t.name,
    },
    {
      id: "date_range",
      header: "Tanggal",
      minW: "200px",
      cell: (t) => (
        <span>
          {dateShort(t.start_date)} — {dateShort(t.end_date)}
        </span>
      ),
    },
    {
      id: "angkatan",
      header: "Angkatan",
      minW: "120px",
      align: "center" as Align,
      cell: (t) => t.angkatan,
    },
    {
      id: "status",
      header: "Status",
      minW: "120px",
      cell: (t) => {
        let status: "active" | "inactive" | "pending" = "inactive";

        // ======== RULE PENDING ========
        // Pending jika tanggal belum lengkap
        if (!t.start_date || !t.end_date) {
          status = "pending";
        }
        // Active
        else if (t.is_active) {
          status = "active";
        }
        // Nonaktif
        else {
          status = "inactive";
        }

        return <CBadgeStatus status={status} />;
      },
    },


  ];

  const statsSlot = termsQ.isLoading ? (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="animate-spin" size={16} /> Memuat periode akademik…
    </div>
  ) : termsQ.isError ? (
    <div className="rounded-xl border p-4 text-sm space-y-2">
      <div className="flex items-center gap-2">
        <Info size={16} /> Gagal memuat periode akademik.
      </div>
      <pre className="text-xs opacity-70 overflow-auto">
        {extractErrorMessage(termsQ.error)}
      </pre>
      <Button size="sm" onClick={() => termsQ.refetch()}>
        Coba lagi
      </Button>
    </div>
  ) : !activeTerm ? (
    <div className="text-sm text-muted-foreground flex items-center gap-2">
      <Info size={16} /> Belum ada periode akademik.
    </div>
  ) : (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Tahun Ajaran</div>
        <div className="text-xl font-semibold">
          {activeTerm.academic_year} — {activeTerm.name}
        </div>
        <div className="text-sm flex items-center gap-2 text-muted-foreground">
          <CalendarDays size={16} /> {dateShort(activeTerm.start_date)} s/d{" "}
          {dateShort(activeTerm.end_date)}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Angkatan</div>
        <div className="text-xl font-semibold">{activeTerm.angkatan}</div>
        <div className="text-sm flex items_center gap-2 text-muted-foreground">
          <CheckCircle2 size={16} /> Status:{" "}
          {activeTerm.is_active ? "Aktif" : "Nonaktif"}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-4 lg:gap-6">
          {/* Header */}
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
            <h1 className="font-semibold text-lg md:text-xl">Tahun Akademik</h1>
          </div>

          <CDataTable<AcademicTerm>
            onAdd={() =>
              navigate(`/${schoolSlug}/sekolah/akademik/tahun-akademik/new`)
            }
            addLabel="Tambah"
            controlsPlacement="above"
            defaultQuery=""
            searchByKeys={["academic_year", "name", "angkatan"]}
            statsSlot={statsSlot}
            loading={termsQ.isLoading}
            error={termsQ.isError ? extractErrorMessage(termsQ.error) : null}
            columns={columns}
            rows={terms}
            getRowId={(t) => t.id}
            onRowClick={(row) =>
              navigate(
                `/${schoolSlug}/sekolah/akademik/tahun-akademik/${row.id}`,
                {
                  state: { term: row },
                }
              )
            }
            renderActions={(t) => (
              <ActionsMenu
                onView={() =>
                  navigate(
                    `/${schoolSlug}/sekolah/akademik/tahun-akademik/${t.id}`,
                    {
                      state: { term: t },
                    }
                  )
                }
                onEdit={() =>
                  navigate(
                    `/${schoolSlug}/sekolah/akademik/tahun-akademik/edit/${t.id}`,
                    {
                      state: { term: t },
                    }
                  )
                }
                onDelete={() => {
                  setToDelete(t);
                  setConfirmOpen(true);
                }}
              />
            )}
            actions={{
              mode: "inline",
              onView: (row) => {
                navigate(
                  `/${schoolSlug}/sekolah/akademik/tahun-akademik/${row.id}`,
                  {
                    state: { term: row },
                  }
                );
              },
              onEdit: (row) => {
                navigate(
                  `/${schoolSlug}/sekolah/akademik/tahun-akademik/edit/${row.id}`,
                  {
                    state: { term: row },
                  }
                );
              },
              onDelete: (row) => {
                setToDelete(row);
                setConfirmOpen(true);
              },
            }}
            pageSize={20}
          />
        </div>
      </main>

      {/* Modal Konfirmasi Hapus */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Hapus “{toDelete?.name ?? "Periode"}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin menghapus periode akademik ini? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteTerm.isPending}
            >
              {deleteTerm.isPending ? "Menghapus…" : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SchoolAcademic;
