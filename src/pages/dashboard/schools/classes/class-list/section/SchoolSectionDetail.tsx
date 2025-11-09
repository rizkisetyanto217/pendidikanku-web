// src/pages/pendidikanku-dashboard/dashboard-school/class/detail/SchoolSectionDetail.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

import {
  ArrowLeft,
  Pencil,
  Trash2,
  MapPin,
  Link as LinkIcon,
  Check,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

/* ================= Types (tanpa csst include) ================= */
type ApiSchedule = {
  start?: string;
  end?: string;
  days?: string[];
  location?: string;
};

type RoomSnap = {
  code?: string | null;
  name?: string | null;
  slug?: string | null;
  capacity?: number | null;
  location?: string | null;
  is_virtual?: boolean | null;
};

type TermSnap = {
  name?: string | null;
  slug?: string | null;
  year_label?: string | null;
};

type ApiSection = {
  class_section_id: string;
  class_section_school_id: string;
  class_section_class_id: string;

  class_section_slug: string;
  class_section_name: string;
  class_section_code?: string | null;

  class_section_schedule?: ApiSchedule | null;

  class_section_capacity?: number | null;
  class_section_total_students?: number | null;

  class_section_group_url?: string | null;

  class_section_is_active: boolean;
  class_section_created_at: string;
  class_section_updated_at: string;

  // snapshots ringkas
  class_section_parent_name_snap?: string | null;
  class_section_parent_code_snap?: string | null;
  class_section_parent_slug_snap?: string | null;
  class_section_parent_level_snap?: string | number | null;

  class_section_room_name_snap?: string | null;
  class_section_room_location_snap?: string | null;

  class_section_term_name_snap?: string | null;
  class_section_term_slug_snap?: string | null;
  class_section_term_year_label_snap?: string | null;

  class_section_room_snapshot?: RoomSnap | null;
  class_section_term_snapshot?: TermSnap | null;
};

type ApiSectionList = {
  data: ApiSection[];
  pagination?: unknown;
};

/* ================= Helpers ================= */
const scheduleText = (s?: ApiSchedule | null) => {
  if (!s) return "-";
  const days = (s.days ?? []).join(", ");
  const time =
    s.start && s.end ? `${s.start}–${s.end}` : s.start || s.end || "";
  const loc = s.location ? ` @${s.location}` : "";
  const left = [days, time].filter(Boolean).join(" ");
  return left ? `${left}${loc}` : "-";
};

/* ================= Fetcher: hanya section (tanpa csst) ================= */
async function fetchSectionOnly(
  schoolId: string,
  id: string
): Promise<ApiSection | null> {
  const r = await axios.get<ApiSectionList>(
    `/public/${schoolId}/class-sections/list`,
    { params: { id } }
  );
  return r.data?.data?.[0] ?? null;
}

/* ================= Edit Modal (shadcn Dialog) ================= */
function EditSectionModal({
  open,
  onOpenChange,
  data,
  onSubmit,
  loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: ApiSection;
  onSubmit: (payload: any) => void;
  loading?: boolean;
}) {
  const [name, setName] = useState(data.class_section_name ?? "");
  const [code, setCode] = useState(data.class_section_code ?? "");
  const [capacity, setCapacity] = useState<number | undefined>(
    data.class_section_capacity ?? undefined
  );
  const [groupUrl, setGroupUrl] = useState(data.class_section_group_url ?? "");
  const [start, setStart] = useState(data.class_section_schedule?.start ?? "");
  const [end, setEnd] = useState(data.class_section_schedule?.end ?? "");
  const [location, setLocation] = useState(
    data.class_section_schedule?.location ?? ""
  );
  const [days, setDays] = useState<string[]>(
    data.class_section_schedule?.days ?? []
  );
  const [active, setActive] = useState<boolean>(data.class_section_is_active);

  const toggleDay = (d: string) =>
    setDays((old) =>
      old.includes(d) ? old.filter((x) => x !== d) : [...old, d]
    );

  const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Ahad"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Section</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama section"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="code">Kode</Label>
              <Input
                id="code"
                value={code ?? ""}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Kode unik"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="capacity">Kapasitas</Label>
              <Input
                id="capacity"
                type="number"
                value={capacity ?? ""}
                onChange={(e) =>
                  setCapacity(
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
                placeholder="cth: 35"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="groupUrl">Link Grup (opsional)</Label>
              <Input
                id="groupUrl"
                value={groupUrl}
                onChange={(e) => setGroupUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-1">Jadwal</div>
            <div className="grid md:grid-cols-3 gap-3">
              <Input
                value={start}
                onChange={(e) => setStart(e.target.value)}
                placeholder="Mulai (07:30)"
              />
              <Input
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                placeholder="Selesai (09:00)"
              />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Lokasi (Gedung A, Lt.2)"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {DAYS.map((d) => {
                const isOn = days.includes(d);
                return (
                  <Button
                    key={d}
                    type="button"
                    variant={isOn ? "default" : "outline"}
                    onClick={() => toggleDay(d)}
                    className="h-8 rounded-lg"
                  >
                    {isOn ? <Check size={14} className="mr-1" /> : null}
                    {d}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="active"
              checked={active}
              onCheckedChange={(v) => setActive(Boolean(v))}
            />
            <Label htmlFor="active" className="text-sm">
              Aktif
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Batal
            </Button>
          </DialogClose>
          <Button
            onClick={() =>
              onSubmit({
                class_section_name: name,
                class_section_code: code || null,
                class_section_capacity: capacity ?? null,
                class_section_group_url: groupUrl || null,
                class_section_is_active: active,
                class_section_schedule: {
                  start: start || undefined,
                  end: end || undefined,
                  location: location || undefined,
                  days: days.length ? days : undefined,
                },
              })
            }
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ================= Page ================= */
export default function SchoolSectionDetail() {
  const { id = "", schoolId = "" } = useParams<{
    id: string;
    schoolId: string;
  }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // GET detail (tanpa csst)
  const { data: section, isLoading } = useQuery({
    queryKey: ["section-only", schoolId, id],
    enabled: !!schoolId && !!id,
    queryFn: () => fetchSectionOnly(schoolId, id),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  // PATCH
  const patchMut = useMutation({
    mutationFn: async (payload: any) => {
      const url = `/schools/${schoolId}/class-sections/${id}`;
      const r = await axios.patch(url, payload);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["section-only", schoolId, id] });
      setOpenEdit(false);
    },
  });

  // DELETE
  const deleteMut = useMutation({
    mutationFn: async () => {
      const url = `/schools/${schoolId}/class-sections/${id}`;
      const r = await axios.delete(url);
      return r.data;
    },
    onSuccess: () => {
      navigate(`/sekolah/${schoolId}/kelas`, { replace: true });
    },
  });

  const [openEdit, setOpenEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6 text-center text-muted-foreground bg-background">
        Memuat data...
      </div>
    );
  }

  if (!section) {
    return (
      <div className="p-6 text-center text-muted-foreground bg-background">
        Data section tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-6 p-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} className="mr-1" />
              </Button>
              <h1 className="text-lg font-semibold">Detail Section</h1>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant={
                  section.class_section_is_active ? "default" : "outline"
                }
                className={
                  section.class_section_is_active ? "bg-green-600" : ""
                }
              >
                {section.class_section_is_active ? "Aktif" : "Nonaktif"}
              </Badge>
              <Button variant="outline" onClick={() => setOpenEdit(true)}>
                <Pencil size={16} className="mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
                disabled={deleteMut.isPending}
              >
                <Trash2 size={16} className="mr-2" />
                {deleteMut.isPending ? "Menghapus..." : "Hapus"}
              </Button>
            </div>
          </div>

          {/* Ringkasan */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-sm text-muted-foreground">Nama</div>
                  <div className="font-semibold">
                    {section.class_section_name}
                  </div>
                  <div className="text-xs text-muted-foreground break-all">
                    slug: {section.class_section_slug}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-sm text-muted-foreground">Kode</div>
                  <div className="font-semibold">
                    {section.class_section_code ?? "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ID: {section.class_section_id}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-sm text-muted-foreground">
                    Tingkat / Parent
                  </div>
                  <div className="font-semibold">
                    {section.class_section_parent_name_snap ?? "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {section.class_section_parent_code_snap
                      ? `${section.class_section_parent_code_snap} · ${section.class_section_parent_slug_snap}`
                      : section.class_section_parent_slug_snap ?? "-"}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-sm text-muted-foreground">Ruang</div>
                  <div className="font-semibold">
                    {section.class_section_room_snapshot?.name ??
                      section.class_section_room_name_snap ??
                      "-"}
                  </div>
                  <div className="text-xs flex items-center gap-1 text-muted-foreground">
                    {section.class_section_room_snapshot?.is_virtual ? (
                      <LinkIcon size={12} />
                    ) : (
                      <MapPin size={12} />
                    )}
                    {section.class_section_room_snapshot?.location ??
                      section.class_section_room_location_snap ??
                      "-"}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-sm text-muted-foreground">
                    Tahun Ajaran / Term
                  </div>
                  <div className="font-semibold">
                    {section.class_section_term_snapshot?.name ??
                      section.class_section_term_name_snap ??
                      "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {section.class_section_term_snapshot?.slug ??
                      section.class_section_term_slug_snap ??
                      "-"}{" "}
                    ·{" "}
                    {section.class_section_term_snapshot?.year_label ??
                      section.class_section_term_year_label_snap ??
                      "-"}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-sm text-muted-foreground">Siswa</div>
                  <div className="font-semibold">
                    {section.class_section_total_students ?? 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Kapasitas: {section.class_section_capacity ?? "-"}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <div className="text-sm text-muted-foreground">Jadwal</div>
                <div className="font-medium">
                  {scheduleText(section.class_section_schedule)}
                </div>
                {!!section.class_section_group_url && (
                  <a
                    href={section.class_section_group_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs underline inline-flex items-center gap-1 mt-1 text-primary"
                  >
                    <LinkIcon size={12} />
                    Link Grup
                  </a>
                )}
              </div>

              <div className="pt-1 text-xs text-muted-foreground">
                Dibuat:{" "}
                {new Date(section.class_section_created_at).toLocaleString()} •
                Diperbarui:{" "}
                {new Date(section.class_section_updated_at).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal Edit */}
      <EditSectionModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        data={section}
        loading={patchMut.isPending}
        onSubmit={(payload) => patchMut.mutate(payload)}
      />

      {/* Konfirmasi Delete */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus section ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan tidak dapat dibatalkan. Data section akan dihapus
              permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:opacity-90"
              onClick={() => deleteMut.mutate()}
            >
              {deleteMut.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
