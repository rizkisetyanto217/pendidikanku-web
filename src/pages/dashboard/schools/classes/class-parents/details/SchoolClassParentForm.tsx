// src/pages/dashboard/school/class/SchoolClassParentForm.tsx
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios, { getActiveschoolId } from "@/lib/axios";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";

/* Layout header hook */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* ✅ Current user context (ambil school_id dari token) */
import { useCurrentUser } from "@/hooks/useCurrentUser";

/* ================= Types ================= */
type ApiClassParent = {
  class_parent_id: string;
  class_parent_school_id: string;
  class_parent_name: string;
  class_parent_code?: string | null;
  class_parent_slug: string;
  class_parent_description?: string | null;
  class_parent_level?: number | null;
  class_parent_is_active: boolean;
  class_parent_total_classes?: number | null;
  class_parent_image_url?: string | null;
  class_parent_created_at: string;
  class_parent_updated_at: string;
};

type LevelRow = {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  level?: string | null;
  description?: string | null;
  is_active: boolean;
};

/* ================= Helpers ================= */
const toSlug = (s: string) =>
  (s || "level-baru").toLowerCase().trim().replace(/\s+/g, "-");

function mapClassParentToRow(x: ApiClassParent): LevelRow {
  return {
    id: x.class_parent_id,
    name: x.class_parent_name,
    slug: x.class_parent_slug,
    code: x.class_parent_code ?? null,
    level: x.class_parent_level != null ? String(x.class_parent_level) : null,
    description: x.class_parent_description ?? null,
    is_active: x.class_parent_is_active,
  };
}

/* ================= API Fetch Detail (fallback kalau nggak ada state) ================= */
async function fetchClassParentDetail(
  schoolId: string,
  id: string
): Promise<LevelRow> {
  const resp = await axios.get<{ data: ApiClassParent[] }>(
    `/public/${schoolId}/class-parents/list`,
    { params: { per_page: 1000, page: 1 } }
  );
  const found = (resp.data?.data ?? []).find((x) => x.class_parent_id === id);
  if (!found) {
    throw new Error("Level tidak ditemukan");
  }
  return mapClassParentToRow(found);
}

/* ================= Form Component ================= */
const SchoolClassParentForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const location = useLocation();
  const stateLevel = (location.state as any)?.level as LevelRow | undefined;

  /* ✅ Ambil school_id dari token (simple-context) + fallback cookie */
  const { data: currentUser } = useCurrentUser();
  const schoolIdFromMembership = currentUser?.membership?.school_id ?? null;
  const schoolId = schoolIdFromMembership || getActiveschoolId() || null;

  /* ===== Header ===== */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: isEdit ? "Edit Level" : "Tambah Level",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas" },
        { label: "Level", href: "kelas/level" },
        { label: isEdit ? "Edit" : "Tambah" },
      ],
      showBack: true,
    });
  }, [setHeader, isEdit]);

  /* ===== Query detail (kalau edit & state kosong) ===== */
  const detailQEnabled = Boolean(isEdit && schoolId && !stateLevel);
  const detailQ = useQuery({
    queryKey: ["class-parent-detail", schoolId, id],
    enabled: detailQEnabled,
    queryFn: () => fetchClassParentDetail(schoolId as string, id as string),
  });

  const initialData: LevelRow | null = useMemo(() => {
    if (stateLevel) return stateLevel;
    if (detailQ.data) return detailQ.data;
    return null;
  }, [stateLevel, detailQ.data]);

  /* ===== Form state ===== */
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [code, setCode] = useState("");
  const [level, setLevel] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [touchedSlugManually, setTouchedSlugManually] = useState(false);

  // sync initialData -> form
  useEffect(() => {
    if (!initialData) {
      if (!isEdit) {
        // mode create default
        setName("");
        setSlug("");
        setCode("");
        setLevel("");
        setDescription("");
        setIsActive(true);
      }
      return;
    }
    setName(initialData.name ?? "");
    setSlug(initialData.slug ?? "");
    setCode(initialData.code ?? "");
    setLevel(initialData.level ?? "");
    setDescription(initialData.description ?? "");
    setIsActive(initialData.is_active);
  }, [initialData, isEdit]);

  // auto-generate slug from name if user belum edit slug manual
  useEffect(() => {
    if (!touchedSlugManually) {
      setSlug((prev) => {
        const next = toSlug(name);
        // kalau sebelumnya kosong atau sama dengan auto previous, bebas overwrite
        if (!prev || prev === toSlug("")) return next;
        return next;
      });
    }
  }, [name, touchedSlugManually]);

  const canSubmit = Boolean(name.trim()) && Boolean(schoolId);

  /* ===== Mutations (create/update) ===== */
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!schoolId) throw new Error("school_id tidak ditemukan");
      const payload: any = {
        class_parent_name: name.trim(),
        class_parent_slug: slug.trim() || toSlug(name),
        class_parent_is_active: isActive,
      };
      if (code.trim()) payload.class_parent_code = code.trim();
      if (description.trim())
        payload.class_parent_description = description.trim();
      if (level.trim()) payload.class_parent_level = Number(level);

      const { data } = await axios.post(
        `/a/${encodeURIComponent(schoolId)}/class-parents`,
        payload
      );
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!schoolId || !id) throw new Error("school_id atau id kosong");
      const payload: any = {
        class_parent_name: name.trim(),
        class_parent_slug: slug.trim() || toSlug(name),
        class_parent_is_active: isActive,
      };
      if (code.trim()) payload.class_parent_code = code.trim();
      if (description.trim())
        payload.class_parent_description = description.trim();
      if (level.trim()) payload.class_parent_level = Number(level);

      const { data } = await axios.patch(
        `/a/${encodeURIComponent(schoolId)}/class-parents/${id}`,
        payload
      );
      return data;
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      if (isEdit) {
        await updateMutation.mutateAsync();
      } else {
        await createMutation.mutateAsync();
      }
      // setelah sukses, balik ke list level
      navigate(-1);
    } catch {
      // error sudah di-handle di bawah (alert box kecil)
    }
  };

  const errorMessage =
    (createMutation.error as any)?.message ||
    (updateMutation.error as any)?.message ||
    (detailQ.error as any)?.message ||
    null;

  const loadingInitial = isEdit && !initialData && detailQ.isLoading;

  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-4 lg:gap-6">
          {/* Header kecil (back + title) */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hidden md:inline-flex"
            >
              <ArrowLeft size={18} />
            </Button>
            <div>
              <h1 className="font-semibold text-lg md:text-xl">
                {isEdit ? "Edit Level" : "Tambah Level"}
              </h1>
              <p className="text-xs text-muted-foreground">
                Atur jenjang/tingkat kelas di sekolah Anda.
              </p>
            </div>
          </div>

          {/* Loading state (edit) */}
          {loadingInitial && (
            <Card>
              <CardContent className="p-6 flex items-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin" size={16} />
                Memuat data level…
              </CardContent>
            </Card>
          )}

          {/* Error initial (kalau gagal fetch detail) */}
          {!loadingInitial && isEdit && !initialData && detailQ.isError && (
            <Card>
              <CardContent className="p-6 flex items-center gap-2 text-destructive">
                <AlertCircle size={16} />
                Gagal memuat detail level.
              </CardContent>
            </Card>
          )}

          {/* Form */}
          {!loadingInitial && (!isEdit || initialData) && (
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Nama Level *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: SMP, SMA, Tahfidz 1"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="code">Kode (opsional)</Label>
                      <Input
                        id="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Misal: SMP-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={slug}
                        onChange={(e) => {
                          setSlug(e.target.value);
                          setTouchedSlugManually(true);
                        }}
                        placeholder="slug-otomatis-dari-nama"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Dipakai di URL dan integrasi lain.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="level">Level (angka, opsional)</Label>
                      <Input
                        id="level"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        placeholder="Contoh: 7"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Bisa dipakai untuk urutan (misal 1=SD, 2=SMP, dst).
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="description">Deskripsi (opsional)</Label>
                    <Textarea
                      id="description"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Deskripsi singkat tentang level ini."
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Checkbox
                      id="is-active"
                      checked={isActive}
                      onCheckedChange={(v) => setIsActive(Boolean(v))}
                    />
                    <Label htmlFor="is-active">Aktif</Label>
                  </div>

                  {errorMessage && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/40 rounded-md px-3 py-2">
                      <AlertCircle size={14} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => navigate(-1)}
                      disabled={isSubmitting}
                    >
                      Batal
                    </Button>
                    <Button type="submit" disabled={!canSubmit || isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Menyimpan…
                        </>
                      ) : isEdit ? (
                        "Simpan Perubahan"
                      ) : (
                        "Simpan"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default SchoolClassParentForm;
