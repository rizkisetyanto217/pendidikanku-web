// src/pages/sekolahislamku/pages/classes/RoomSchool.tsx
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "@/lib/axios";
import {
  MapPin,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Info,
  Loader2,
} from "lucide-react";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/* ✅ DataTable (gaya Academic) */
import {
  CDataTable as DataTable,
  type ColumnDef,
  type ViewMode,
} from "@/components/costum/table/CDataTable";

/* ===================== TYPES ===================== */
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

/* ===================== API QUERY ===================== */
function usePublicRoomsQuery(
  schoolId: string,
  q: string,
  page: number,
  perPage: number
) {
  return useQuery({
    queryKey: ["public-rooms", schoolId, q, page, perPage],
    enabled: !!schoolId,
    staleTime: 60_000,
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

/* ===================== DIALOG FORM ===================== */
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
    <Dialog open={open} onOpenChange={(v) => !submitting && onOpenChange(v)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Ruangan" : "Tambah Ruangan"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Nama Ruangan *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="cth. Lab Komputer"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Kapasitas *</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={Number.isFinite(capacity) ? capacity : 0}
              onChange={(e) => setCapacity(parseInt(e.target.value || "0", 10))}
              min={0}
            />
          </div>

          <div className="grid gap-2">
            <Label>Lokasi</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Gedung A, Lt. 2 / Link Zoom"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="room-active"
              type="checkbox"
              className="h-4 w-4 rounded border"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            <Label htmlFor="room-active">Aktif</Label>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
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

/* ===================== ACTIONS MENU ===================== */
function ActionsMenu({
  onView,
  onEdit,
  onDelete,
}: {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Aksi">
          <MoreHorizontal size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onView} className="gap-2">
          <Eye size={14} /> Lihat
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit} className="gap-2">
          <Pencil size={14} /> Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 size={14} /> Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ===================== PAGE ===================== */
export default function SchoolRoom() {
  const { schoolId } = useParams<{ schoolId?: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  /* 🔍 Query (sinkron URL) */
  const [sp, setSp] = useSearchParams();
  const qUrl = sp.get("q") ?? "";
  const [q, setQ] = useState(qUrl);
  useEffect(() => setQ(qUrl), [qUrl]);
  const handleQueryChange = (val: string) => {
    setQ(val);
    const copy = new URLSearchParams(sp);
    if (val) copy.set("q", val);
    else copy.delete("q");
    copy.set("page", "1");
    setSp(copy, { replace: true });
  };

  /* Pagination server-side */
  const [page, setPage] = useState(() => Number(sp.get("page") ?? 1) || 1);
  const [perPage, setPerPage] = useState(
    () => Number(sp.get("per") ?? 20) || 20
  );
  useEffect(() => {
    const copy = new URLSearchParams(sp);
    copy.set("page", String(page));
    copy.set("per", String(perPage));
    setSp(copy, { replace: true });
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

  /* CRUD */
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
      await qc.invalidateQueries({
        queryKey: ["public-rooms", schoolId, q, page, perPage],
      });
    },
  });

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

  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<Room | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);

  /* Kolom tabel */
  const columns: ColumnDef<Room>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Nama Ruangan",
        align: "left",
        minW: "220px",
        cell: (r) => (
          <div className="text-left">
            <div className="font-medium">{r.name}</div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin size={12} /> {r.location ?? "-"}
            </div>
          </div>
        ),
      },
      {
        id: "capacity",
        header: "Kapasitas",
        align: "left",
        minW: "100px",
        cell: (r) => r.capacity,
      },
      {
        id: "jenis",
        header: "Jenis",
        align: "left",
        minW: "100px",
        cell: (r) => (r.is_virtual ? "Virtual" : "Fisik"),
      },
      {
        id: "platform",
        header: "Platform",
        align: "left",
        minW: "140px",
        cell: (r) => r.platform ?? "-",
      },
      {
        id: "status",
        header: "Status",
        align: "left",
        minW: "110px",
        cell: (r) => (
          <span
            className={[
              "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ring-1",
              r.is_active
                ? "bg-sky-500/15 text-sky-400 ring-sky-500/25"
                : "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20",
            ].join(" ")}
          >
            {r.is_active ? "Aktif" : "Nonaktif"}
          </span>
        ),
      },
    ],
    []
  );

  /* Stats Slot */
  const statsSlot = roomsQ.isLoading ? (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="animate-spin" size={16} /> Memuat ruangan…
    </div>
  ) : roomsQ.isError ? (
    <div className="rounded-xl border p-4 text-sm space-y-2">
      <div className="flex items-center gap-2">
        <Info size={16} /> Gagal memuat ruangan.
      </div>
      <Button size="sm" onClick={() => roomsQ.refetch()}>
        Coba lagi
      </Button>
    </div>
  ) : (
    <div className="text-sm text-muted-foreground">{total} total</div>
  );

  /* Layout */
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 lg:gap-6">
          <DataTable<Room>
            title="Daftar Ruangan"
            onBack={() => navigate(-1)}
            onAdd={() => {
              setModalInitial(null);
              setModalOpen(true);
            }}
            addLabel="Tambah"
            controlsPlacement="above"
            defaultQuery={q}
            onQueryChange={handleQueryChange}
            filterer={() => true}
            searchPlaceholder="Cari nama, lokasi, atau platform…"
            statsSlot={statsSlot}
            loading={roomsQ.isLoading}
            error={
              roomsQ.isError ? (roomsQ.error as any)?.message ?? "Error" : null
            }
            columns={columns}
            rows={rooms}
            getRowId={(r) => r.id}
            defaultAlign="left"
            stickyHeader
            zebra={false}
            viewModes={["table", "card"] as ViewMode[]}
            defaultView="table"
            storageKey={`rooms:${schoolId}`}
            onRowClick={(r) => navigate(`./${r.id}`)}
            renderActions={(r) => (
              <ActionsMenu
                onView={() => navigate(`./${r.id}`)}
                onEdit={() => {
                  setModalInitial(r);
                  setModalOpen(true);
                }}
                onDelete={() => {
                  setDeleteTarget(r);
                  setConfirmOpen(true);
                }}
              />
            )}
          />

          {/* Pagination */}
          <div className="mt-2 flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <div>
              {rooms.length
                ? `${(page - 1) * perPage + 1}-${Math.min(
                    page * perPage,
                    total
                  )} dari ${total}`
                : `0 dari ${total}`}
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Baris/hal</span>
              <Select
                value={String(perPage)}
                onValueChange={(v) => {
                  setPerPage(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[96px] text-sm">
                  <SelectValue placeholder={String(perPage)} />
                </SelectTrigger>
                <SelectContent align="end">
                  {[10, 20, 50, 100, 200].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      <RoomDialog
        open={modalOpen}
        onOpenChange={(v) => (v ? setModalOpen(true) : setModalOpen(false))}
        initial={modalInitial}
        submitting={createOrUpdate.isPending}
        onSubmit={async (form) => await createOrUpdate.mutateAsync(form)}
      />

      {/* Hapus Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Ruangan?</AlertDialogTitle>
            <AlertDialogDescription>
              Data ruangan "{deleteTarget?.name}" akan dihapus permanen dan
              tidak dapat dipulihkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={delRoom.isPending}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && delRoom.mutate(deleteTarget.id)}
              disabled={delRoom.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {delRoom.isPending ? "Menghapus…" : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
