// src/pages/pendidikanku-dashboard/dashboard-school/class/parent/SchoolParent.tsx
import  { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Layers, Loader2, Pencil, Trash2, Save } from "lucide-react";
import axios from "@/lib/axios";

/* ---------- shadcn/ui ---------- */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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

/* ===================== Types ===================== */
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

/* ===================== Fetcher ===================== */
async function fetchLevelDetail(schoolId: string, id: string) {
  const res = await axios.get<{ data: ApiLevelDetail[] }>(
    `/public/${schoolId}/class-parents/list`,
    { params: { id } }
  );
  return res.data.data?.[0];
}

/* ===================== Edit Dialog ===================== */
function LevelEditDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: Partial<ApiLevelDetail> | null;
  onSubmit: (payload: Partial<ApiLevelDetail>) => void;
  loading?: boolean;
}) {
  const [form, setForm] = useState<Partial<ApiLevelDetail>>({});

  useEffect(() => {
    if (!open) return;
    setForm({
      class_parent_name: initial?.class_parent_name ?? "",
      class_parent_code: initial?.class_parent_code ?? "",
      class_parent_slug: initial?.class_parent_slug ?? "",
      class_parent_description: initial?.class_parent_description ?? "",
      class_parent_level:
        initial?.class_parent_level === null ||
        initial?.class_parent_level === undefined
          ? undefined
          : initial?.class_parent_level,
      class_parent_is_active: Boolean(initial?.class_parent_is_active ?? true),
      class_parent_image_url: initial?.class_parent_image_url ?? "",
    });
  }, [open, initial?.class_parent_slug]);

  const set = <K extends keyof ApiLevelDetail>(k: K, v: any) =>
    setForm((s) => ({ ...s, [k]: v }));

  const canSubmit = Boolean(
    (form.class_parent_name ?? "").trim() &&
      (form.class_parent_slug ?? "").trim()
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !loading && onOpenChange(v)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Tingkat</DialogTitle>
          <DialogDescription>
            Perbarui informasi tingkat lalu simpan.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label className="text-sm">Nama Tingkat</Label>
            <Input
              value={form.class_parent_name ?? ""}
              onChange={(e) => set("class_parent_name", e.target.value)}
              placeholder="cth. Kelas X"
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm">Slug</Label>
            <Input
              value={form.class_parent_slug ?? ""}
              onChange={(e) => set("class_parent_slug", e.target.value)}
              placeholder="kelas-x"
            />
            <div className="text-xs text-muted-foreground">
              huruf kecil-dash, unik
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-sm">Kode</Label>
              <Input
                value={form.class_parent_code ?? ""}
                onChange={(e) => set("class_parent_code", e.target.value)}
                placeholder="opsional"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-sm">Level (angka)</Label>
              <Input
                type="number"
                value={
                  form.class_parent_level !== undefined &&
                  form.class_parent_level !== null
                    ? String(form.class_parent_level)
                    : ""
                }
                onChange={(e) =>
                  set(
                    "class_parent_level",
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-sm">Image URL</Label>
              <Input
                value={form.class_parent_image_url ?? ""}
                onChange={(e) => set("class_parent_image_url", e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-end justify-between gap-3 rounded-xl border p-3">
              <div>
                <Label className="text-xs text-muted-foreground block mb-1">
                  Status
                </Label>
                <div className="text-sm">
                  {form.class_parent_is_active ? "Aktif" : "Nonaktif"}
                </div>
              </div>
              <Switch
                checked={!!form.class_parent_is_active}
                onCheckedChange={(v) => set("class_parent_is_active", v)}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm">Deskripsi</Label>
            <Textarea
              value={form.class_parent_description ?? ""}
              onChange={(e) => set("class_parent_description", e.target.value)}
              className="min-h-[96px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={!!loading}
          >
            Batal
          </Button>
          <Button
            onClick={() => onSubmit(form)}
            disabled={!canSubmit || !!loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="ml-2">Simpan</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ===================== Page ===================== */
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

  const detailQ = useQuery({
    queryKey: ["level-detail", schoolId, levelId],
    enabled: !!schoolId && !!levelId,
    queryFn: () => fetchLevelDetail(schoolId!, levelId!),
  });

  /* ===== Edit & Delete state ===== */
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  /* ===== Mutations (pakai Dialog & AlertDialog, konsisten seperti RoomSchool) ===== */
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
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["level-detail", schoolId, levelId],
      });
      await qc.invalidateQueries({ queryKey: ["levels-public", schoolId] });
      setEditOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await axios.delete(DELETE_URL);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["levels-public", schoolId] });
      navigate(-1);
    },
  });

  const data = detailQ.data;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      {/* ===== Header (konsisten) ===== */}
      <div className="w-full px-4 md:px-6 pt-4">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              aria-label="Kembali"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <Layers className="h-5 w-5" /> Detail Tingkat
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setEditOpen(true)}
              disabled={detailQ.isLoading || detailQ.isError || !data}
            >
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(true)}
              disabled={deleteMutation.isPending || detailQ.isLoading || !data}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menghapus…
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" /> Hapus
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ===== Content ===== */}
      <main className="w-full px-4 md:px-6 py-4 md:py-6">
        <div className="mx-auto max-w-screen-2xl">
          <Card>
            <CardContent className="p-5">
              {detailQ.isLoading ? (
                <div className="flex items-center justify-center py-10 gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Memuat data…
                </div>
              ) : detailQ.isError || !data ? (
                <div className="py-10 text-center text-sm text-destructive">
                  Gagal memuat data tingkat.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="ID" value={data.class_parent_id} mono />
                  <Field
                    label="School ID"
                    value={data.class_parent_school_id}
                    mono
                  />
                  <Field label="Nama Tingkat" value={data.class_parent_name} />
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
                  <div className="md:col-span-2 rounded-xl border border-border p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      Deskripsi
                    </div>
                    <div>
                      {data.class_parent_description?.trim() ||
                        "(tidak ada deskripsi)"}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* ===== Edit Dialog (like RoomSchool) ===== */}
      <LevelEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={detailQ.data ?? null}
        loading={patchMutation.isPending}
        onSubmit={(payload) => patchMutation.mutate(payload)}
      />

      {/* ===== Delete Confirm ===== */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tingkat?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data tingkat akan dihapus
              permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Menghapus…" : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ===================== Small UI helpers ===================== */
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
