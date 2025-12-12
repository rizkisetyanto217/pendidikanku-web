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
  class_parent_id: string;
  class_slug: string;
  class_name: string;
  class_start_date?: string | null;
  class_end_date?: string | null;
  class_term_id?: string | null;
  class_registration_opens_at?: string | null;
  class_registration_closes_at?: string | null;
  class_quota_total?: number | null;
  class_quota_taken?: number | null;
  class_status: ClassStatus;
  class_image_url?: string | null;
  class_parent_code_snapshot?: string | null;
  class_parent_name_snapshot?: string | null;
  class_parent_slug_snapshot?: string | null;
  class_parent_level_snapshot?: number | null;
  class_term_academic_year_snapshot?: string | null;
  class_term_name_snapshot?: string | null;
  class_term_slug_snapshot?: string | null;
  class_term_angkatan_snapshot?: string | null;
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

type TermsListResp = {
  data: TermItem[];
};

type FormState = {
  name: string;
  slug: string;
  parentId: string;
  termId: string;
  startDate: string;
  endDate: string;
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

const toIsoOrEmpty = (v: string) => {
  if (!v) return null;
  // backend biasanya oke dengan "YYYY-MM-DD" langsung,
  // tapi kalau mau dipaksa ISO:
  return `${v}T00:00:00Z`;
};

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
        {
          params: { page: 1, per_page: 200 },
        }
      );
      return res.data?.data ?? [];
    },
  });

  /* ===== Detail kelas (untuk edit) ===== */
  const classDetailQ = useQuery({
    queryKey: ["class-detail", schoolId, classId],
    enabled: !!schoolId && !!classId,
    queryFn: async (): Promise<ApiClass> => {
      // pakai list public, lalu filter by id
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
    startDate: "",
    endDate: "",
    regOpenDate: "",
    regCloseDate: "",
    quotaTotal: "",
    isActive: true,
  });

  /* seed form saat edit atau saat data ready */
  useEffect(() => {
    if (!isEdit) return;
    if (!resolvedClass) return;

    setForm({
      name:
        resolvedClass.class_name ||
        resolvedClass.class_parent_name_snapshot ||
        "",
      slug: resolvedClass.class_slug || "",
      parentId: resolvedClass.class_parent_id || "",
      termId: resolvedClass.class_term_id || "",
      startDate: resolvedClass.class_start_date
        ? resolvedClass.class_start_date.slice(0, 10)
        : "",
      endDate: resolvedClass.class_end_date
        ? resolvedClass.class_end_date.slice(0, 10)
        : "",
      regOpenDate: resolvedClass.class_registration_opens_at
        ? resolvedClass.class_registration_opens_at.slice(0, 10)
        : "",
      regCloseDate: resolvedClass.class_registration_closes_at
        ? resolvedClass.class_registration_closes_at.slice(0, 10)
        : "",
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

  const canSubmit =
    !!form.name.trim() &&
    !!form.parentId &&
    !!schoolId &&
    (!form.quotaTotal || Number(form.quotaTotal) >= 0);

  /* ===== Mutations ===== */
  const createMut = useCreateClass(schoolId);
  const updateMut = useUpdateClass(schoolId, classId ?? null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !schoolId) return;

    const payload: any = {
      class_parent_id: form.parentId,
      class_name: form.name.trim(),
      class_slug: form.slug.trim() || toSlug(form.name),
      class_term_id: form.termId || null,
      class_start_date: toIsoOrEmpty(form.startDate),
      class_end_date: toIsoOrEmpty(form.endDate),
      class_registration_opens_at: toIsoOrEmpty(form.regOpenDate),
      class_registration_closes_at: toIsoOrEmpty(form.regCloseDate),
      class_quota_total: form.quotaTotal ? Number(form.quotaTotal) : null,
      class_is_active: form.isActive,
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
              onClick={handleBack}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="font-semibold text-lg md:text-xl">
                {isEdit ? "Edit Kelas" : "Tambah Kelas"}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Atur informasi dasar kelas dan keterkaitannya.
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
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
                      }>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tingkat" />
                      </SelectTrigger>
                      <SelectContent>
                        {(parentsQ.data ?? []).map((p) => (
                          <SelectItem
                            key={p.class_parent_id}
                            value={p.class_parent_id}>
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
                      }>
                      <SelectTrigger>
                        <SelectValue placeholder="Opsional" />
                      </SelectTrigger>
                      <SelectContent>
                        {(termsQ.data ?? []).map((t) => (
                          <SelectItem
                            key={t.academic_term_id}
                            value={t.academic_term_id}>
                            {t.academic_term_academic_year} —{" "}
                            {t.academic_term_name}
                            {!t.academic_term_is_active ? " (nonaktif)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Tanggal Mulai (opsional)</Label>
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={handleChange("startDate")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tanggal Selesai (opsional)</Label>
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={handleChange("endDate")}
                    />
                  </div>
                </div>

                {/* Registration window */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Pendaftaran Dibuka (opsional)</Label>
                    <Input
                      type="date"
                      value={form.regOpenDate}
                      onChange={handleChange("regOpenDate")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Pendaftaran Ditutup (opsional)</Label>
                    <Input
                      type="date"
                      value={form.regCloseDate}
                      onChange={handleChange("regCloseDate")}
                    />
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
                    <p className="text-xs text-muted-foreground">
                      Biarkan kosong jika tidak dibatasi.
                    </p>
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

                {/* Actions */}
                <div className="flex justify-end pt-2">
                  <CActionsButton
                    onCancel={handleBack}
                    onSave={() => {}}
                    loadingSave={loading}
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SchoolClassForm;
