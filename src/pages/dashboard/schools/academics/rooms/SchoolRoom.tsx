// src/pages/sekolahislamku/pages/classes/RoomSchool.tsx
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios, { getActiveschoolId } from "@/lib/axios";
import {
  MapPin,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Info,
  Loader2,
  ArrowLeft,
} from "lucide-react";

/* ✅ Import untuk breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* ✅ Current user context (dari token + simple-context) */
import { useCurrentUser } from "@/hooks/useCurrentUser";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
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

/* ✅ DataTable (gaya Academic) */
import {
  CDataTable as DataTable,
  type ColumnDef,
  type ViewMode,
} from "@/components/costum/table/CDataTable";
import CBadgeStatus from "@/components/costum/common/CBadgeStatus";

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
  schoolId: string | null,
  q: string,
  page: number,
  perPage: number
) {
  return useQuery({
    queryKey: ["public-rooms", schoolId, q, page, perPage],
    enabled: !!schoolId,
    staleTime: 60_000,
    queryFn: async () => {
      if (!schoolId) {
        return { data: [], pagination: { total: 0, total_pages: 1 } };
      }

      const res = await axios.get(`/public/${schoolId}/class-rooms/list`, {
        params: { q: q || undefined, page, per_page: perPage },
      });
      console.log("[public-rooms] response", res.status, res.data);
      return res.data as {
        data: any[];
        pagination?: { total?: number; total_pages?: number };
      };
    },
  });
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
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function SchoolRoom({ showBack = false, backTo }: Props) {
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));
  const qc = useQueryClient();

  /* ✅ Breadcrumb */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Ruangan",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Akademik" },
        { label: "Ruangan" },
      ],
      showBack,
    });
  }, [setHeader, showBack]);

  /* ✅ Ambil school_id dari token/context */
  const currentUserQ = useCurrentUser();
  const activeMembership = currentUserQ.data?.membership ?? null;

  const schoolIdFromMembership = activeMembership?.school_id ?? null;
  const schoolId = schoolIdFromMembership || getActiveschoolId() || null;

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
  const [page] = useState(() => Number(sp.get("page") ?? 1) || 1);
  const [perPage] = useState(() => Number(sp.get("per") ?? 20) || 20);
  useEffect(() => {
    const copy = new URLSearchParams(sp);
    copy.set("page", String(page));
    copy.set("per", String(perPage));
    setSp(copy, { replace: true });
  }, [page, perPage, setSp, sp]);

  const roomsQ = usePublicRoomsQuery(schoolId, q, page, perPage);
  const data = roomsQ.data?.data ?? [];

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

  /* DELETE */
  const delRoom = useMutation({
    mutationFn: async (id: string) => {
      if (!schoolId) throw new Error("School ID tidak tersedia");
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

  /* Kolom tabel */
  const columns: ColumnDef<Room>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Nama Ruangan",
        minW: "220px",
        cell: (r) => (
          <div>
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
        minW: "100px",
        cell: (r) => r.capacity,
      },
      {
        id: "jenis",
        header: "Jenis",
        minW: "100px",
        cell: (r) => (r.is_virtual ? "Virtual" : "Fisik"),
      },
      {
        id: "platform",
        header: "Platform",
        minW: "140px",
        cell: (r) => r.platform ?? "-",
      },
      {
        id: "status",
        header: "Status",
        minW: "110px",
        cell: (r) => {
          let status: "active" | "inactive" | "pending" = "inactive";

          // Tentukan kondisi pending (silakan sesuaikan rule API kamu di sini)
          if (r.is_active === true) status = "active";
          else if (r.is_active === false && r.is_virtual === true) status = "pending";
          else status = "inactive";

          return <CBadgeStatus status={status} />;
        },
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
    <div />
  );

  /* Layout */
  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-4 lg:gap-6">
          {/* ✅ Header Back seperti SchoolClassSection */}
          <div className="md:flex hidden gap-3 items-center">
            {showBack && (
              <Button
                onClick={handleBack}
                variant="ghost"
                size="icon"
                className="cursor-pointer self-start"
              >
                <ArrowLeft size={20} />
              </Button>
            )}

            <h1 className="font-semibold text-lg md:text-xl">Daftar Ruangan</h1>
          </div>

          <DataTable<Room>
            /* Tambah → ke halaman /akademik/ruangan/new */
            onAdd={() => navigate("new")}
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
            stickyHeader
            zebra={false}
            viewModes={["table", "card"] as ViewMode[]}
            defaultView="table"
            storageKey={`rooms:${schoolId ?? "unknown"}`}
            /* klik baris → detail /ruangan/:id */
            onRowClick={(r) => navigate(`./${r.id}`)}
            renderActions={(r) => (
              <ActionsMenu
                onView={() => navigate(`./${r.id}`)}
                onEdit={() =>
                  navigate(`edit/${r.id}`, {
                    state: { room: r },
                  })
                }
                onDelete={() => {
                  setDeleteTarget(r);
                  setConfirmOpen(true);
                }}
              />
            )}
          />
        </div>
      </main>

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
