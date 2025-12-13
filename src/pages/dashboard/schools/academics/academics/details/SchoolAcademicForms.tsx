// src/pages/dashboard/school/academic/SchoolAcademicTermForm.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "@/lib/axios";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Info,
  Loader2,
} from "lucide-react";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";

/* Layout header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* Context user dari simple-context (JWT) */
import { useCurrentUser } from "@/hooks/useCurrentUser";
import CActionsButton from "@/components/costum/common/buttons/CActionsButton";

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
  academic_term_created_at?: string;
  academic_term_updated_at?: string;
};

type AdminTermDetailResponse = {
  success: boolean;
  message?: string;
  data: AcademicTermApi;
};

/* ===================== Const & Helpers ===================== */
const USER_PREFIX = "/u";
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

/* ===== Date helpers (shadcn calendar) ===== */
function parseYMD(s?: string): Date | undefined {
  if (!s) return undefined;
  // ambil yyyy-mm-dd aja
  const ymd = s.includes("T") ? s.slice(0, 10) : s;
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return undefined;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo, d));
  if (Number.isNaN(dt.getTime())) return undefined;
  return dt;
}
function formatYMD(d?: Date): string {
  if (!d) return "";
  // pakai UTC biar stabil (ga geser hari karena timezone)
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ========== Payload & mapping ========= */
type TermFormValues = {
  academic_year: string;
  name: string;
  start_date: string; // yyyy-mm-dd
  end_date: string; // yyyy-mm-dd
  angkatan: string;
  is_active: boolean;
  slug: string;
};

type TermPayload = {
  academic_year: string;
  name: string;
  start_date: string;
  end_date: string;
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

/* ===================== Component ===================== */
const SchoolAcademicForms: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();

  const { data: currentUser } = useCurrentUser();
  const schoolId = currentUser?.membership?.school_id ?? "";
  const schoolSlug = currentUser?.membership?.school_slug ?? "";

  const { setHeader } = useDashboardHeader();

  const isEditMode = Boolean(params.id && params.id !== "new");
  const termId = params.id;

  const stateTerm = (location.state as { term?: AcademicTerm } | null)?.term;

  useEffect(() => {
    setHeader({
      title: isEditMode ? "Edit Tahun Akademik" : "Tambah Tahun Akademik",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Akademik" },
        {
          label: "Tahun Akademik",
          href: `/${schoolSlug}/sekolah/akademik/tahun-akademik`,
        },
        { label: isEditMode ? "Edit" : "Tambah" },
      ],
      showBack: true,
    });
  }, [setHeader, isEditMode, schoolSlug]);

  const qc = useQueryClient();

  const detailQ = useQuery<AcademicTerm, Error>({
    queryKey: ["academic-term-detail", schoolId, termId],
    enabled: isEditMode && !!schoolId && !!termId && !stateTerm,
    queryFn: async () => {
      const res = await axios.get<AdminTermDetailResponse>(
        `${USER_PREFIX}/academic-terms/${termId}`
      );
      return mapApiToTerm(res.data.data);
    },
  });

  const term: AcademicTerm | undefined = useMemo(() => {
    if (stateTerm) return stateTerm;
    if (!isEditMode) return undefined;
    return detailQ.data;
  }, [stateTerm, detailQ.data, isEditMode]);

  const emptyValues: TermFormValues = useMemo(
    () => ({
      academic_year: "",
      name: "",
      start_date: "",
      end_date: "",
      angkatan: "",
      is_active: false,
      slug: "",
    }),
    []
  );

  const [values, setValues] = useState<TermFormValues>(emptyValues);

  useEffect(() => {
    if (!isEditMode) {
      setValues(emptyValues);
      return;
    }
    if (!term) return;

    setValues({
      academic_year: term.academic_year ?? "",
      name: term.name ?? "",
      start_date: term.start_date ? term.start_date.slice(0, 10) : "",
      end_date: term.end_date ? term.end_date.slice(0, 10) : "",
      angkatan: Number.isFinite(term.angkatan) ? String(term.angkatan) : "",
      is_active: Boolean(term.is_active),
      slug: term.slug ?? "",
    });
  }, [isEditMode, term, emptyValues]);

  const angkatanNum = useMemo(() => {
    const n = Number(values.angkatan);
    return Number.isFinite(n) ? n : NaN;
  }, [values.angkatan]);

  const canSubmit =
    values.academic_year.trim() &&
    values.name.trim() &&
    values.start_date &&
    values.end_date &&
    new Date(values.end_date) > new Date(values.start_date) &&
    Number.isFinite(angkatanNum) &&
    angkatanNum > 0;

  const createMutation = useMutation({
    mutationFn: async (payload: TermPayload) => {
      const { data } = await axios.post(
        `/api/a/academic-terms`,
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

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: TermPayload;
    }) => {
      const { data } = await axios.patch(
        `/api/a/academic-terms/${id}`,
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

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
      if (!canSubmit || !schoolId) return;

      const payload: TermPayload = {
        academic_year: values.academic_year,
        name: values.name,
        start_date: values.start_date,
        end_date: values.end_date,
        angkatan: Number(values.angkatan),
        is_active: Boolean(values.is_active),
        slug: values.slug?.trim() || undefined,
      };

      if (isEditMode && termId) {
        updateMutation.mutate(
          { id: termId, payload },
          {
            onSuccess: () =>
              navigate(`/${schoolSlug}/sekolah/akademik/tahun-akademik`, {
                replace: true,
              }),
            onError: (err: any) => setSubmitError(extractErrorMessage(err)),
          }
        );
      } else {
        createMutation.mutate(payload, {
          onSuccess: () =>
            navigate(`/${schoolSlug}/sekolah/akademik/tahun-akademik`, {
              replace: true,
            }),
          onError: (err: any) => setSubmitError(extractErrorMessage(err)),
        });
      }
    },
    [
      canSubmit,
      schoolId,
      values,
      isEditMode,
      termId,
      updateMutation,
      createMutation,
      navigate,
      schoolSlug,
    ]
  );

  const handleBack = () =>
    navigate(`/${schoolSlug}/sekolah/akademik/tahun-akademik`);

  const loadingDetail = isEditMode && !term && detailQ.isLoading;
  const detailError = isEditMode && !term && detailQ.isError;

  // Date objects untuk Calendar
  const startDateObj = useMemo(
    () => parseYMD(values.start_date),
    [values.start_date]
  );
  const endDateObj = useMemo(
    () => parseYMD(values.end_date),
    [values.end_date]
  );

  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-4 lg:gap-6">
          <div className="md:flex hidden items-center gap-3">
            <Button onClick={handleBack} variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="font-semibold text-lg md:text-xl">
                {isEditMode ? "Edit Tahun Akademik" : "Tambah Tahun Akademik"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEditMode
                  ? "Perbarui informasi periode akademik."
                  : "Buat periode akademik baru untuk sekolah ini."}
              </p>
            </div>
          </div>

          {loadingDetail && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="animate-spin" size={16} />
              Memuat data periode…
            </div>
          )}

          {detailError && (
            <div className="rounded-xl border p-4 text-sm space-y-2">
              <div className="flex items-center gap-2">
                <Info size={16} /> Gagal memuat data periode.
              </div>
              <pre className="text-xs opacity-70 overflow-auto">
                {extractErrorMessage(detailQ.error)}
              </pre>
              <Button size="sm" onClick={() => detailQ.refetch()}>
                Coba lagi
              </Button>
            </div>
          )}

          <Card className="border">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <CalendarDays size={18} />
                  {isEditMode ? "Form Edit" : "Form Tambah"} Tahun Akademik
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="academic_year">Tahun Ajaran</Label>
                    <Input
                      id="academic_year"
                      placeholder="Contoh: 2025/2026"
                      value={values.academic_year}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          academic_year: e.target.value,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Format akan dinormalisasi, misal{" "}
                      <span className="font-mono">2025/26</span> →{" "}
                      <span className="font-mono">2025/2026</span>.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="name">Nama Periode</Label>
                    <Input
                      id="name"
                      placeholder="Contoh: Semester Ganjil"
                      value={values.name}
                      onChange={(e) =>
                        setValues((v) => ({ ...v, name: e.target.value }))
                      }
                    />
                  </div>
                </div>

                {/* ====== Date Picker Shadcn ====== */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Tanggal Mulai</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            // ✅ bikin tampilannya sama kayak Input shadcn
                            "h-10 w-full justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
                            "hover:bg-transparent hover:text-foreground",
                            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            // kalau kosong, samain muted-nya
                            !values.start_date && "text-muted-foreground"
                          )}
                        >
                          {values.start_date
                            ? dateShort(values.start_date)
                            : "Pilih tanggal mulai"}
                          <CalendarDays className="h-4 w-4 opacity-70" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDateObj}
                          onSelect={(d) => {
                            const next = formatYMD(d);

                            setValues((prev) => {
                              const shouldClearEnd =
                                prev.end_date && next && prev.end_date < next;

                              return {
                                ...prev,
                                start_date: next,
                                end_date: shouldClearEnd ? "" : prev.end_date,
                              };
                            });
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Tanggal Selesai</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-between font-normal",
                            !values.end_date && "text-muted-foreground"
                          )}
                          disabled={!values.start_date} // optional: end baru bisa dipilih setelah start
                        >
                          {values.end_date
                            ? dateShort(values.end_date)
                            : "Pilih tanggal selesai"}
                          <CalendarDays className="h-4 w-4 opacity-70" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDateObj}
                          // optional: disable tanggal sebelum start_date
                          disabled={(d) => {
                            if (!values.start_date) return false;
                            const min = parseYMD(values.start_date);
                            if (!min) return false;
                            // bandingkan UTC YMD
                            return formatYMD(d) < formatYMD(min);
                          }}
                          onSelect={(d) => {
                            const next = formatYMD(d);
                            setValues((v) => ({ ...v, end_date: next }));
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {!values.start_date && (
                      <p className="text-xs text-muted-foreground">
                        Pilih tanggal mulai dulu ya.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="angkatan">Angkatan</Label>
                    <Input
                      id="angkatan"
                      type="number"
                      placeholder="Contoh: 2025"
                      value={values.angkatan}
                      onChange={(e) =>
                        setValues((v) => ({ ...v, angkatan: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <div className="flex items-center gap-3 rounded-md border px-3 py-2">
                      <Checkbox
                        id="is_active"
                        checked={values.is_active}
                        onCheckedChange={(checked) =>
                          setValues((v) => ({
                            ...v,
                            is_active: Boolean(checked),
                          }))
                        }
                      />
                      <div className="space-y-0.5">
                        <label
                          htmlFor="is_active"
                          className="text-sm font-medium leading-none cursor-pointer flex items-center gap-1"
                        >
                          {values.is_active ? (
                            <>
                              <CheckCircle2 size={14} />
                              Aktif
                            </>
                          ) : (
                            "Tandai sebagai aktif"
                          )}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Hanya satu periode aktif yang biasanya dipakai sebagai
                          default di banyak fitur.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/40 px-3 py-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Info size={14} />
                    <span className="font-medium">Ringkasan</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-2 text-xs md:text-sm">
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Tahun Ajaran</div>
                      <div className="font-medium flex flex-wrap gap-1 items-center">
                        {normalizeAcademicYear(values.academic_year) || "-"}
                        {values.is_active && (
                          <Badge className="ml-1" variant="default">
                            Aktif
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground">
                        Nama:{" "}
                        <span className="font-medium">
                          {values.name || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-muted-foreground">Periode</div>
                      <div>
                        {values.start_date && values.end_date
                          ? `${dateShort(values.start_date)} — ${dateShort(
                              values.end_date
                            )}`
                          : "-"}
                      </div>
                      <div className="text-muted-foreground">
                        Angkatan:{" "}
                        <span className="font-medium">
                          {values.angkatan || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2 text-xs whitespace-pre-wrap">
                    <span className="font-medium">Gagal menyimpan:</span>{" "}
                    {submitError}
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-end">
                <CActionsButton
                  onCancel={handleBack}
                  onSave={() => {}}
                  loadingSave={isSubmitting}
                />
                <button type="submit" className="hidden" aria-hidden="true" />
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SchoolAcademicForms;
