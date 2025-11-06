// src/pages/pendidikanku-dashboard/dashboard-school/academic/SchoolAcademic.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Layers,
  Info,
  Loader2,
  ArrowLeft,
  Plus,
  MoreHorizontal,
  Link as LinkIcon,
  Users,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";

/* ---------- shadcn/ui ---------- */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  data: AcademicTermApi[];
  pagination?: { limit: number; offset: number; total: number };
};

/* ===================== Const & Helpers ===================== */
const API_PREFIX = "/public";
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

function normalizeAcademicYear(input: string) {
  const s = (input || "").trim();
  const m = s.match(/^(\d{4})\s*\/\s*(\d{2})$/);
  if (m) {
    const start = Number(m[1]);
    return `${start}/${start + 1}`;
  }
  const mFull = s.match(/^(\d{4})\s*\/\s*(\d{4})$/);
  if (mFull) return `${mFull[1]}/${mFull[2]}`;
  return s;
}

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

function toZDate(d: string) {
  if (!d) return "";
  if (d.includes("T")) return d;
  return `${d}T00:00:00Z`;
}

/* ========== Payload & mapping ========= */
type TermPayload = {
  academic_year: string;
  name: string;
  start_date: string; // yyyy-mm-dd
  end_date: string; // yyyy-mm-dd
  angkatan: number;
  is_active: boolean;
  slug?: string;
};

function mapApiToTerm(x: AcademicTermApi): AcademicTerm {
  return {
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
  };
}

function mapPayloadToApi(p: TermPayload) {
  return {
    academic_term_academic_year: normalizeAcademicYear(p.academic_year),
    academic_term_name: p.name,
    academic_term_angkatan: Number(p.angkatan),
    academic_term_start_date: toZDate(p.start_date),
    academic_term_end_date: toZDate(p.end_date),
    academic_term_is_active: Boolean(p.is_active),
    ...(p.slug ? { academic_term_slug: p.slug } : {}),
  };
}

/* ===================== Mutations (CRUD) ===================== */
function useCreateTerm(schoolId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TermPayload) => {
      const { data } = await axios.post(
        `${ADMIN_PREFIX}/${encodeURIComponent(schoolId!)}/academic-terms`,
        mapPayloadToApi(payload)
      );
      return data;
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

function useUpdateTerm(schoolId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: TermPayload;
    }) => {
      const { data } = await axios.patch(
        `${ADMIN_PREFIX}/${encodeURIComponent(schoolId!)}/academic-terms/${id}`,
        mapPayloadToApi(payload)
      );
      return data;
    },
    onMutate: async ({ id, payload }) => {
      await qc.cancelQueries({ queryKey: TERMS_QKEY(schoolId) });
      const previous = qc.getQueryData<AcademicTerm[]>(TERMS_QKEY(schoolId));
      if (previous) {
        qc.setQueryData<AcademicTerm[]>(
          TERMS_QKEY(schoolId),
          previous.map((t) =>
            t.id === id
              ? {
                  ...t,
                  academic_year: normalizeAcademicYear(payload.academic_year),
                  name: payload.name,
                  start_date: toZDate(payload.start_date),
                  end_date: toZDate(payload.end_date),
                  angkatan: Number(payload.angkatan),
                  is_active: Boolean(payload.is_active),
                  slug: payload.slug ?? t.slug,
                }
              : t
          )
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

/* ===================== Small shadcn helpers ===================== */
function SearchBar({
  value,
  onChange,
  placeholder,
  rightExtra,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rightExtra?: React.ReactNode;
}) {
  return (
    <div className="flex w-full items-center gap-3">
      <Input
        placeholder={placeholder || "Cari…"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10"
      />
      {rightExtra}
    </div>
  );
}

function PerPageSelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const options = [10, 20, 50, 100, 200];
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Per halaman</span>
      <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger className="h-10 w-[110px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((n) => (
            <SelectItem key={n} value={String(n)}>
              {n}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function PaginationBar({
  pageStart,
  pageEnd,
  total,
  canPrev,
  canNext,
  onPrev,
  onNext,
  rightExtra,
}: {
  pageStart: number;
  pageEnd: number;
  total: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  rightExtra?: React.ReactNode;
}) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Menampilkan {pageStart}–{pageEnd} dari {total}
      </div>
      <div className="flex items-center gap-3">
        {rightExtra}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrev}
            disabled={!canPrev}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={!canNext}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

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

/* ===================== Form Modal (shadcn) ===================== */
function TermFormDialog({
  open,
  onClose,
  initial,
  onSubmit,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Partial<TermPayload>;
  onSubmit: (values: TermPayload) => void;
  loading?: boolean;
}) {
  const [values, setValues] = useState<TermPayload>(() => ({
    academic_year: initial?.academic_year ?? "",
    name: initial?.name ?? "",
    start_date: initial?.start_date ?? "",
    end_date: initial?.end_date ?? "",
    angkatan: Number(initial?.angkatan ?? new Date().getFullYear()),
    is_active: Boolean(initial?.is_active ?? false),
    slug: initial?.slug ?? "",
  }));

  useEffect(() => {
    if (!open) return;
    setValues({
      academic_year: initial?.academic_year ?? "",
      name: initial?.name ?? "",
      start_date: initial?.start_date ?? "",
      end_date: initial?.end_date ?? "",
      angkatan: Number(initial?.angkatan ?? new Date().getFullYear()),
      is_active: Boolean(initial?.is_active ?? false),
      slug: initial?.slug ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = <K extends keyof TermPayload>(k: K, v: TermPayload[K]) =>
    setValues((s) => ({ ...s, [k]: v }));

  const canSubmit =
    values.academic_year.trim() &&
    values.name.trim() &&
    values.start_date &&
    values.end_date &&
    new Date(values.end_date) > new Date(values.start_date) &&
    Number.isFinite(values.angkatan) &&
    values.angkatan > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Periode Akademik</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <label className="text-sm">Tahun Ajaran</label>
            <Input
              value={values.academic_year}
              onChange={(e) => set("academic_year", e.target.value)}
              placeholder="2025/2026"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm">Nama Periode</label>
            <Input
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ganjil / Genap"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm">Mulai</label>
              <Input
                type="date"
                value={values.start_date}
                onChange={(e) => set("start_date", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm">Selesai</label>
              <Input
                type="date"
                value={values.end_date}
                onChange={(e) => set("end_date", e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm">Angkatan</label>
              <Input
                type="number"
                value={values.angkatan}
                onChange={(e) => set("angkatan", Number(e.target.value || 0))}
              />
            </div>
            <div className="flex items-end gap-2">
              <input
                id="is_active"
                type="checkbox"
                checked={values.is_active}
                onChange={(e) => set("is_active", e.target.checked)}
              />
              <label htmlFor="is_active" className="text-sm">
                Aktif
              </label>
            </div>
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm">Slug (opsional)</label>
            <Input
              value={values.slug || ""}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="ganjil-2025"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} disabled={!!loading}>
            Batal
          </Button>
          <Button
            onClick={() => onSubmit(values)}
            disabled={!canSubmit || !!loading}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              "Simpan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ===================== Page ===================== */
const SchoolAcademic: React.FC = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!schoolId) console.warn("[SchoolAcademic] Missing :schoolId in params");
  }, [schoolId]);

  const termsQ = useQuery<AcademicTerm[], Error>({
    queryKey: TERMS_QKEY(schoolId),
    enabled: !!schoolId,
    staleTime: 60_000,
    retry: 1,
    placeholderData: (prev) => prev ?? [],
    queryFn: async () => {
      const res = await axios.get<AdminTermsResponse>(
        `${API_PREFIX}/${encodeURIComponent(schoolId!)}/academic-terms/list`,
        { params: { limit: 999, offset: 0, _: Date.now() } }
      );
      const raw = res.data?.data ?? [];
      return raw.map(mapApiToTerm);
    },
  });

  const terms: AcademicTerm[] = termsQ.data ?? [];

  /* Search (sinkron ?q=) — sederhanakan: state lokal saja */
  const [q, setQ] = useState("");

  const filtered: AcademicTerm[] = useMemo(() => {
    const s = (q || "").toLowerCase().trim();
    if (!s) return terms;
    return terms.filter(
      (t) =>
        t.academic_year.toLowerCase().includes(s) ||
        t.name.toLowerCase().includes(s) ||
        String(t.angkatan).includes(s)
    );
  }, [terms, q]);

  /* Pagination */
  const total = filtered.length;
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    setOffset(0); // reset ke halaman pertama saat filter/limit berubah
  }, [q, limit]);
  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(offset + limit, total);
  const canPrev = offset > 0;
  const canNext = offset + limit < total;
  const handlePrev = () => canPrev && setOffset((v) => Math.max(0, v - limit));
  const handleNext = () =>
    canNext &&
    setOffset((v) => Math.min(total - (total % limit || limit), v + limit));

  const pageTerms: AcademicTerm[] = useMemo(
    () => filtered.slice(offset, Math.min(offset + limit, total)),
    [filtered, offset, limit, total]
  );

  const activeTerm: AcademicTerm | null = useMemo(() => {
    if (!terms.length) return null;
    const actives = terms.filter((t) => t.is_active);
    return actives[0] ?? terms[0] ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terms.map((t) => `${t.id}-${t.is_active}`).join("|")]);

  const createTerm = useCreateTerm(schoolId);
  const updateTerm = useUpdateTerm(schoolId);
  const deleteTerm = useDeleteTerm(schoolId);

  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    editing?: AcademicTerm | null;
  } | null>(null);

  const [toDelete, setToDelete] = useState<AcademicTerm | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    await deleteTerm.mutateAsync(toDelete.id);
    setConfirmOpen(false);
  };

  const modalInitial = useMemo(() => {
    if (!(modal?.mode === "edit" && modal.editing)) return undefined;
    const e = modal.editing;
    return {
      academic_year: e.academic_year,
      name: e.name,
      start_date: e.start_date?.slice(0, 10) ?? "",
      end_date: e.end_date?.slice(0, 10) ?? "",
      angkatan: e.angkatan,
      is_active: e.is_active,
      slug: e.slug ?? "",
    } as Partial<TermPayload>;
  }, [modal?.mode, modal?.editing?.id]);

  const handleSubmit = useCallback(
    (v: TermPayload) => {
      if (modal?.mode === "edit" && modal.editing) {
        updateTerm.mutate(
          { id: modal.editing.id, payload: v },
          {
            onSuccess: () => setModal(null),
            onError: (e: any) =>
              alert(extractErrorMessage(e) || "Gagal memperbarui term"),
          }
        );
      } else {
        createTerm.mutate(v, {
          onSuccess: () => setModal(null),
          onError: (e: any) =>
            alert(extractErrorMessage(e) || "Gagal membuat term"),
        });
      }
    },
    [modal, updateTerm, createTerm]
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 lg:gap-6">
          {/* ===== Header ===== */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="hidden md:flex items-center gap-2 font-semibold">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />
              </Button>
              <h1 className="text-lg">Periode Akademik</h1>
            </div>

            <div className="flex-1 min-w-0">
              <SearchBar
                value={q}
                onChange={setQ}
                placeholder="Cari tahun, nama, atau angkatan…"
                rightExtra={<PerPageSelect value={limit} onChange={setLimit} />}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="gap-1"
                onClick={() => setModal({ mode: "create" })}
              >
                <Plus size={16} /> Tambah
              </Button>
            </div>
          </div>

          {/* ===== Ringkasan term aktif ===== */}
          <Card>
            <CardContent className="p-5">
              {termsQ.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="animate-spin" size={16} /> Memuat periode
                  akademik…
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
                <div className="rounded-xl border p-4 text-sm text-muted-foreground flex items-center gap-2">
                  <Info size={16} /> Belum ada periode akademik.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Tahun Ajaran
                    </div>
                    <div className="text-xl font-semibold">
                      {activeTerm.academic_year} — {activeTerm.name}
                    </div>
                    <div className="text-sm flex items-center gap-2 text-muted-foreground">
                      <CalendarDays size={16} />{" "}
                      {dateShort(activeTerm.start_date)} s/d{" "}
                      {dateShort(activeTerm.end_date)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Angkatan
                    </div>
                    <div className="text-xl font-semibold">
                      {activeTerm.angkatan}
                    </div>
                    <div className="text-sm flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 size={16} /> Status:{" "}
                      {activeTerm.is_active ? "Aktif" : "Nonaktif"}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ===== Daftar semua terms + aksi ===== */}
          <Card>
            <CardHeader className="py-3 px-4 md:px-5">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers size={18} /> Daftar Periode
                <span className="text-sm font-normal text-muted-foreground">
                  {termsQ.isFetching ? "memuat…" : `${total} total`}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-5">
              {termsQ.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="animate-spin" size={16} /> Memuat…
                </div>
              ) : total === 0 ? (
                <div className="rounded-xl border p-4 text-sm text-muted-foreground flex items-center gap-2">
                  <Info size={16} /> Belum ada data.
                </div>
              ) : (
                <>
                  {/* Mobile: Cards */}
                  <div className="grid gap-3 md:hidden">
                    {pageTerms.map((t) => (
                      <Card key={t.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-semibold truncate">
                                {t.academic_year} — {t.name}
                              </div>
                              <div className="text-sm mt-0.5 text-muted-foreground">
                                {dateShort(t.start_date)} —{" "}
                                {dateShort(t.end_date)}
                              </div>
                            </div>
                            <Badge
                              variant={t.is_active ? "default" : "outline"}
                            >
                              {t.is_active ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Users size={14} /> Angkatan {t.angkatan}
                            </span>
                            {t.slug && (
                              <span className="inline-flex items-center gap-1">
                                <LinkIcon size={14} /> {t.slug}
                              </span>
                            )}
                          </div>

                          <div className="pt-2 flex justify-end">
                            <ActionsMenu
                              onView={() =>
                                navigate(
                                  `/${schoolId}/sekolah/menu-utama/akademik/detail/${t.id}`,
                                  { state: { term: t } }
                                )
                              }
                              onEdit={() =>
                                setModal({ mode: "edit", editing: t })
                              }
                              onDelete={() => {
                                setToDelete(t);
                                setConfirmOpen(true);
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Tablet/Desktop: Table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tahun Ajaran</TableHead>
                          <TableHead>Nama</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Angkatan</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-12 text-right">
                            Aksi
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pageTerms.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium">
                              {t.academic_year}
                            </TableCell>
                            <TableCell>{t.name}</TableCell>
                            <TableCell>
                              {dateShort(t.start_date)} —{" "}
                              {dateShort(t.end_date)}
                            </TableCell>
                            <TableCell>{t.angkatan}</TableCell>
                            <TableCell>
                              <Badge
                                variant={t.is_active ? "default" : "outline"}
                              >
                                {t.is_active ? "Aktif" : "Nonaktif"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <ActionsMenu
                                onView={() =>
                                  navigate(
                                    `/${schoolId}/sekolah/akademik/detail/${t.id}`,
                                    { state: { term: t } }
                                  )
                                }
                                onEdit={() =>
                                  setModal({ mode: "edit", editing: t })
                                }
                                onDelete={() => {
                                  setToDelete(t);
                                  setConfirmOpen(true);
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <PaginationBar
                    pageStart={pageStart}
                    pageEnd={pageEnd}
                    total={total}
                    canPrev={canPrev}
                    canNext={canNext}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    rightExtra={
                      <span className="text-sm text-muted-foreground">
                        {termsQ.isFetching ? "memuat…" : `${total} total`}
                      </span>
                    }
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal Create/Edit */}
      <TermFormDialog
        key={modal?.editing?.id ?? modal?.mode ?? "closed"}
        open={!!modal}
        onClose={() => setModal(null)}
        initial={modalInitial}
        loading={createTerm.isPending || updateTerm.isPending}
        onSubmit={handleSubmit}
      />

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
