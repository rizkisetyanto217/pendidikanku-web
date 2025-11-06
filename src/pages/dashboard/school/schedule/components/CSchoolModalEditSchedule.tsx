// src/pages/sekolahislamku/components/dashboard/ModalEditSchedule.tsx
import * as React from "react";
import { useEffect, useRef, useState } from "react";

// shadcn/ui
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type EditPayload = {
  title: string;
  time: string; // "HH:MM"
  room?: string;
};

type ModalEditScheduleProps = {
  open: boolean;
  onClose: () => void;

  // Prefill
  defaultTitle?: string;
  defaultTime?: string;
  defaultRoom?: string;
  /** Opsional, info tanggal di header */
  defaultDateISO?: string;

  onSubmit: (payload: EditPayload) => void;
  /** Opsional: jika diisi, tombol Hapus akan muncul */
  onDelete?: () => void;
};

const fmtLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : undefined;

const timeOk = (t: string) => /^\d{2}:\d{2}$/.test(t);

const CSchoolModalEditSchedule: React.FC<ModalEditScheduleProps> = ({
  open,
  onClose,
  defaultTitle = "",
  defaultTime = "",
  defaultRoom = "",
  defaultDateISO,
  onSubmit,
  onDelete,
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [time, setTime] = useState(defaultTime);
  const [room, setRoom] = useState(defaultRoom);
  const [touched, setTouched] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  // Reset form ketika modal dibuka
  useEffect(() => {
    if (open) {
      setTitle(defaultTitle);
      setTime(defaultTime);
      setRoom(defaultRoom);
      setTouched(false);
    }
  }, [open, defaultTitle, defaultTime, defaultRoom]);

  const invalidTime = touched && !timeOk(time);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault?.();
    setTouched(true);
    if (!title.trim()) return;
    if (!timeOk(time)) return;
    onSubmit({ title: title.trim(), time, room: room.trim() || undefined });
  };

  // Sync close saat overlay/esc
  const handleOpenChange = (next: boolean) => {
    if (!next) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Jadwal</DialogTitle>
          {defaultDateISO && (
            <DialogDescription>{fmtLong(defaultDateISO)}</DialogDescription>
          )}
        </DialogHeader>

        {/* Body / Form */}
        <form ref={formRef} onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: TPA A — Tahsin"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Waktu (HH:MM)</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="07:30"
                className={invalidTime ? "border-destructive" : undefined}
              />
              {invalidTime && (
                <p className="text-xs text-destructive">
                  Format waktu harus HH:MM (mis. 07:30)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Lokasi / Ruang</Label>
              <Select value={room} onValueChange={setRoom}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Ruang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">(Kosong)</SelectItem>
                  <SelectItem value="aula-1">Aula 1</SelectItem>
                  <SelectItem value="aula-2">Aula 2</SelectItem>
                  <SelectItem value="kelas-1a">Kelas 1A</SelectItem>
                  <SelectItem value="kelas-1b">Kelas 1B</SelectItem>
                  <SelectItem value="perpustakaan">Perpustakaan</SelectItem>
                  <SelectItem value="lapangan">Lapangan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-3">
            {onDelete && (
              <Button
                type="button"
                variant="destructive"
                className="mr-auto"
                onClick={onDelete}
              >
                Hapus
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={!title.trim() || !timeOk(time)}>
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CSchoolModalEditSchedule;
