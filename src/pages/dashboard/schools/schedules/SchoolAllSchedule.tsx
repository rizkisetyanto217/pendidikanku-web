// src/pages/sekolahislamku/jadwal/AllSchedule.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, Clock, MapPin, Plus } from "lucide-react";

// shadcn/ui
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Edit (ubah item yang ada) — sudah di-refactor ke shadcn
import ModalEditSchedule from "@/pages/dashboard/schools/schedules/components/CSchoolModalEditSchedule";
// Modal tambah (belum kita refactor di sini; tetap dipakai)
import AddSchedule from "@/pages/dashboard/schools/schedules/components/CSchoolModalAddSchedule";

import {
  mockTodaySchedule,
  type TodayScheduleItem,
} from "@/pages/dashboard/schools/schedules/types/TodaySchedule";

/** State yang dikirim dari komponen lain via <Link state={...}> */
type LocationState = {
  items?: TodayScheduleItem[];
  heading?: string;
};

const isTime = (t?: string) => !!t && /^\d{2}:\d{2}$/.test(t);
const keyOf = (it: TodayScheduleItem) =>
  `${it.title}__${it.time || ""}__${it.room || ""}`;

const makeScheduleId = (it: TodayScheduleItem) => encodeURIComponent(keyOf(it));

export default function SchoolAllSchedule() {
  const navigate = useNavigate();

  const { state } = useLocation();
  const { items: incoming, heading } = (state ?? {}) as LocationState;

  /* ===== sumber awal (state router atau mock) ===== */
  const initial: TodayScheduleItem[] = useMemo(() => {
    const base =
      Array.isArray(incoming) && incoming.length > 0
        ? incoming
        : mockTodaySchedule;

    return base.slice().sort((a, b) => {
      const ta = isTime(a.time) ? (a.time as string) : "99:99";
      const tb = isTime(b.time) ? (b.time as string) : "99:99";
      return ta.localeCompare(tb);
    });
  }, [incoming]);

  /* ===== state lokal untuk Add/Edit/Delete ===== */
  const [items, setItems] = useState<TodayScheduleItem[]>(initial);
  useEffect(() => setItems(initial), [initial]);

  /* ===== Search & Filter ===== */
  const [search, setSearch] = useState("");
  const [locFilter, setLocFilter] = useState<string | "semua">("semua");

  const lokasiOptions = useMemo(() => {
    const set = new Set(
      items.map((x) => (x.room ?? "").trim()).filter(Boolean)
    );
    return ["semua", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return items.filter((j) => {
      const matchSearch =
        j.title.toLowerCase().includes(s) ||
        (j.room ?? "").toLowerCase().includes(s) ||
        (j.time ?? "").toLowerCase().includes(s);
      const matchLoc = locFilter === "semua" || (j.room ?? "") === locFilter;
      return matchSearch && matchLoc;
    });
  }, [items, search, locFilter]);

  /* ===== Tambah Jadwal ===== */
  const [showTambahJadwal, setShowTambahJadwal] = useState(false);
  const openAdd = () => setShowTambahJadwal(true);

  const handleSubmitAdd = (payload: {
    time: string;
    title: string;
    room?: string;
  }) => {
    const newItem: TodayScheduleItem = {
      title: payload.title,
      time: payload.time,
      room: payload.room,
    };
    setItems((prev) =>
      [...prev, newItem].sort((a, b) => {
        const ta = isTime(a.time) ? (a.time as string) : "99:99";
        const tb = isTime(b.time) ? (b.time as string) : "99:99";
        return ta.localeCompare(tb);
      })
    );
    setShowTambahJadwal(false);
  };

  /* ===== Edit Jadwal (ModalEditSchedule) ===== */
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<TodayScheduleItem | null>(null);

  const openEdit = (it: TodayScheduleItem) => {
    setSelected(it);
    setEditOpen(true);
  };

  const handleSubmitEdit = (p: {
    title: string;
    time: string;
    room?: string;
  }) => {
    if (!selected) return;
    const k = keyOf(selected);
    setItems((prev) =>
      prev
        .map((x) =>
          keyOf(x) === k
            ? { ...x, title: p.title, time: p.time, room: p.room }
            : x
        )
        .sort((a, b) => {
          const ta = isTime(a.time) ? (a.time as string) : "99:99";
          const tb = isTime(b.time) ? (b.time as string) : "99:99";
          return ta.localeCompare(tb);
        })
    );
    setEditOpen(false);
    setSelected(null);
  };

  /* ===== Konfirmasi Hapus (AlertDialog) ===== */
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TodayScheduleItem | null>(
    null
  );

  const requestDelete = (it: TodayScheduleItem) => {
    setDeleteTarget(it);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const k = keyOf(deleteTarget);
    setItems((prev) => prev.filter((x) => keyOf(x) !== k));
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const handleDetail = (it: TodayScheduleItem) => {
    const id = makeScheduleId(it);
    navigate(`detail/${id}`, { state: { item: it } });
  };

  return (
    <div className="w-full bg-background text-foreground">
      {/* Modal Edit (shadcn) */}
      <ModalEditSchedule
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setSelected(null);
        }}
        defaultTitle={selected?.title || ""}
        defaultTime={selected?.time || ""}
        defaultRoom={selected?.room || ""}
        onSubmit={handleSubmitEdit}
        onDelete={() => requestDelete(selected!)}
      />

      {/* Modal Tambah (masih pakai komponen existing) */}
      <AddSchedule
        open={showTambahJadwal}
        onClose={() => setShowTambahJadwal(false)}
        onSubmit={handleSubmitAdd}
      />

      {/* AlertDialog Konfirmasi Hapus */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yakin hapus jadwal ini?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? (
                <>
                  Jadwal <b>{deleteTarget.title}</b>{" "}
                  {deleteTarget.time ? `(${deleteTarget.time})` : ""} akan
                  dihapus dan tidak bisa dikembalikan.
                </>
              ) : (
                "Item akan dihapus dan tidak bisa dikembalikan."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <main className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          <div className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Header actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="md:flex hidden items-center gap-3 font-semibold text-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  aria-label="Kembali"
                >
                  <ArrowLeft size={20} />
                </Button>
                <span>{heading || "Jadwal Hari Ini"}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={openAdd}>
                  <Plus size={16} className="mr-1" />
                  Tambah
                </Button>
              </div>
            </div>

            {/* Search & Filter */}
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Cari judul, waktu, atau lokasi…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-10"
                    />
                  </div>

                  {lokasiOptions.length > 1 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Lokasi</Badge>
                      <Select
                        value={locFilter}
                        onValueChange={(v) =>
                          setLocFilter((v as string) || "semua")
                        }
                      >
                        <SelectTrigger className="h-10 w-[180px]">
                          <SelectValue placeholder="Semua" />
                        </SelectTrigger>
                        <SelectContent>
                          {lokasiOptions.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o === "semua" ? "Semua" : o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Jadwal List + actions */}
            <div className="grid gap-3">
              {filtered.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground text-sm">
                    Tidak ada jadwal hari ini.
                  </CardContent>
                </Card>
              ) : (
                filtered.map((j) => (
                  <Card key={keyOf(j)}>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{j.title}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            {j.room && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin size={16} /> {j.room}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <Clock size={16} />{" "}
                              {isTime(j.time) ? "Terjadwal" : j.time}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <Badge variant="secondary">{j.time}</Badge>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleDetail(j)}
                            >
                              Detail
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEdit(j)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => requestDelete(j)}
                            >
                              Hapus
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
