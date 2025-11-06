// src/pages/sekolahislamku/jadwal/DetailSchedule.tsx
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { ArrowLeft, Clock, MapPin, PencilLine, Trash2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export type TodayScheduleItem = {
  title: string;
  time?: string;
  room?: string;
};

const decodeId = (id: string) => {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
};

export default function SchoolDetailSchedule() {
  const { scheduleId = "" } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const { state } = useLocation();

  // Ambil item dari state (kalau datang dari list)
  const incoming = (state as any)?.item as TodayScheduleItem | undefined;

  const [item, setItem] = useState<TodayScheduleItem | null>(incoming ?? null);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const readableId = useMemo(() => decodeId(scheduleId), [scheduleId]);

  const handleDelete = () => {
    // TODO: panggil API delete bila sudah ada
    navigate(-1);
  };

  const handleSubmitEdit = (p: {
    title: string;
    time: string;
    room?: string;
  }) => {
    // TODO: sambungkan ke API update bila sudah ada
    setItem({ title: p.title, time: p.time, room: p.room });
    setEditOpen(false);
  };

  // local state untuk form edit (diisi saat open)
  const [title, setTitle] = useState(item?.title ?? "");
  const [time, setTime] = useState(item?.time ?? "");
  const [room, setRoom] = useState(item?.room ?? "");

  const openEdit = () => {
    setTitle(item?.title ?? "");
    setTime(item?.time ?? "");
    setRoom(item?.room ?? "");
    setEditOpen(true);
  };

  return (
    <div className="w-full bg-background text-foreground">
      {/* Modal Edit (shadcn) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Jadwal</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Judul</Label>
              <Input
                id="title"
                className="mt-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="cth: Matematika - Kelas A"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="time">Waktu</Label>
                <Input
                  id="time"
                  className="mt-1"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="07:30–09:00"
                />
              </div>
              <div>
                <Label htmlFor="room">Ruang</Label>
                <Input
                  id="room"
                  className="mt-1"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Gedung A Lt.2 / R.201"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="ghost" type="button">
                Batal
              </Button>
            </DialogClose>
            <Button
              onClick={() =>
                handleSubmitEdit({
                  title: title.trim(),
                  time: time.trim(),
                  room: room.trim() || undefined,
                })
              }
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Konfirmasi Hapus */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus jadwal ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:opacity-90"
              onClick={handleDelete}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <main className="px-4 md:px-6 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="hidden md:flex items-center gap-3 font-semibold text-lg">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
              </Button>
              <span>Detail Jadwal</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" onClick={openEdit}>
                <PencilLine className="mr-2" size={16} /> Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="mr-2" size={16} /> Hapus
              </Button>
            </div>
          </div>

          {/* Card Detail */}
          <Card>
            <CardContent className="p-4 md:p-5">
              {item ? (
                <>
                  <div className="font-bold text-xl">{item.title}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <span className="inline-flex items-center gap-2">
                      <Clock size={16} />
                      <Badge variant="outline">{item.time || "-"}</Badge>
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={16} />
                      <Badge variant="outline">{item.room || "-"}</Badge>
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {/* Fallback kalau tidak ada state: tampilkan ID ter-decode */}
                  <div className="font-bold text-xl break-words">
                    Jadwal: <span className="font-normal">{readableId}</span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Data detail tidak dikirim via state. Sambungkan fetch by ID
                    di sini bila diperlukan.
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
