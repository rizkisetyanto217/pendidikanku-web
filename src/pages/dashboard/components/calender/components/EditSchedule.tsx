// src/components/schedule/EditScheduleDialog.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Plus } from "lucide-react";

import { toLocalInputValue } from "@/pages/dashboard/components/calender/types/types";
import type { ScheduleRow } from "@/pages/dashboard/components/calender/types/types";

type Props = {
  value: ScheduleRow;
  onClose: () => void;
  onSubmit: (v: ScheduleRow) => void;
  rooms?: string[];
  classes?: string[];
};

export default function EditScheduleDialog({
  value,
  onClose,
  onSubmit,
  rooms = ["Aula 1", "Aula Utama", "Ruang 3B", "Ruang 4C", "Ruang 5A"],
  classes = ["1A", "2B", "3C", "4D", "5A", "6B"],
}: Props) {
  const [form, setForm] = useState<ScheduleRow>(value);
  const set = (k: keyof ScheduleRow, v: any) =>
    setForm((s) => ({ ...s, [k]: v }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle>{form.id ? "Ubah Jadwal" : "Tambah Jadwal"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <label className="text-xs text-muted-foreground">Judul</label>
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Contoh: Matematika Kelas 5A"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">
                Tanggal & Waktu
              </label>
              <Input
                type="datetime-local"
                value={toLocalInputValue(form.date)}
                onChange={(e) => {
                  const newDate = new Date(e.target.value).toISOString();
                  const time = e.target.value.split("T")[1] || "07:00";
                  set("date", newDate);
                  set("time", time);
                }}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Jenis</label>
              <Select
                value={form.type || "class"}
                onValueChange={(v: "class" | "exam" | "event") =>
                  set("type", v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">Kelas</SelectItem>
                  <SelectItem value="exam">Ujian</SelectItem>
                  <SelectItem value="event">Acara</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Ruangan</label>
              <Select
                value={form.room || ""}
                onValueChange={(v) => set("room", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="- Pilih Ruangan -" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Kelas</label>
              <Select
                value={form.teacher || ""}
                onValueChange={(v) => set("teacher", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="- Pilih Kelas -" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              Deskripsi (opsional)
            </label>
            <Textarea
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Catatan tambahan..."
            />
          </div>
        </div>
        <DialogFooter className="pt-4">
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={() => onSubmit(form)}>
            {form.id ? <Pencil size={16} /> : <Plus size={16} />} Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
