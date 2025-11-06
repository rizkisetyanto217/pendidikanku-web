// =============================
// File: src/pages/sekolahislamku/pages/schedule/modal/TambahJadwal.tsx
// =============================
import * as React from "react";
import { useEffect, useRef, useState } from "react";

// shadcn/ui
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface AddScheduleItem {
  time: string; // HH:MM
  title: string;
  room?: string;
  slug?: string;
}

const generateSlug = (text: string) =>
  (text || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

export default function TeacherAddSchedule({
  open,
  onClose,
  onSubmit,
  defaultTime,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (item: AddScheduleItem) => void;
  defaultTime?: string; // optional prefill e.g. "10:00"
}) {
  const [time, setTime] = useState<string>(defaultTime || "");
  const [title, setTitle] = useState<string>("");
  const [room, setRoom] = useState<string>("");
  const [error, setError] = useState<string>("");

  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setTime(defaultTime || "");
      setTitle("");
      setRoom("");
      setError("");
      // focus first input
      setTimeout(() => firstFieldRef.current?.focus(), 0);
    }
  }, [open, defaultTime]);

  const handleOpenChange = (next: boolean) => {
    if (!next) onClose();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (!time || !title.trim()) {
      setError("Jam dan Judul wajib diisi");
      return;
    }
    const payload: AddScheduleItem = {
      time: time.trim(),
      title: title.trim(),
      room: room.trim() || undefined,
      slug: generateSlug(title),
    };
    onSubmit(payload);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Jadwal</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <div className="text-sm rounded-md px-3 py-2 bg-muted text-foreground/80">
              {error}
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="time">Jam *</Label>
            <Input
              ref={firstFieldRef}
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Judul / Kegiatan *</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: TPA A — Tahsin"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="room">Ruangan (opsional)</Label>
            <Input
              id="room"
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Aula 1 / R. Tahfiz"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
