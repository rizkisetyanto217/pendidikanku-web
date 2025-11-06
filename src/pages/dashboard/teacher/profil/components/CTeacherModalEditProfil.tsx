// src/pages/sekolahislamku/pages/teacher/ModalEditProfilLengkap.shadcn.tsx
import React, { useState } from "react";
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

type ProfilLengkapData = {
  fullname: string;
  phone: string;
  email: string;
  city: string;
  location: string;
  birthPlace: string;
  birthDate: string;
  company: string;
  position: string;
  education: string;
  experience: number;
  gender: "male" | "female";
  whatsappUrl: string;
  instagramUrl: string;
};

type ModalEditProfilLengkapProps = {
  open: boolean;
  onClose: () => void;
  initial: Partial<ProfilLengkapData>;
  onSubmit: () => void; // callback untuk refresh data
  teacherId?: string; // optional untuk identifikasi guru
};

const CModalEditProfilLengkap: React.FC<ModalEditProfilLengkapProps> = ({
  open,
  onClose,
  initial,
  onSubmit,
  teacherId,
}) => {
  const [form, setForm] = useState<ProfilLengkapData>({
    fullname: initial.fullname || "",
    phone: initial.phone || "",
    email: initial.email || "",
    city: initial.city || "",
    location: initial.location || "",
    birthPlace: initial.birthPlace || "",
    birthDate: initial.birthDate || "",
    company: initial.company || "",
    position: initial.position || "",
    education: initial.education || "",
    experience: initial.experience ?? 0,
    gender: initial.gender || "male",
    whatsappUrl: initial.whatsappUrl || "",
    instagramUrl: initial.instagramUrl || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof ProfilLengkapData>(
    k: K,
    v: ProfilLengkapData[K]
  ) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validasi minimal
      if (!form.fullname.trim()) {
        setError("Nama lengkap tidak boleh kosong.");
        return;
      }
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        setError("Format email tidak valid.");
        return;
      }
      if (form.whatsappUrl && !form.whatsappUrl.startsWith("https://wa.me/")) {
        setError("URL WhatsApp harus dimulai dengan https://wa.me/");
        return;
      }
      if (
        form.instagramUrl &&
        !form.instagramUrl.startsWith("https://instagram.com/")
      ) {
        setError("URL Instagram harus dimulai dengan https://instagram.com/");
        return;
      }

      const payload = {
        user_teacher_name: form.fullname,
        user_teacher_phone: form.phone || null,
        user_teacher_email: form.email || null,
        user_teacher_city: form.city || null,
        user_teacher_location: form.location || null,
        user_teacher_birth_place: form.birthPlace || null,
        user_teacher_birth_date: form.birthDate || null,
        user_teacher_company: form.company || null,
        user_teacher_field: form.position || null,
        user_teacher_education: form.education || null,
        user_teacher_experience_years: form.experience ?? 0,
        user_teacher_gender: form.gender,
        user_teacher_whatsapp_url: form.whatsappUrl || null,
        user_teacher_instagram_url: form.instagramUrl || null,
      };

      await api.patch(`/api/u/user-teachers/update`, {
        ...(teacherId ? { user_teacher_id: teacherId } : {}),
        ...payload,
      });

      onSubmit();
      onClose();
    } catch (err: any) {
      console.error("❌ Gagal update profil lengkap:", err);
      setError(
        err?.response?.data?.message || "Gagal memperbarui profil lengkap."
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
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle className="text-base">Edit Profil Lengkap</DialogTitle>
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

          {/* Informasi Personal */}
          <section className="space-y-3">
            <h3 className="font-medium text-sm">Informasi Personal</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nama Lengkap *</Label>
                <Input
                  placeholder="Nama Lengkap"
                  value={form.fullname}
                  onChange={(e) => set("fullname", e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Telepon</Label>
                <Input
                  placeholder="08xxxx"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  disabled={loading}
                  inputMode="tel"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="nama@email.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Jenis Kelamin</Label>
                <Select
                  value={form.gender}
                  onValueChange={(v: "male" | "female") => set("gender", v)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Laki-laki</SelectItem>
                    <SelectItem value="female">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Kota</Label>
                <Input
                  placeholder="Bandung"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Provinsi/Lokasi</Label>
                <Input
                  placeholder="Jawa Barat"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tempat Lahir</Label>
                <Input
                  placeholder="Jakarta"
                  value={form.birthPlace}
                  onChange={(e) => set("birthPlace", e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tanggal Lahir</Label>
                <Input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => set("birthDate", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </section>

          <Separator className="my-4" />

          {/* Informasi Profesional */}
          <section className="space-y-3">
            <h3 className="font-medium text-sm">Informasi Profesional</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Instansi</Label>
                <Input
                  placeholder="Pesantren X"
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Bidang/Posisi</Label>
                <Input
                  placeholder="Fiqih"
                  value={form.position}
                  onChange={(e) => set("position", e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label>Pendidikan</Label>
                <Textarea
                  placeholder="S1 Syariah, dst."
                  value={form.education}
                  onChange={(e) => set("education", e.target.value)}
                  disabled={loading}
                  className="min-h-[72px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Pengalaman (tahun)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.experience}
                  onChange={(e) =>
                    set("experience", Number(e.target.value || 0))
                  }
                  disabled={loading}
                  inputMode="numeric"
                />
              </div>
            </div>
          </section>

          <Separator className="my-4" />

          {/* Informasi Kontak & Sosial */}
          <section className="space-y-3">
            <h3 className="font-medium text-sm">Informasi Kontak & Sosial</h3>
            <div className="space-y-1.5">
              <Label>URL WhatsApp</Label>
              <Input
                placeholder="https://wa.me/6281234567890"
                value={form.whatsappUrl}
                onChange={(e) => set("whatsappUrl", e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Contoh: https://wa.me/6281234567890
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>URL Instagram</Label>
              <Input
                placeholder="https://instagram.com/username"
                value={form.instagramUrl}
                onChange={(e) => set("instagramUrl", e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Contoh: https://instagram.com/ust_zidan
              </p>
            </div>
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

export default CModalEditProfilLengkap;
