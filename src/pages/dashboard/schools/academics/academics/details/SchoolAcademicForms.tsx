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

/* ===================== Halaman Add/Edit ===================== */

const SchoolAcademicForms: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();

  // 🔐 user & school context
  const { data: currentUser } = useCurrentUser();
  const schoolId = currentUser?.membership?.school_id ?? "";
  const schoolSlug = currentUser?.membership?.school_slug ?? "";

  const { setHeader } = useDashboardHeader();

  const isEditMode = Boolean(params.id && params.id !== "new");
  const termId = params.id;

  // data dari list (kalau datang via navigate state)
  const stateTerm = (location.state as { term?: AcademicTerm })?.term;

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

  /* ========== Query detail kalau edit (fallback kalau tidak ada state) ========== */
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

  const [values, setValues] = useState<TermPayload>(() => {
    const nowYear = new Date().getFullYear();
    if (term) {
      return {
        academic_year: term.academic_year ?? "",
        name: term.name ?? "",
        start_date: term.start_date ? term.start_date.slice(0, 10) : "",
        end_date: term.end_date ? term.end_date.slice(0, 10) : "",
        angkatan: term.angkatan ?? nowYear,
        is_active: term.is_active ?? false,
        slug: term.slug ?? "",
      };
    }
    return {
      academic_year: `${nowYear}/${nowYear + 1}`,
      name: "",
      start_date: "",
      end_date: "",
      angkatan: nowYear,
      is_active: false,
      slug: "",
    };
  });

  // sinkronkan state form saat detail term baru datang
  useEffect(() => {
    if (!term) return;
    setValues({
      academic_year: term.academic_year ?? "",
      name: term.name ?? "",
      start_date: term.start_date ? term.start_date.slice(0, 10) : "",
      end_date: term.end_date ? term.end_date.slice(0, 10) : "",
      angkatan: term.angkatan ?? new Date().getFullYear(),
      is_active: term.is_active ?? false,
      slug: term.slug ?? "",
    });
  }, [term]);

  const canSubmit =
    values.academic_year.trim() &&
    values.name.trim() &&
    values.start_date &&
    values.end_date &&
    new Date(values.end_date) > new Date(values.start_date) &&
    Number.isFinite(values.angkatan) &&
    values.angkatan > 0;

  /* ========== Mutations ========== */
  const createMutation = useMutation({
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

  const updateMutation = useMutation({
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
            onSuccess: () => {
              navigate(`/${schoolSlug}/sekolah/akademik/tahun-akademik`, {
                replace: true,
              });
            },
            onError: (err: any) => {
              setSubmitError(extractErrorMessage(err));
            },
          }
        );
      } else {
        createMutation.mutate(payload, {
          onSuccess: () => {
            navigate(`/${schoolSlug}/sekolah/akademik/tahun-akademik`, {
              replace: true,
            });
          },
          onError: (err: any) => {
            setSubmitError(extractErrorMessage(err));
          },
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

  const handleBack = () => {
    navigate(`/${schoolSlug}/sekolah/akademik/tahun-akademik`);
  };

  const loadingDetail = isEditMode && !term && detailQ.isLoading;
  const detailError = isEditMode && !term && detailQ.isError;

  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-4 lg:gap-6">
          {/* Header minimal di dalam page */}
          <div className="md:flex hidden items-center gap-3">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="icon"
            >
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

          {/* Form */}
          <Card className="border">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <CalendarDays size={18} />
                  {isEditMode ? "Form Edit" : "Form Tambah"} Tahun Akademik
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tahun ajaran & Nama */}
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

                {/* Tanggal mulai & akhir */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="start_date">Tanggal Mulai</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={values.start_date}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          start_date: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="end_date">Tanggal Selesai</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={values.end_date}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          end_date: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Angkatan & status aktif */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="angkatan">Angkatan</Label>
                    <Input
                      id="angkatan"
                      type="number"
                      value={values.angkatan}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          angkatan: Number(e.target.value || 0),
                        }))
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

                {/* Slug optional */}
                <div className="space-y-1.5">
                  <Label htmlFor="slug">Slug (opsional)</Label>
                  <Input
                    id="slug"
                    placeholder="Contoh: ganjil-2025"
                    value={values.slug ?? ""}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, slug: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Kalau dikosongkan, backend bisa membuat otomatis (jika kamu
                    atur begitu).
                  </p>
                </div>

                {/* Preview singkat */}
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
                        {values.start_date && values.end_date ? (
                          <>
                            {dateShort(values.start_date)} —{" "}
                            {dateShort(values.end_date)}
                          </>
                        ) : (
                          "-"
                        )}
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
                  onSave={() => { }}         // akan di-trigger oleh submit form
                  loadingSave={isSubmitting}
                />
              </CardFooter>

            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SchoolAcademicForms;