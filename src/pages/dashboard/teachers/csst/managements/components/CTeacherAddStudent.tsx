import * as React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type StudentForm = {
  name: string;
  nis?: string;
  email?: string;
  phone?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  defaultValue?: StudentForm;
  onSubmit: (val: StudentForm) => Promise<void> | void;
};

const CTeacherAddStudent: React.FC<Props> = ({
  open,
  onClose,
  title = "Tambah Siswa",
  defaultValue,
  onSubmit,
}) => {
  const [name, setName] = useState(defaultValue?.name ?? "");
  const [nis, setNis] = useState(defaultValue?.nis ?? "");
  const [email, setEmail] = useState(defaultValue?.email ?? "");
  const [phone, setPhone] = useState(defaultValue?.phone ?? "");
  const [loading, setLoading] = useState(false);

  // Prefill saat modal dibuka / data berubah
  useEffect(() => {
    if (!open) return;
    setName(defaultValue?.name ?? "");
    setNis(defaultValue?.nis ?? "");
    setEmail(defaultValue?.email ?? "");
    setPhone(defaultValue?.phone ?? "");
  }, [open, defaultValue]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        nis: nis.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={submit} className="space-y-6">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Siswa</Label>
              <Input
                id="name"
                placeholder="Masukkan nama lengkap"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nis">NIS</Label>
              <Input
                id="nis"
                placeholder="Nomor Induk Siswa"
                value={nis}
                onChange={(e) => setNis(e.currentTarget.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email siswa"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Nomor HP</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.currentTarget.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CTeacherAddStudent;
