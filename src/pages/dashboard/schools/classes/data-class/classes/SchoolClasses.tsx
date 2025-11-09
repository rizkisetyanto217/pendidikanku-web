// src/pages/pendidikanku-dashboard/dashboard-school/class/classes/SchoolClasses.tsx
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  BookOpen,
  Pencil,
  Save,
  X,
  Trash2,
} from "lucide-react";
import axios from "@/lib/axios";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

/* ============== Types ============== */
type ApiClassDetail = {
  class_id: string;
  class_school_id: string;
  class_parent_id: string;
  class_slug: string;
  class_name: string;
  class_status: "active" | "inactive";
  class_parent_name_snapshot?: string | null;
  class_parent_slug_snapshot?: string | null;
  class_parent_level_snapshot?: number | null;
  class_term_name_snapshot?: string | null;
  class_term_academic_year_snapshot?: string | null;
  class_term_angkatan_snapshot?: string | null;
  class_created_at: string;
  class_updated_at: string;
  class_image_url?: string | null;
};

/* ============== Fetcher ============== */
async function fetchClassDetail(schoolId: string, id: string) {
  const res = await axios.get<{ data: ApiClassDetail[] }>(
    `/public/${schoolId}/classes/list`,
    { params: { id } }
  );
  return res.data.data?.[0];
}

/* ============== Page ============== */
export default function SchoolClassDetail() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { schoolId, classId } = useParams<{
    schoolId: string;
    classId: string;
  }>();

  const PATCH_URL = `/api/schools/${schoolId}/classes/${classId}`;
  const DELETE_URL = PATCH_URL;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["class-detail", schoolId, classId],
    enabled: !!schoolId && !!classId,
    queryFn: () => fetchClassDetail(schoolId!, classId!),
  });

  const [isEdit, setIsEdit] = React.useState(false);
  const [form, setForm] = React.useState<Partial<ApiClassDetail>>({});

  React.useEffect(() => {
    if (data) {
      setForm({
        class_name: data.class_name,
        class_slug: data.class_slug,
        class_status: data.class_status,
        class_image_url: data.class_image_url ?? "",
      });
    }
  }, [data]);

  const patchMutation = useMutation({
    mutationFn: async (payload: Partial<ApiClassDetail>) => {
      const body = {
        name: payload.class_name,
        slug: payload.class_slug,
        status: payload.class_status, // "active" | "inactive"
        image_url: payload.class_image_url || null,
      };
      const res = await axios.patch(PATCH_URL, body);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["class-detail", schoolId, classId] });
      qc.invalidateQueries({ queryKey: ["classes-public", schoolId] });
      setIsEdit(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await axios.delete(DELETE_URL);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["classes-public", schoolId] });
      navigate(-1);
    },
  });

  const onSave = () => patchMutation.mutate(form);
  const onDelete = () => {
    if (
      window.confirm("Hapus kelas ini? Tindakan ini tidak bisa dibatalkan.")
    ) {
      deleteMutation.mutate();
    }
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
              <BookOpen className="h-5 w-5" /> Detail Kelas
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
                        class_name: data.class_name,
                        class_slug: data.class_slug,
                        class_status: data.class_status,
                        class_image_url: data.class_image_url ?? "",
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
                Gagal memuat data kelas.
              </div>
            ) : (
              <div className="space-y-6">
                {!isEdit ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="ID" value={data.class_id} mono />
                    <Field
                      label="School ID"
                      value={data.class_school_id}
                      mono
                    />
                    <Field label="Nama Kelas" value={data.class_name} />
                    <Field label="Slug" value={data.class_slug} />
                    <Field
                      label="Status"
                      value={
                        data.class_status === "active" ? "Aktif" : "Nonaktif"
                      }
                    />
                    <Field
                      label="Tingkat"
                      value={data.class_parent_name_snapshot ?? "-"}
                    />
                    <Field
                      label="Level (angka)"
                      value={
                        data.class_parent_level_snapshot !== null &&
                        data.class_parent_level_snapshot !== undefined
                          ? String(data.class_parent_level_snapshot)
                          : "-"
                      }
                    />
                    <Field
                      label="Term"
                      value={
                        [
                          data.class_term_name_snapshot,
                          data.class_term_academic_year_snapshot,
                          data.class_term_angkatan_snapshot,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "-"
                      }
                    />
                    <Field
                      label="Image URL"
                      value={data.class_image_url ?? "-"}
                    />
                    <Field
                      label="Dibuat"
                      value={new Date(data.class_created_at).toLocaleString(
                        "id-ID"
                      )}
                    />
                    <Field
                      label="Diubah"
                      value={new Date(data.class_updated_at).toLocaleString(
                        "id-ID"
                      )}
                    />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                      label="Nama Kelas"
                      value={form.class_name ?? ""}
                      onChange={(v) =>
                        setForm((s) => ({ ...s, class_name: v }))
                      }
                    />
                    <InputField
                      label="Slug"
                      value={form.class_slug ?? ""}
                      onChange={(v) =>
                        setForm((s) => ({ ...s, class_slug: v }))
                      }
                      hint="huruf kecil-dash, unik"
                    />
                    <SelectField
                      label="Status"
                      value={form.class_status ?? "active"}
                      onChange={(v) =>
                        setForm((s) => ({
                          ...s,
                          class_status: v as "active" | "inactive",
                        }))
                      }
                      options={[
                        { label: "Aktif", value: "active" },
                        { label: "Nonaktif", value: "inactive" },
                      ]}
                    />
                    <InputField
                      label="Image URL"
                      value={form.class_image_url ?? ""}
                      onChange={(v) =>
                        setForm((s) => ({ ...s, class_image_url: v }))
                      }
                    />
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

/* ============== Small UI Helpers (shadcn) ============== */
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

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  const id = React.useId();
  return (
    <div className="rounded-xl border border-border p-3">
      <Label htmlFor={id} className="text-xs text-muted-foreground mb-1 block">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
