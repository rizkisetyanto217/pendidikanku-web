// src/pages/dashboard/school/class/SchoolClassForm.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { getActiveschoolId } from "@/lib/axios";

/* current user */
import { useCurrentUser } from "@/hooks/useCurrentUser";

/* layout header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, ArrowLeft } from "lucide-react";
import CActionsButton from "@/components/costum/common/buttons/CActionsButton";

/* ================= Types ================= */
type ClassStatus = "active" | "inactive";

type ApiClass = {
  class_id: string;
  class_school_id: string;

  class_class_parent_id: string;

  class_slug: string;
  class_name: string;

  class_start_date?: string | null;
  class_end_date?: string | null;

  class_academic_term_id?: string | null;

  class_registration_opens_at?: string | null;
  class_registration_closes_at?: string | null;

  class_quota_total?: number | null;
  class_quota_taken?: number | null;

  class_status: ClassStatus;
  class_image_url?: string | null;

  class_class_parent_code_cache?: string | null;
  class_class_parent_name_cache?: string | null;
  class_class_parent_slug_cache?: string | null;
  class_class_parent_level_cache?: number | null;

  class_academic_term_academic_year_cache?: string | null;
  class_academic_term_name_cache?: string | null;
  class_academic_term_slug_cache?: string | null;
  class_academic_term_angkatan_cache?: string | null;

  class_created_at: string;
  class_updated_at: string;
};

type ApiListClasses = { data: ApiClass[] };

type ClassParentItem = {
  class_parent_id: string;
  class_parent_name: string;
  class_parent_slug: string;
  class_parent_level?: number | null;
};

type ApiClassParentsList = { data: ClassParentItem[] };

type TermItem = {
  academic_term_id: string;
  academic_term_school_id: string;
  academic_term_academic_year: string;
  academic_term_name: string;
  academic_term_slug?: string | null;
  academic_term_is_active: boolean;
};

type TermsListResp = { data: TermItem[] };

type FormState = {
  name: string;
  slug: string;
  parentId: string;
  termId: string;

  useClassPeriod: boolean;
  startDate: string;
  endDate: string;

  useRegistrationWindow: boolean;
  regOpenDate: string;
  regCloseDate: string;

  quotaTotal: string;
  isActive: boolean;
};

const ADMIN_PREFIX = "/a";
const USER_PREFIX = "/u";

/* ================= Helpers ================= */
const toSlug = (s: string) =>
  (s || "kelas-baru").toLowerCase().trim().replace(/\s+/g, "-");

// DATE column → "YYYY-MM-DD"
const toDateOrNull = (v: string) => (v ? v : null);

// TIMESTAMPTZ column → ISO (midnight UTC)
const toTsOrNull = (v: string) => (v ? `${v}T00:00:00Z` : null);

const extractErrorMessage = (err: any) => {
  const d = err?.response?.data;
  if (!d) return err?.message || "Request error";
  if (typeof d === "string") return d;
  if (d.message) return d.message;
  try {
    return JSON.stringify(d);
  } catch {
    return String(d);
  }
};

const isValidDateStr = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

// bandingin string YYYY-MM-DD aman secara lexicographical
const isAfter = (a: string, b: string) => a > b;

/* ================= Mutations ================= */
function useCreateClass(schoolId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await axios.post(
        `${ADMIN_PREFIX}/${encodeURIComponent(schoolId!)}/classes`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["classes-public", schoolId] });
    },
  });
}

function useUpdateClass(schoolId?: string | null, classId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await axios.patch(
        `${ADMIN_PREFIX}/${encodeURIComponent(schoolId!)}/classes/${classId}`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["classes-public", schoolId] });
    },
  });
}

/* ================= Page ================= */
const SchoolClassForm: React.FC = () => {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId?: string }>();
  const isEdit = Boolean(classId);

  const location = useLocation() as {
    state?: { classRow?: Partial<ApiClass> | any };
  };

  /* schoolId dari simple-context + fallback cookie */
  const currentUserQ = useCurrentUser();
  const membership = currentUserQ.data?.membership ?? null;
  const schoolIdFromMembership = membership?.school_id ?? null;
  const schoolId = schoolIdFromMembership || getActiveschoolId() || null;

  /* Header */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: isEdit ? "Edit Kelas" : "Tambah Kelas",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas" },
        { label: "Daftar Kelas", href: "kelas/daftar-kelas" },
        { label: isEdit ? "Edit" : "Tambah" },
      ],
      showBack: true,
    });
  }, [setHeader, isEdit]);

  const handleBack = () => navigate(-1);

  /* ===== Options: parent (level) & terms ===== */
  const parentsQ = useQuery({
    queryKey: ["class-parents-options", schoolId],
    enabled: !!schoolId,
    queryFn: async (): Promise<ClassParentItem[]> => {
      const res = await axios.get<ApiClassParentsList>(
        `/public/${schoolId}/class-parents/list`,
        { params: { per_page: 500, page: 1 } }
      );
      return res.data?.data ?? [];
    },
  });

  const termsQ = useQuery({
    queryKey: ["academic-terms-options", schoolId],
    enabled: !!schoolId,
    queryFn: async (): Promise<TermItem[]> => {
      const res = await axios.get<TermsListResp>(
        `${USER_PREFIX}/academic-terms/list`,
        { params: { page: 1, per_page: 200 } }
      );
      return res.data?.data ?? [];
    },
  });

  /* ===== Detail kelas (untuk edit) ===== */
  const classDetailQ = useQuery({
    queryKey: ["class-detail", schoolId, classId],
    enabled: !!schoolId && !!classId,
    queryFn: async (): Promise<ApiClass> => {
      const res = await axios.get<ApiListClasses>(
        `/public/${schoolId}/classes/list`,
        { params: { page: 1, per_page: 500 } }
      );
      const found = (res.data?.data ?? []).find((c) => c.class_id === classId);
      if (!found) throw new Error("Kelas tidak ditemukan");
      return found;
    },
  });

  const initialFromState = location.state?.classRow as Partial<ApiClass> | null;

  const resolvedClass: ApiClass | null = useMemo(() => {
    if (!isEdit) return null;
    if (initialFromState && initialFromState.class_id) {
      return initialFromState as ApiClass;
    }
    if (classDetailQ.data) return classDetailQ.data;
    return null;
  }, [isEdit, initialFromState, classDetailQ.data]);

  /* ===== Form state ===== */
  const [form, setForm] = useState<FormState>({
    name: "",
    slug: "",
    parentId: "",
    termId: "",

    useClassPeriod: false,
    startDate: "",
    endDate: "",

    useRegistrationWindow: false,
    regOpenDate: "",
    regCloseDate: "",

    quotaTotal: "",
    isActive: true,
  });

  /* seed form saat edit */
  useEffect(() => {
    if (!isEdit) return;
    if (!resolvedClass) return;

    const start = resolvedClass.class_start_date
      ? resolvedClass.class_start_date.slice(0, 10)
      : "";
    const end = resolvedClass.class_end_date
      ? resolvedClass.class_end_date.slice(0, 10)
      : "";
    const regOpen = resolvedClass.class_registration_opens_at
      ? resolvedClass.class_registration_opens_at.slice(0, 10)
      : "";
    const regClose = resolvedClass.class_registration_closes_at
      ? resolvedClass.class_registration_closes_at.slice(0, 10)
      : "";

    setForm({
      name:
        resolvedClass.class_name ||
        resolvedClass.class_class_parent_name_cache ||
        "",
      slug: resolvedClass.class_slug || "",
      parentId: resolvedClass.class_class_parent_id || "",
      termId: resolvedClass.class_academic_term_id || "",

      useClassPeriod: Boolean(start || end),
      startDate: start,
      endDate: end,

      useRegistrationWindow: Boolean(regOpen || regClose),
      regOpenDate: regOpen,
      regCloseDate: regClose,

      quotaTotal:
        resolvedClass.class_quota_total != null
          ? String(resolvedClass.class_quota_total)
          : "",
      isActive: resolvedClass.class_status === "active",
    });
  }, [isEdit, resolvedClass]);

  const handleChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
    };

  /* ===== UI validation ===== */
  const classPeriodError = useMemo(() => {
    if (!form.useClassPeriod) return "";
    const s = form.startDate;
    const e = form.endDate;

    // kalau dua2 kosong → biarin (opsional), tapi kasih warning nanti
    if (!s || !e) return "";

    if (!isValidDateStr(s) || !isValidDateStr(e))
      return "Format tanggal tidak valid.";
    if (isAfter(s, e))
      return "Tanggal mulai tidak boleh lebih besar dari tanggal selesai.";
    return "";
  }, [form.useClassPeriod, form.startDate, form.endDate]);

  const regWindowError = useMemo(() => {
    if (!form.useRegistrationWindow) return "";
    const o = form.regOpenDate;
    const c = form.regCloseDate;
    if (!o || !c) return "";
    if (!isValidDateStr(o) || !isValidDateStr(c))
      return "Format tanggal tidak valid.";
    if (isAfter(o, c))
      return "Tanggal buka pendaftaran tidak boleh lebih besar dari tanggal tutup.";
    return "";
  }, [form.useRegistrationWindow, form.regOpenDate, form.regCloseDate]);

  const quotaError = useMemo(() => {
    if (!form.quotaTotal) return "";
    const n = Number(form.quotaTotal);
    if (Number.isNaN(n)) return "Kuota harus berupa angka.";
    if (n < 0) return "Kuota tidak boleh negatif.";
    return "";
  }, [form.quotaTotal]);

  const warningClassPeriodEmpty =
    form.useClassPeriod && !form.startDate && !form.endDate
      ? "Periode aktif, tapi tanggal mulai/selesai masih kosong."
      : "";

  const warningRegWindowEmpty =
    form.useRegistrationWindow && !form.regOpenDate && !form.regCloseDate
      ? "Jadwal pendaftaran aktif, tapi tanggal buka/tutup masih kosong."
      : "";

  const canSubmit =
    !!form.name.trim() &&
    !!form.parentId &&
    !!schoolId &&
    !quotaError &&
    !classPeriodError &&
    !regWindowError;

  /* ===== Mutations ===== */
  const createMut = useCreateClass(schoolId);
  const updateMut = useUpdateClass(schoolId, classId ?? null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !schoolId) return;

    const payload: any = {
      class_class_parent_id: form.parentId,
      class_name: form.name.trim(),
      class_slug: form.slug.trim() || toSlug(form.name),
      class_academic_term_id: form.termId || null,

      class_start_date: form.useClassPeriod
        ? toDateOrNull(form.startDate)
        : null,
      class_end_date: form.useClassPeriod ? toDateOrNull(form.endDate) : null,

      class_registration_opens_at: form.useRegistrationWindow
        ? toTsOrNull(form.regOpenDate)
        : null,
      class_registration_closes_at: form.useRegistrationWindow
        ? toTsOrNull(form.regCloseDate)
        : null,

      class_quota_total: form.quotaTotal ? Number(form.quotaTotal) : null,

      class_status: form.isActive ? "active" : "inactive",
      class_is_active: form.isActive, // backward compat (opsional)
    };

    try {
      if (isEdit) {
        await updateMut.mutateAsync(payload);
      } else {
        await createMut.mutateAsync(payload);
      }
      navigate("/sekolah/kelas/daftar-kelas");
    } catch (err: any) {
      alert(extractErrorMessage(err));
    }
  };

  const loading =
    (!resolvedClass && isEdit && classDetailQ.isLoading) ||
    parentsQ.isLoading ||
    termsQ.isLoading ||
    createMut.isPending ||
    updateMut.isPending;

  const hasErrorLoad =
    isEdit && classDetailQ.isError
      ? classDetailQ.error
      : parentsQ.error || termsQ.error;

  /* ================= Render ================= */
  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-4 lg:gap-6">
          {/* Header back + title */}
          <div className="md:flex hidden items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              onClick={handleBack}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="font-semibold text-lg md:text-xl">
                {isEdit ? "Edit Kelas" : "Tambah Kelas"}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Atur informasi dasar kelas, periode, dan pendaftaran.
              </p>
            </div>
          </div>

          {/* Error load */}
          {hasErrorLoad && (
            <Card>
              <CardContent className="p-4 flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5" size={16} />
                <div>
                  Gagal memuat data awal.{" "}
                  <span className="block text-xs mt-1 opacity-80">
                    {extractErrorMessage(hasErrorLoad)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form */}
          <Card>
            <CardContent className="p-5">
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* =========================
                    SECTION: Info Kelas
                ========================= */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-semibold">Info Kelas</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Data identitas dan keterkaitan kelas.
                    </p>
                  </div>

                  {/* Basic info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Nama Kelas *</Label>
                      <Input
                        value={form.name}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            name: e.target.value,
                            slug: f.slug || toSlug(e.target.value),
                          }))
                        }
                        placeholder="Contoh: Kelas 7A"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Nama yang akan tampil di daftar kelas.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Slug (opsional)</Label>
                      <Input
                        value={form.slug}
                        onChange={handleChange("slug")}
                        placeholder="kelas-7a"
                      />
                      <p className="text-xs text-muted-foreground">
                        Kosongkan jika ingin dibuat otomatis dari nama.
                      </p>
                    </div>
                  </div>

                  {/* Parent & term */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Tingkat / Level *</Label>
                      <Select
                        value={form.parentId}
                        onValueChange={(v) =>
                          setForm((f) => ({ ...f, parentId: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tingkat" />
                        </SelectTrigger>
                        <SelectContent>
                          {(parentsQ.data ?? []).map((p) => (
                            <SelectItem
                              key={p.class_parent_id}
                              value={p.class_parent_id}
                            >
                              {p.class_parent_name}
                              {p.class_parent_level != null
                                ? ` (Level ${p.class_parent_level})`
                                : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Periode Akademik</Label>
                      <Select
                        value={form.termId}
                        onValueChange={(v) =>
                          setForm((f) => ({ ...f, termId: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Opsional" />
                        </SelectTrigger>
                        <SelectContent>
                          {(termsQ.data ?? []).map((t) => (
                            <SelectItem
                              key={t.academic_term_id}
                              value={t.academic_term_id}
                            >
                              {t.academic_term_academic_year} —{" "}
                              {t.academic_term_name}
                              {!t.academic_term_is_active ? " (nonaktif)" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Quota & status */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Kuota Total (opsional)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={form.quotaTotal}
                        onChange={handleChange("quotaTotal")}
                        placeholder="Misal: 30"
                      />
                      {quotaError ? (
                        <p className="text-xs text-destructive">{quotaError}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Biarkan kosong jika tidak dibatasi.
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5 flex flex-col justify-end">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="is-active"
                          checked={form.isActive}
                          onCheckedChange={(v) =>
                            setForm((f) => ({
                              ...f,
                              isActive: Boolean(v),
                            }))
                          }
                        />
                        <Label htmlFor="is-active">Kelas aktif</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Nonaktifkan jika kelas sudah tidak digunakan.
                      </p>
                    </div>
                  </div>
                </div>

                {/* =========================
                    SECTION: Periode Kelas
                ========================= */}
                <div className="space-y-4 pt-2 border-t">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold">Periode Kelas</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Opsional. Untuk kelas yang punya tanggal mulai &
                        selesai.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="use-class-period"
                        checked={form.useClassPeriod}
                        onCheckedChange={(v) => {
                          const on = Boolean(v);
                          setForm((f) => ({
                            ...f,
                            useClassPeriod: on,
                            ...(on ? {} : { startDate: "", endDate: "" }),
                          }));
                        }}
                      />
                      <Label
                        className="text-xs cursor-pointer select-none"
                        htmlFor="use-class-period"
                      >
                        Pakai periode
                      </Label>
                    </div>
                  </div>

                  {warningClassPeriodEmpty && (
                    <p className="text-xs text-muted-foreground">
                      {warningClassPeriodEmpty}
                    </p>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Tanggal Mulai</Label>
                      <Input
                        type="date"
                        value={form.startDate}
                        disabled={!form.useClassPeriod}
                        onChange={handleChange("startDate")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tanggal Selesai</Label>
                      <Input
                        type="date"
                        value={form.endDate}
                        disabled={!form.useClassPeriod}
                        onChange={handleChange("endDate")}
                      />
                    </div>
                  </div>

                  {classPeriodError && (
                    <p className="text-xs text-destructive">
                      {classPeriodError}
                    </p>
                  )}
                </div>

                {/* =========================
                    SECTION: Pendaftaran
                ========================= */}
                <div className="space-y-4 pt-2 border-t">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold">Pendaftaran</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Opsional. Atur kapan pendaftaran dibuka & ditutup.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="use-reg-window"
                        checked={form.useRegistrationWindow}
                        onCheckedChange={(v) => {
                          const on = Boolean(v);
                          setForm((f) => ({
                            ...f,
                            useRegistrationWindow: on,
                            ...(on
                              ? {}
                              : { regOpenDate: "", regCloseDate: "" }),
                          }));
                        }}
                      />
                      <Label
                        className="text-xs cursor-pointer select-none"
                        htmlFor="use-reg-window"
                      >
                        Atur jadwal
                      </Label>
                    </div>
                  </div>

                  {warningRegWindowEmpty && (
                    <p className="text-xs text-muted-foreground">
                      {warningRegWindowEmpty}
                    </p>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Pendaftaran Dibuka</Label>
                      <Input
                        type="date"
                        value={form.regOpenDate}
                        disabled={!form.useRegistrationWindow}
                        onChange={handleChange("regOpenDate")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Pendaftaran Ditutup</Label>
                      <Input
                        type="date"
                        value={form.regCloseDate}
                        disabled={!form.useRegistrationWindow}
                        onChange={handleChange("regCloseDate")}
                      />
                    </div>
                  </div>

                  {regWindowError && (
                    <p className="text-xs text-destructive">{regWindowError}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-2">
                  <CActionsButton
                    onCancel={handleBack}
                    onSave={() => {}}
                    loadingSave={loading}
                    // kalau CActionsButton support disable:
                    // disabledSave={!canSubmit}
                  />
                </div>

                {/* hint kalau submit kepencet tapi invalid (biar kelihatan) */}
                {!canSubmit &&
                  (classPeriodError || regWindowError || quotaError) && (
                    <p className="text-xs text-destructive">
                      Periksa kembali input yang berwarna merah sebelum
                      menyimpan.
                    </p>
                  )}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SchoolClassForm;
