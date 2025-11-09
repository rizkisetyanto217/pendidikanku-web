// src/components/schools/CSchoolAddTeacher.tsx
import { useEffect, useState } from "react";
import { UserPlus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* ===== shadcn/ui ===== */
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
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

/* ================= Types ================ */
type Props = {
  open: boolean;
  subjects: string[];
  schoolId: string; // ⬅️ WAJIB: untuk POST
  onClose: () => void;
  onCreated?: (created: any) => void;
  onDeleted?: (deletedId: string) => void;
};

type UserItem = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

type ApiUsersSearchResponse = {
  code: number;
  status: string;
  message: string;
  data: {
    total: number;
    users: Array<{
      id: string;
      user_name: string;
      email?: string | null;
      phone?: string | null;
    }>;
  };
};

export default function CSchoolAddTeacher({
  open,
  subjects,
  schoolId,
  onClose,
  onCreated,
  onDeleted,
}: Props) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({
    nip: "",
    name: "",
    gender: "", // "L" | "P"
    phone: "",
    email: "",
    subject: "",
    status: "aktif" as "aktif" | "nonaktif",
  });

  const [searchQ, setSearchQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // debounce 400ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchQ.trim()), 400);
    return () => clearTimeout(t);
  }, [searchQ]);

  // reset isi ketika modal ditutup
  useEffect(() => {
    if (!open) {
      setSearchQ("");
      setDebouncedQ("");
      setSelectedUserId(null);
      setForm({
        nip: "",
        name: "",
        gender: "",
        phone: "",
        email: "",
        subject: "",
        status: "aktif",
      });
    }
  }, [open]);

  /* ===== Search Users (min 3 karakter) ===== */
  const enabledSearch = open && debouncedQ.length >= 3;
  const userSearchQ = useQuery({
    queryKey: ["search-users", debouncedQ],
    enabled: enabledSearch,
    staleTime: 60_000,
    queryFn: async () => {
      const res = await axios.get<ApiUsersSearchResponse>(
        "/api/a/users/search",
        { params: { q: debouncedQ, limit: 10 } }
      );
      const users = res.data?.data?.users ?? [];
      const items: UserItem[] = users.map((u) => ({
        id: u.id,
        name: u.user_name || "Tanpa Nama",
        email: u.email ?? null,
        phone: u.phone ?? null,
      }));
      return items;
    },
  });

  const handleSelectUser = (u: UserItem) => {
    setSelectedUserId(u.id);
    setForm((f) => ({
      ...f,
      name: u.name ?? f.name,
      email: u.email ?? f.email,
      phone: u.phone ?? f.phone,
    }));
  };
  const clearSelected = () => setSelectedUserId(null);

  /* ===== Mutations ===== */
  const addTeacher = useMutation({
    mutationFn: async () => {
      if (!selectedUserId) throw new Error("Pilih user terlebih dahulu");
      const payload = {
        school_teachers_school_id: schoolId,
        school_teachers_user_id: selectedUserId,
      };
      const res = await axios.post("/api/a/school-teachers", payload);
      return res.data;
    },
    onSuccess: (data) => {
      // ⬇️ invalidate query list publik (yang dipakai halaman list)
      qc.invalidateQueries({
        queryKey: ["public-school-teachers", schoolId],
      });
      toast({ title: "Berhasil", description: "Guru ditambahkan." });
      onCreated?.(data);
      onClose();
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: "Gagal menambah guru",
        description:
          err?.response?.data?.message ??
          err?.message ??
          "Terjadi kesalahan tak terduga.",
      });
    },
  });

  const removeTeacher = useMutation({
    mutationFn: async (schoolTeacherId: string) => {
      await axios.delete(`/api/a/school-teachers/${schoolTeacherId}`);
      return schoolTeacherId;
    },
    onSuccess: (deletedId) => {
      qc.invalidateQueries({
        queryKey: ["public-school-teachers", schoolId],
      });
      toast({ title: "Dihapus", description: "Guru dihapus dari sekolah." });
      onDeleted?.(deletedId);
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: "Gagal menghapus",
        description:
          err?.response?.data?.message ??
          err?.message ??
          "Terjadi kesalahan tak terduga.",
      });
    },
  });

  const canSave = !!selectedUserId && !!schoolId && !addTeacher.isPending;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-secondary text-secondary-foreground">
              <UserPlus size={18} />
            </div>
            <div>
              <DialogTitle>Tambah Guru</DialogTitle>
              <DialogDescription>
                Cari user terdaftar (min 3 karakter) lalu pilih.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="space-y-4">
          {/* Pencarian user */}
          <div className="space-y-2">
            <Label htmlFor="user-search">Cari User</Label>
            <Input
              id="user-search"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Contoh: rizki"
            />
            {searchQ.trim().length > 0 && searchQ.trim().length < 3 && (
              <p className="text-xs text-muted-foreground">
                Ketik minimal 3 karakter untuk mulai mencari.
              </p>
            )}

            {enabledSearch && (
              <div className="rounded-md border">
                {userSearchQ.isLoading ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Mencari…
                  </div>
                ) : (userSearchQ.data?.length ?? 0) === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Tidak ada hasil.
                  </div>
                ) : (
                  <ScrollArea className="max-h-56">
                    <ul>
                      {userSearchQ.data!.map((u) => (
                        <li
                          key={u.id}
                          className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center justify-between"
                          onClick={() => handleSelectUser(u)}
                        >
                          <div className="truncate">
                            <div className="text-sm font-medium truncate">
                              {u.name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {u.email || "-"} · {u.phone || "-"}
                            </div>
                          </div>
                          <Badge variant="secondary">Pilih</Badge>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                )}
              </div>
            )}

            {/* Badge user terpilih */}
            {selectedUserId && (
              <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span>
                  Terpilih: <b>{form.name}</b>
                </span>
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs"
                  onClick={clearSelected}
                >
                  ganti/hapus
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* (Opsional) field tambahan – belum dipakai POST, tetap tampil */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field
              label="NIP"
              value={form.nip}
              onChange={(v) => setForm({ ...form, nip: v })}
            />
            <Field
              label="Mapel Utama"
              type="select"
              options={[
                { label: "Pilih Mapel", value: "" },
                ...subjects.map((s) => ({ label: s, value: s })),
              ]}
              value={form.subject}
              onChange={(v) => setForm({ ...form, subject: v })}
            />
          </div>

          {/* Error fallback (kalau toast tak muncul) */}
          {(addTeacher.isError || removeTeacher.isError) && (
            <div className="text-xs text-destructive">
              {
                // @ts-ignore
                (addTeacher.error?.response?.data?.message as string) ||
                  // @ts-ignore
                  (removeTeacher.error?.response?.data?.message as string) ||
                  "Terjadi kesalahan."
              }
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button disabled={!canSave} onClick={() => addTeacher.mutate()}>
            {addTeacher.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============= Field helper (shadcn) ============= */
function Field({
  label,
  value,
  onChange,
  type = "text",
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "select" | "email" | "tel";
  options?: { label: string; value: string }[];
}) {
  if (type === "select") {
    return (
      <div className="flex flex-col gap-1">
        <Label>{label}</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih" />
          </SelectTrigger>
          <SelectContent>
            {(options ?? []).map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
      />
    </div>
  );
}

/* ================= Optional: tombol hapus terpisah ================= */
export function RemoveSchoolTeacherButton({
  id,
  schoolId,
  onDeleted,
}: {
  id: string; // school_teachers_id
  schoolId: string;
  onDeleted?: (deletedId: string) => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const removeTeacher = useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/a/school-teachers/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["public-school-teachers", schoolId] });
      onDeleted?.(id);
      toast({ title: "Dihapus", description: "Guru dihapus dari sekolah." });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: "Gagal menghapus",
        description:
          err?.response?.data?.message ??
          err?.message ??
          "Terjadi kesalahan tak terduga.",
      });
    },
  });

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 gap-1"
      onClick={() => removeTeacher.mutate()}
      disabled={removeTeacher.isPending}
      title="Hapus dari daftar guru"
    >
      <Trash2 size={14} />
      {removeTeacher.isPending ? "Menghapus..." : "Hapus"}
    </Button>
  );
}
