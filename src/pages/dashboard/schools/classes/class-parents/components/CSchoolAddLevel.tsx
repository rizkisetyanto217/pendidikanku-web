// src/pages/sekolahislamku/pages/classes/components/TambahLevel.tsx
import { useState, useMemo } from "react";
import axios from "@/lib/axios";
import { X, Layers } from "lucide-react";

/* shadcn/ui */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

/* Props tanpa Palette & CPrimitives */
type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void; // refetch setelah sukses
};

export default function CSchoolAddLevel({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(
    () => name.trim().length >= 1 && !saving,
    [name, saving]
  );

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      const payload: any = {
        classes_name: name.trim(),
        classes_code: code.trim() || null,
        classes_slug: slugify(name),
        classes_is_active: true,
      };
      await axios.post("/api/a/classes", payload);
      onCreated?.();
      onClose();
      // reset form biar bersih ketika dibuka lagi
      setName("");
      setCode("");
    } catch (e) {
      console.error("Gagal membuat level:", e);
      alert("Gagal membuat level");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b border-border flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl grid place-items-center bg-muted text-primary">
              <Layers size={18} />
            </div>
            <DialogTitle className="text-base">
              Tambah Level / Tingkat
            </DialogTitle>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={onClose}
            aria-label="Tutup"
          >
            <X size={18} />
          </Button>
        </DialogHeader>

        {/* Body */}
        <div className="px-4 py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="level-name">Nama Level*</Label>
            <Input
              id="level-name"
              placeholder="Contoh: Kelas 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level-code">Kode (opsional)</Label>
            <Input
              id="level-code"
              placeholder="Contoh: 1"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Satu level dapat memiliki banyak kelas/section (mis. Kelas 1A, 1B).
          </p>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {saving ? "Menyimpan…" : "Simpan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
