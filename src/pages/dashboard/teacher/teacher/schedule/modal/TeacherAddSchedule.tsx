// =============================
// File: src/pages/sekolahislamku/pages/schedule/modal/TambahJadwal.tsx
// =============================
import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  defaultTime?: string;
}) {
  const [time, setTime] = useState<string>(defaultTime || "");
  const [title, setTitle] = useState<string>("");
  const [room, setRoom] = useState<string>("");
  const [error, setError] = useState<string>("");

  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setTime(defaultTime || "");
      setTitle("");
      setRoom("");
      setError("");
      setTimeout(() => firstFieldRef.current?.focus(), 100);
    }
  }, [open, defaultTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!time || !title.trim()) {
      setError("Jam dan Judul wajib diisi.");
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
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Tambah Jadwal</DialogTitle>
          <DialogDescription>
            Isi data jadwal kegiatan di bawah ini.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="time">Jam *</Label>
            <Input
              id="time"
              ref={firstFieldRef}
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-1.5">
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

          <div className="grid gap-1.5">
            <Label htmlFor="room">Ruangan (opsional)</Label>
            <Input
              id="room"
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Aula 1 / R. Tahfiz"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
