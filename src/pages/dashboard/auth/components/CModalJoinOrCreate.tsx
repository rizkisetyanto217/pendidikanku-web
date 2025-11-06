// src/components/modals/ModalJoinOrCreate.tsx
import * as React from "react";
import { Building2, GraduationCap, Users2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Mode = "dkm" | "teacher" | "student";

export default function CModalJoinOrCreate(props: {
  open: boolean;
  mode: Mode;
  onClose: () => void;
  onCreateschool: (data: { name: string; file?: File }) => Promise<void> | void;
  onJoinSekolah: (
    code: string,
    role: "teacher" | "student"
  ) => Promise<void> | void;
}) {
  const { open, mode, onClose, onCreateschool, onJoinSekolah } = props;

  const [schoolName, setSchoolName] = React.useState("");
  const [iconFile, setIconFile] = React.useState<File | null>(null);
  const [accessCode, setAccessCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const isCreate = mode === "dkm";

  const Icon = isCreate
    ? Building2
    : mode === "teacher"
    ? Users2
    : GraduationCap;
  const title = isCreate ? "Buat Sekolah Baru" : "Gabung ke Sekolah";
  const description = isCreate
    ? "Daftarkan sekolah Anda ke sistem."
    : "Masukkan kode akses dari admin sekolah.";

  async function handleCreate(e?: React.FormEvent) {
    e?.preventDefault();
    if (!schoolName.trim()) return;
    setLoading(true);
    try {
      await onCreateschool({
        name: schoolName.trim(),
        file: iconFile ?? undefined,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e?: React.FormEvent) {
    e?.preventDefault();
    if (!accessCode.trim()) return;
    setLoading(true);
    try {
      await onJoinSekolah(accessCode.trim(), mode as "teacher" | "student");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "size-12 shrink-0 rounded-xl flex items-center justify-center",
                "bg-gradient-to-br from-primary to-accent"
              )}
            >
              <Icon className="size-6 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isCreate ? (
          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="grid gap-2">
              <Label htmlFor="schoolName">Nama Sekolah</Label>
              <Input
                id="schoolName"
                placeholder="Contoh: SD Al-Ikhlas"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="iconFile">Logo Sekolah (Opsional)</Label>
              <Input
                id="iconFile"
                type="file"
                accept="image/*"
                onChange={(e) => setIconFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <Button
              type="submit"
              disabled={!schoolName.trim() || loading}
              className={cn(
                "w-full bg-gradient-to-r from-primary to-accent text-primary-foreground",
                "hover:opacity-95"
              )}
            >
              {loading ? "Membuat sekolah..." : "Buat Sekolah"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="w-full"
            >
              Batal
            </Button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleJoin}>
            <div className="grid gap-2">
              <Label htmlFor="accessCode">Kode Akses Sekolah</Label>
              <Input
                id="accessCode"
                placeholder="Masukkan kode akses"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="text-center font-mono tracking-wider text-lg"
              />
            </div>

            <Button
              type="submit"
              disabled={!accessCode.trim() || loading}
              className={cn(
                "w-full bg-gradient-to-r from-accent to-primary text-primary-foreground",
                "hover:opacity-95"
              )}
            >
              {loading ? "Memproses..." : "Gabung Sekarang"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="w-full"
            >
              Batal
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
