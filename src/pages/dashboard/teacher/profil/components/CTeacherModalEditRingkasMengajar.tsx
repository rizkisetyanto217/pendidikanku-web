// src/pages/sekolahislamku/pages/teacher/ModalEditInformasiMengajar.shadcn.tsx
import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

type InformasiMengajarData = {
  activity: string;
  rating: number;
  totalStudents: number;
  experience: number;
  isActive: boolean;
};

type ModalEditInformasiMengajarProps = {
  open: boolean;
  onClose: () => void;
  initial: InformasiMengajarData;
  onSubmit: (data: InformasiMengajarData) => void;
  teacherId?: string; // optional untuk identifikasi guru
};

const ModalEditInformasiMengajar: React.FC<ModalEditInformasiMengajarProps> = ({
  open,
  onClose,
  initial,
  onSubmit,
  teacherId,
}) => {
  const [form, setForm] = useState<InformasiMengajarData>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sinkron ketika `initial` berubah (mis. ganti guru)
  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const set = <K extends keyof InformasiMengajarData>(
    k: K,
    v: InformasiMengajarData[K]
  ) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validasi dasar
      const rating = Number(form.rating);
      const totalStudents = Number(form.totalStudents);
      const experience = Number(form.experience);

      if (Number.isNaN(rating) || rating < 0 || rating > 5) {
        setError("Rating harus antara 0 sampai 5.");
        return;
      }
      if (!Number.isFinite(totalStudents) || totalStudents < 0) {
        setError("Total siswa tidak boleh negatif.");
        return;
      }
      if (!Number.isFinite(experience) || experience < 0) {
        setError("Pengalaman (tahun) tidak boleh negatif.");
        return;
      }

      const payload = {
        user_teacher_activity: form.activity,
        user_teacher_rating: rating,
        user_teacher_total_students: totalStudents,
        user_teacher_experience_years: experience,
        user_teacher_is_active: form.isActive,
      };

      await api.patch(`/api/u/user-teachers/update`, {
        ...(teacherId ? { user_teacher_id: teacherId } : {}),
        ...payload,
      });

      onSubmit({ ...form, rating, totalStudents, experience });
      onClose();
    } catch (err: any) {
      console.error("❌ Gagal update data guru:", err);
      setError(err?.response?.data?.message || "Gagal memperbarui data guru.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !loading) onClose();
      }}
    >
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle className="text-base">
            Edit Informasi Mengajar
          </DialogTitle>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3"
              disabled={loading}
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="px-5 pb-5 overflow-y-auto max-h-[75vh]">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Terjadi Kesalahan</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Kegiatan Mengajar */}
          <section className="space-y-2">
            <Label>Kegiatan Mengajar</Label>
            <Textarea
              value={form.activity}
              onChange={(e) => set("activity", e.target.value)}
              rows={3}
              placeholder="Tuliskan ringkas aktivitas mengajar Anda (kelas, jadwal, fokus materi, dst.)"
              disabled={loading}
            />
          </section>

          <Separator className="my-4" />

          {/* Angka-angka */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Rating (0–5)</Label>
              <Input
                type="number"
                step="0.1"
                min={0}
                max={5}
                value={form.rating}
                onChange={(e) => set("rating", Number(e.target.value))}
                disabled={loading}
                inputMode="decimal"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Total Siswa</Label>
              <Input
                type="number"
                min={0}
                value={form.totalStudents}
                onChange={(e) => set("totalStudents", Number(e.target.value))}
                disabled={loading}
                inputMode="numeric"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Pengalaman (tahun)</Label>
              <Input
                type="number"
                min={0}
                value={form.experience}
                onChange={(e) => set("experience", Number(e.target.value))}
                disabled={loading}
                inputMode="numeric"
              />
            </div>
          </section>

          <Separator className="my-4" />

          {/* Status Aktif */}
          <section className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.isActive ? "true" : "false"}
              onValueChange={(v) => set("isActive", v === "true")}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Aktif</SelectItem>
                <SelectItem value="false">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan…
              </span>
            ) : (
              "Simpan"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalEditInformasiMengajar;
