// src/pages/sekolahislamku/pages/teacher/ModalEditRingkasan.shadcn.tsx
import React, { useState, useEffect } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

type RingkasanData = {
  greeting: string;
  shortBio: string;
  subjects: string[];
};

type ModalEditRingkasanProps = {
  open: boolean;
  onClose: () => void;
  initial: RingkasanData;
  onSubmit: () => void; // refresh data parent
  teacherId?: string;
};

const ModalEditRingkasan: React.FC<ModalEditRingkasanProps> = ({
  open,
  onClose,
  initial,
  onSubmit,
  teacherId,
}) => {
  const [form, setForm] = useState<RingkasanData>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // sinkronkan saat initial berubah (misal ketika ganti guru)
  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const set = <K extends keyof RingkasanData>(k: K, v: RingkasanData[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validasi input dasar
      if (!form.greeting.trim()) {
        setError("Salam pembuka tidak boleh kosong.");
        return;
      }
      if (!form.shortBio.trim()) {
        setError("Bio singkat tidak boleh kosong.");
        return;
      }
      const cleanedSubjects = (form.subjects || [])
        .map((s) => s.trim())
        .filter(Boolean);
      if (cleanedSubjects.length === 0) {
        setError("Mata pelajaran tidak boleh kosong.");
        return;
      }

      const payload = {
        user_teacher_greeting: form.greeting,
        user_teacher_short_bio: form.shortBio,
        user_teacher_specialties: cleanedSubjects,
      };

      await api.patch(`/api/u/user-teachers/update`, {
        ...(teacherId ? { user_teacher_id: teacherId } : {}),
        ...payload,
      });

      onSubmit();
      onClose();
    } catch (err: any) {
      console.error("❌ Gagal update data ringkasan:", err);
      setError(
        err?.response?.data?.message || "Gagal memperbarui data ringkasan."
      );
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
          <DialogTitle className="text-base">Edit Ringkasan</DialogTitle>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3"
              disabled={loading}
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

          {/* Salam */}
          <section className="space-y-2">
            <Label>
              Salam Pembuka <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={form.greeting}
              onChange={(e) => set("greeting", e.target.value)}
              placeholder="Contoh: Assalamu'alaikum warahmatullahi wabarakatuh"
              rows={3}
              disabled={loading}
            />
          </section>

          <Separator className="my-4" />

          {/* Bio Singkat */}
          <section className="space-y-2">
            <Label>
              Bio Singkat <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={form.shortBio}
              onChange={(e) => set("shortBio", e.target.value)}
              placeholder="Contoh: Pengajar fiqih dasar dengan pengalaman 5 tahun."
              rows={3}
              disabled={loading}
            />
          </section>

          <Separator className="my-4" />

          {/* Subjects */}
          <section className="space-y-2">
            <Label>
              Mata Pelajaran <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Pisahkan dengan koma, misal: Fiqih, Adab, Tauhid"
              value={(form.subjects || []).join(", ")}
              onChange={(e) =>
                set(
                  "subjects",
                  e.target.value.split(",").map((s) => s.trim())
                )
              }
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Masukkan mata pelajaran yang Anda ajarkan, pisahkan dengan koma.
            </p>
          </section>
        </div>

        {/* Footer actions */}
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

export default ModalEditRingkasan;
