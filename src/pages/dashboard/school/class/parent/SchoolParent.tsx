// src/pages/pendidikanku-dashboard/dashboard-school/class/parent/SchoolParent.tsx
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Layers,
  Loader2,
  Pencil,
  Save,
  X,
  Trash2,
} from "lucide-react";
import axios from "@/lib/axios";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

/* ============== Types ============== */
type ApiLevelDetail = {
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

/* ============== Fetcher ============== */
async function fetchLevelDetail(schoolId: string, id: string) {
  const res = await axios.get<{ data: ApiLevelDetail[] }>(
    `/public/${schoolId}/class-parents/list`,
    { params: { id } }
  );
  return res.data.data?.[0];
}

/* ============== Component ============== */
export default function SchoolParent() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { schoolId, levelId } = useParams<{
    schoolId: string;
    levelId: string;
  }>();

  const PATCH_URL = useMemo(
    () => `/api/schools/${schoolId}/class-parents/${levelId}`,
    [schoolId, levelId]
  );
  const DELETE_URL = PATCH_URL;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["level-detail", schoolId, levelId],
    enabled: !!schoolId && !!levelId,
    queryFn: () => fetchLevelDetail(schoolId!, levelId!),
  });

  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState<Partial<ApiLevelDetail>>({});

  React.useEffect(() => {
    if (data) {
      setForm({
        class_parent_name: data.class_parent_name,
        class_parent_code: data.class_parent_code ?? "",
        class_parent_slug: data.class_parent_slug,
        class_parent_description: data.class_parent_description ?? "",
        class_parent_level: data.class_parent_level ?? undefined,
        class_parent_is_active: data.class_parent_is_active,
        class_parent_image_url: data.class_parent_image_url ?? "",
      });
    }
  }, [data]);

  // ========= Mutations =========
  const patchMutation = useMutation({
    mutationFn: async (payload: Partial<ApiLevelDetail>) => {
      const body = {
        name: payload.class_parent_name,
        code: payload.class_parent_code || null,
        slug: payload.class_parent_slug,
        description: payload.class_parent_description || null,
        level: payload.class_parent_level ?? null,
        is_active: payload.class_parent_is_active,
        image_url: payload.class_parent_image_url || null,
      };
      const res = await axios.patch(PATCH_URL, body);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["level-detail", schoolId, levelId] });
      qc.invalidateQueries({ queryKey: ["levels-public", schoolId] });
      setIsEdit(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await axios.delete(DELETE_URL);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["levels-public", schoolId] });
      navigate(-1);
    },
  });

  const onChange = (k: keyof ApiLevelDetail, v: any) =>
    setForm((s) => ({ ...s, [k]: v }));

  const onSave = () => patchMutation.mutate(form as ApiLevelDetail);

  const onDelete = () => {
    const ok = window.confirm(
      "Hapus tingkat ini? Tindakan ini tidak bisa dibatalkan."
    );
    if (!ok) return;
    deleteMutation.mutate();
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-background text-foreground">
      <div className="max-w-screen-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-3"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Layers className="h-5 w-5" /> Detail Tingkat
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {!isEdit ? (
              <>
                <Button
                  onClick={() => setIsEdit(true)}
                  disabled={isLoading || isError || !data}
                >
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={onDelete}
                  disabled={deleteMutation.isPending || isLoading || !data}
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Menghapus…
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={onSave} disabled={patchMutation.isPending}>
                  {patchMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Menyimpan…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEdit(false);
                    if (data) {
                      setForm({
                        class_parent_name: data.class_parent_name,
                        class_parent_code: data.class_parent_code ?? "",
                        class_parent_slug: data.class_parent_slug,
                        class_parent_description:
                          data.class_parent_description ?? "",
                        class_parent_level:
                          data.class_parent_level ?? undefined,
                        class_parent_is_active: data.class_parent_is_active,
                        class_parent_image_url:
                          data.class_parent_image_url ?? "",
                      });
                    }
                  }}
                >
                  <X className="h-4 w-4 mr-2" /> Batal
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Body */}
        <Card className="border border-border">
          <CardContent className="p-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Memuat data...
              </div>
            ) : isError || !data ? (
              <div className="py-10 text-center text-sm text-destructive">
                Gagal memuat data tingkat.
              </div>
            ) : (
              <div className="space-y-6">
                {!isEdit ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="ID" value={data.class_parent_id} mono />
                    <Field
                      label="School ID"
                      value={data.class_parent_school_id}
                      mono
                    />
                    <Field
                      label="Nama Tingkat"
                      value={data.class_parent_name}
                    />
                    <Field label="Slug" value={data.class_parent_slug} />
                    <Field label="Kode" value={data.class_parent_code ?? "-"} />
                    <Field
                      label="Level (angka)"
                      value={
                        typeof data.class_parent_level === "number"
                          ? String(data.class_parent_level)
                          : "-"
                      }
                    />
                    <Field
                      label="Status"
                      value={data.class_parent_is_active ? "Aktif" : "Nonaktif"}
                    />
                    <Field
                      label="Total Kelas"
                      value={String(data.class_parent_total_classes ?? 0)}
                    />
                    <Field
                      label="Image URL"
                      value={data.class_parent_image_url ?? "-"}
                    />
                    <Field
                      label="Dibuat"
                      value={new Date(
                        data.class_parent_created_at
                      ).toLocaleString("id-ID")}
                    />
                    <Field
                      label="Diubah"
                      value={new Date(
                        data.class_parent_updated_at
                      ).toLocaleString("id-ID")}
                    />
                    <div className="md:col-span-2">
                      <div className="text-xs text-muted-foreground mb-1">
                        Deskripsi
                      </div>
                      <div>
                        {data.class_parent_description?.trim() ||
                          "(tidak ada deskripsi)"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                      label="Nama Tingkat"
                      value={form.class_parent_name ?? ""}
                      onChange={(v) => onChange("class_parent_name", v)}
                    />
                    <InputField
                      label="Slug"
                      value={form.class_parent_slug ?? ""}
                      onChange={(v) => onChange("class_parent_slug", v)}
                      hint="huruf kecil-dash, unik"
                    />
                    <InputField
                      label="Kode"
                      value={form.class_parent_code ?? ""}
                      onChange={(v) => onChange("class_parent_code", v)}
                    />
                    <InputField
                      label="Level (angka)"
                      value={
                        form.class_parent_level !== undefined &&
                        form.class_parent_level !== null
                          ? String(form.class_parent_level)
                          : ""
                      }
                      onChange={(v) =>
                        onChange(
                          "class_parent_level",
                          v === "" ? null : Number(v)
                        )
                      }
                      type="number"
                    />
                    <ToggleField
                      label="Status Aktif"
                      checked={!!form.class_parent_is_active}
                      onChange={(checked) =>
                        onChange("class_parent_is_active", checked)
                      }
                    />
                    <InputField
                      label="Image URL"
                      value={form.class_parent_image_url ?? ""}
                      onChange={(v) => onChange("class_parent_image_url", v)}
                    />
                    <div className="md:col-span-2">
                      <TextareaField
                        label="Deskripsi"
                        value={form.class_parent_description ?? ""}
                        onChange={(v) =>
                          onChange("class_parent_description", v)
                        }
                        rows={4}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ============== Small UI helpers (shadcn) ============== */
function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | number | null;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={mono ? "font-mono text-sm break-all" : "font-medium"}>
        {value ?? "-"}
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
}) {
  const id = React.useId();
  return (
    <div className="rounded-xl border border-border p-3">
      <Label htmlFor={id} className="text-xs text-muted-foreground mb-1 block">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-background"
      />
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  const id = React.useId();
  return (
    <div className="rounded-xl border border-border p-3">
      <Label htmlFor={id} className="text-xs text-muted-foreground mb-1 block">
        {label}
      </Label>
      <Textarea
        id={id}
        className="resize-y bg-background"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = React.useId();
  return (
    <div className="rounded-xl border border-border p-3 flex items-center justify-between">
      <div>
        <Label
          htmlFor={id}
          className="text-xs text-muted-foreground mb-1 block"
        >
          {label}
        </Label>
        <div className="text-sm">{checked ? "Aktif" : "Nonaktif"}</div>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
