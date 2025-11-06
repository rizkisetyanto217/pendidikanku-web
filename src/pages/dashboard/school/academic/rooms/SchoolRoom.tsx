// src/pages/sekolahislamku/pages/classes/RoomSchool.tsx
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "@/lib/axios";
import {
  Building2,
  MapPin,
  Loader2,
  Eye,
  ArrowLeft,
  Edit3,
  Trash2,
  Plus,
  Info,
} from "lucide-react";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

/* ===================== CONFIG ===================== */
const USE_DUMMY = false;

/* ===================== TYPES (UI) ================= */
export type Room = {
  id: string;
  school_id?: string;
  name: string;
  capacity: number;
  location?: string | null;
  is_virtual?: boolean;
  is_active: boolean;
  platform?: string | null;
};

/* ================== API QUERY (public) ============ */
function usePublicRoomsQuery(
  schoolId: string,
  q: string,
  page: number,
  perPage: number
) {
  return useQuery({
    queryKey: ["public-rooms", schoolId, q, page, perPage],
    enabled: !!schoolId && !USE_DUMMY,
    staleTime: 60_000,
    retry: 1,
    queryFn: async () => {
      const res = await axios.get(`/public/${schoolId}/class-rooms/list`, {
        params: { q: q || undefined, page, per_page: perPage },
      });
      return res.data as {
        data: any[];
        pagination?: { total?: number; total_pages?: number };
      };
    },
  });
}

/* ===================== DIALOG FORM ======================= */
function RoomDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: Room | null;
  onSubmit: (form: {
    id?: string;
    name: string;
    capacity: number;
    location?: string;
    is_active: boolean;
  }) => Promise<void> | void;
  submitting?: boolean;
}) {
  const isEdit = Boolean(initial);
  const [name, setName] = useState(initial?.name ?? "");
  const [capacity, setCapacity] = useState<number>(initial?.capacity ?? 0);
  const [location, setLocation] = useState<string>(initial?.location ?? "");
  const [active, setActive] = useState<boolean>(initial?.is_active ?? true);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setCapacity(initial?.capacity ?? 0);
    setLocation(initial?.location ?? "");
    setActive(initial?.is_active ?? true);
  }, [open, initial?.id]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!submitting) onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Ruangan" : "Tambah Ruangan"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="room-name">Nama Ruangan *</Label>
            <Input
              id="room-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="cth. Lab Komputer"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="room-capacity">Kapasitas *</Label>
            <Input
              id="room-capacity"
              type="number"
              inputMode="numeric"
              value={Number.isFinite(capacity) ? capacity : 0}
              onChange={(e) => setCapacity(parseInt(e.target.value || "0", 10))}
              min={0}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="room-location">Lokasi</Label>
            <Input
              id="room-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Gedung A, Lt. 2 / Link Zoom"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="room-active"
              checked={active}
              onCheckedChange={(v) => setActive(Boolean(v))}
            />
            <Label htmlFor="room-active">Aktif</Label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button
            onClick={() =>
              onSubmit({
                id: initial?.id,
                name: name.trim(),
                capacity: Number.isFinite(capacity) ? capacity : 0,
                location: location.trim() || undefined,
                is_active: active,
              })
            }
            disabled={submitting || !name.trim()}
          >
            {submitting ? "Menyimpan…" : isEdit ? "Simpan" : "Tambah"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ===================== PAGE ======================= */
export default function SchoolRoom() {
  const { schoolId } = useParams<{ schoolId?: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  /* 🔎 Search sinkron ke URL (?q=), dengan debounce ringan */
  const [sp, setSp] = useSearchParams();
  const qUrl = sp.get("q") ?? "";
  const [q, setQ] = useState(qUrl);
  useEffect(() => setQ(qUrl), [qUrl]);
  useEffect(() => {
    const t = setTimeout(() => {
      const copy = new URLSearchParams(sp);
      if (q) copy.set("q", q);
      else copy.delete("q");
      setSp(copy, { replace: true });
      // reset ke halaman 1 kalau ganti query
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  /* ⏭ Pagination sederhana */
  const [page, setPage] = useState(() => Number(sp.get("page") ?? 1) || 1);
  const [perPage, setPerPage] = useState(
    () => Number(sp.get("per") ?? 10) || 10
  );
  useEffect(() => {
    const copy = new URLSearchParams(sp);
    copy.set("page", String(page));
    copy.set("per", String(perPage));
    setSp(copy, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage]);

  const roomsQ = usePublicRoomsQuery(schoolId ?? "", q, page, perPage);
  const data = roomsQ.data?.data ?? [];
  const total = roomsQ.data?.pagination?.total ?? 0;
  const totalPages = roomsQ.data?.pagination?.total_pages ?? 1;

  const rooms: Room[] = useMemo(
    () =>
      data.map((r: any) => ({
        id: r.class_room_id,
        school_id: r.class_room_school_id,
        name: r.class_room_name,
        capacity: r.class_room_capacity,
        location: r.class_room_location,
        is_virtual: r.class_room_is_virtual,
        is_active: r.class_room_is_active,
        platform: r.class_room_platform,
      })),
    [data]
  );

  // ====== Modal Tambah/Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<Room | null>(null);
  const closeModal = () => {
    setModalOpen(false);
    setModalInitial(null);
  };

  // ====== Create / Update
  const createOrUpdate = useMutation({
    mutationFn: async (form: {
      id?: string;
      name: string;
      capacity: number;
      location?: string;
      is_active: boolean;
    }) => {
      const payload = {
        room_name: form.name,
        room_capacity: form.capacity,
        room_location: form.location ?? null,
        room_is_active: form.is_active,
      };
      if (form.id) {
        await axios.put(`/a/${schoolId}/class-rooms/${form.id}`, payload);
      } else {
        await axios.post(`/a/${schoolId}/class-rooms`, payload);
      }
    },
    onSuccess: async () => {
      closeModal();
      await qc.invalidateQueries({
        queryKey: ["public-rooms", schoolId, q, page, perPage],
      });
    },
  });

  // ====== Delete
  const delRoom = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/a/${schoolId}/class-rooms/${id}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["public-rooms", schoolId, q, page, perPage],
      });
    },
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);

  /* ====== Layout ====== */
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {/* ===== Header ===== */}
      <div className="p-4 md:p-5 pb-3 flex flex-wrap items-center gap-3">
        <div className="hidden md:flex items-center gap-2 font-semibold">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </Button>
          <h1>Daftar Ruangan</h1>
        </div>

        {/* Search */}
        <div className="w-full md:flex-1 md:min-w-0">
          <div className="relative">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama atau lokasi ruangan…"
              className="pl-3"
            />
          </div>
        </div>

        {/* Per halaman + Tambah */}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="perpage" className="text-sm text-muted-foreground">
              Per halaman
            </Label>
            <select
              id="perpage"
              className="h-9 rounded-md border bg-background px-2 text-sm"
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              {[10, 20, 50, 100, 200].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <Button
            size="sm"
            className="gap-1"
            onClick={() => {
              setModalInitial(null);
              setModalOpen(true);
            }}
          >
            <Plus size={16} /> Tambah
          </Button>
        </div>
      </div>

      {/* ===== Content ===== */}
      <main className="w-full">
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-6 p-4">
          <Card>
            <CardHeader className="py-3 flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold inline-flex items-center gap-2">
                <Building2 size={18} /> Ruangan Sekolah
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {roomsQ.isFetching ? "memuat…" : `${total} total`}
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-4 md:p-5">
              {roomsQ.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="animate-spin" size={16} /> Memuat ruangan…
                </div>
              ) : rooms.length === 0 ? (
                <div className="rounded-md border p-4 text-sm text-muted-foreground inline-flex items-center gap-2">
                  <Info size={16} /> Belum ada ruangan.
                </div>
              ) : (
                <>
                  {/* Mobile Cards */}
                  <div className="grid grid-cols-1 gap-3 md:hidden">
                    {rooms.map((r) => (
                      <Card key={r.id} className="overflow-hidden">
                        <CardContent className="p-4 flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold">{r.name}</div>
                              <div className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                                <MapPin size={14} /> {r.location ?? "-"}
                              </div>
                            </div>
                            <Badge
                              variant={r.is_active ? "default" : "outline"}
                            >
                              {r.is_active ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Kapasitas: {r.capacity} •{" "}
                            {r.is_virtual ? "Virtual" : "Fisik"}
                          </div>
                          <div className="pt-1 flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`./${r.id}`)}
                            >
                              <Eye size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setModalInitial(r);
                                setModalOpen(true);
                              }}
                            >
                              <Edit3 size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setDeleteTarget(r);
                                setConfirmOpen(true);
                              }}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Ruangan</TableHead>
                          <TableHead className="w-[120px]">Kapasitas</TableHead>
                          <TableHead className="w-[120px]">Jenis</TableHead>
                          <TableHead className="w-[160px]">Platform</TableHead>
                          <TableHead className="w-[120px]">Status</TableHead>
                          <TableHead className="w-[200px] text-right">
                            Aksi
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rooms.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell>
                              <div className="font-medium">{r.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                <MapPin size={12} /> {r.location ?? "-"}
                              </div>
                            </TableCell>
                            <TableCell>{r.capacity}</TableCell>
                            <TableCell>
                              {r.is_virtual ? "Virtual" : "Fisik"}
                            </TableCell>
                            <TableCell>{r.platform ?? "-"}</TableCell>
                            <TableCell>
                              <Badge
                                variant={r.is_active ? "default" : "outline"}
                              >
                                {r.is_active ? "Aktif" : "Nonaktif"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`./${r.id}`)}
                                >
                                  <Eye size={16} />
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setModalInitial(r);
                                    setModalOpen(true);
                                  }}
                                >
                                  <Edit3 size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setDeleteTarget(r);
                                    setConfirmOpen(true);
                                  }}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-sm text-muted-foreground">
                      {rooms.length
                        ? `${(page - 1) * perPage + 1}-${Math.min(
                            page * perPage,
                            total
                          )} dari ${total}`
                        : `0 dari ${total}`}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                      >
                        Sebelumnya
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page >= totalPages}
                      >
                        Berikutnya
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Dialog Tambah/Edit */}
      <RoomDialog
        open={modalOpen}
        onOpenChange={(v) => (v ? setModalOpen(true) : closeModal())}
        initial={modalInitial}
        submitting={createOrUpdate.isPending}
        onSubmit={async (form) => {
          await createOrUpdate.mutateAsync(form);
        }}
      />

      {/* AlertDialog Konfirmasi Hapus */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Ruangan?</AlertDialogTitle>
            <AlertDialogDescription>
              Data ruangan "{deleteTarget?.name}" akan dihapus permanen.
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={delRoom.isPending}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && delRoom.mutate(deleteTarget.id)}
              disabled={delRoom.isPending}
            >
              {delRoom.isPending ? "Menghapus…" : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
