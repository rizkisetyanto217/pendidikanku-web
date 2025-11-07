// src/pages/sekolahislamku/teacher/books/ClassBooksPage.tsx
import React, { useMemo, useState, useDeferredValue } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ================= shadcn/ui ================= */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

/* =========================================================
   CONFIG + TYPES
========================================================= */
const USE_DUMMY = true;

type BookStatus = "available" | "borrowed" | "archived";

export type ClassBook = {
  id: string;
  class_id: string;
  title: string;
  author?: string;
  subject?: string; // mapel terkait (optional)
  isbn?: string;
  year?: number;
  pages?: number;
  status: BookStatus;
  cover_url?: string | null;
  description?: string | null;
  created_at?: string;
};

/* =========================================================
   DUMMY STORE (persist selama sesi)
========================================================= */
const _dummyStore: Record<string, ClassBook[]> = {};
function _seedIfEmpty(classId: string) {
  if (_dummyStore[classId]) return;
  const now = new Date().toISOString();
  _dummyStore[classId] = [
    {
      id: crypto.randomUUID(),
      class_id: classId,
      title: "Tahsin Juz Amma Dasar",
      author: "Ust. Fulan",
      subject: "Al-Qur'an",
      isbn: "978-623-000-001",
      year: 2023,
      pages: 120,
      status: "available",
      cover_url:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop",
      description: "Materi tajwid & makhraj huruf untuk pemula.",
      created_at: now,
    },
    {
      id: crypto.randomUUID(),
      class_id: classId,
      title: "Hafalan Doa Harian Anak",
      author: "Ustzh. Amina",
      subject: "Aqidah/Fiqih",
      isbn: "978-623-000-002",
      year: 2022,
      pages: 80,
      status: "borrowed",
      cover_url:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop",
      description: "Kumpulan doa sehari-hari dengan terjemah.",
      created_at: now,
    },
  ];
}

/* =========================================================
   API (dummy atau real)
========================================================= */
async function fetchClassBooks(classId: string): Promise<ClassBook[]> {
  if (!classId) return [];
  if (USE_DUMMY) {
    _seedIfEmpty(classId);
    // simulate latency
    await new Promise((r) => setTimeout(r, 300));
    return [...(_dummyStore[classId] ?? [])];
  }
  // TODO: Ganti ke axiosInstance.get(`/teacher/classes/${classId}/books`)
  return [];
}

async function createClassBook(input: Omit<ClassBook, "id" | "created_at">) {
  if (USE_DUMMY) {
    const item: ClassBook = {
      ...input,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    _seedIfEmpty(input.class_id);
    _dummyStore[input.class_id].unshift(item);
    await new Promise((r) => setTimeout(r, 250));
    return item;
  }
  // TODO: axiosInstance.post(`/teacher/classes/${input.class_id}/books`, input)
}

async function updateClassBook(
  id: string,
  classId: string,
  patch: Partial<ClassBook>
) {
  if (USE_DUMMY) {
    _seedIfEmpty(classId);
    const arr = _dummyStore[classId] ?? [];
    const idx = arr.findIndex((b) => b.id === id);
    if (idx >= 0) {
      arr[idx] = { ...arr[idx], ...patch } as ClassBook;
    }
    await new Promise((r) => setTimeout(r, 250));
    return arr[idx];
  }
  // TODO: axiosInstance.patch(`/teacher/classes/${classId}/books/${id}`, patch)
}

async function deleteClassBook(id: string, classId: string) {
  if (USE_DUMMY) {
    _seedIfEmpty(classId);
    _dummyStore[classId] = (_dummyStore[classId] ?? []).filter(
      (b) => b.id !== id
    );
    await new Promise((r) => setTimeout(r, 200));
    return { ok: true };
  }
  // TODO: axiosInstance.delete(`/teacher/classes/${classId}/books/${id}`)
}

/* =========================================================
   QUERY KEYS
========================================================= */
const QK = {
  BOOKS: (classId: string) => ["class-books", classId] as const,
};

/* =========================================================
   UTIL
========================================================= */
const statusLabel: Record<BookStatus, string> = {
  available: "Tersedia",
  borrowed: "Dipinjam",
  archived: "Diarsipkan",
};

/* =========================================================
   MAIN PAGE
========================================================= */
export default function TeacherBookList() {
  const { id: classId = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const {
    data = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: QK.BOOKS(classId),
    queryFn: () => fetchClassBooks(classId),
    enabled: !!classId,
    staleTime: 2 * 60_000,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const deferredQ = useDeferredValue(search.toLowerCase());

  const filtered = useMemo(() => {
    let list = data;
    if (status !== "all") list = list.filter((b) => b.status === status);
    if (deferredQ) {
      list = list.filter((b) =>
        [b.title, b.author, b.subject, b.isbn]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(deferredQ))
      );
    }
    return list;
  }, [data, status, deferredQ]);

  /* ===== Pagination (client) ===== */
  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  /* ===== Add/Edit Dialog ===== */
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClassBook | null>(null);

  const { mutateAsync: doCreate, isPending: creating } = useMutation({
    mutationFn: (payload: Omit<ClassBook, "id" | "created_at">) =>
      createClassBook(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.BOOKS(classId) }),
  });

  const { mutateAsync: doUpdate, isPending: updating } = useMutation({
    mutationFn: (vars: { id: string; patch: Partial<ClassBook> }) =>
      updateClassBook(vars.id, classId, vars.patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.BOOKS(classId) }),
  });

  const { mutateAsync: doDelete, isPending: deleting } = useMutation({
    mutationFn: (id: string) => deleteClassBook(id, classId),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.BOOKS(classId) }),
  });

  function openAdd() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(item: ClassBook) {
    setEditing(item);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      class_id: classId,
      title: String(form.get("title") || "").trim(),
      author: String(form.get("author") || "").trim() || undefined,
      subject: String(form.get("subject") || "").trim() || undefined,
      isbn: String(form.get("isbn") || "").trim() || undefined,
      year: form.get("year") ? Number(form.get("year")) : undefined,
      pages: form.get("pages") ? Number(form.get("pages")) : undefined,
      status:
        (String(form.get("status") || "available") as BookStatus) ||
        "available",
      cover_url: String(form.get("cover_url") || "").trim() || undefined,
      description: String(form.get("description") || "").trim() || undefined,
    } as Omit<ClassBook, "id" | "created_at">;

    if (editing) {
      await doUpdate({ id: editing.id, patch: payload });
    } else {
      await doCreate(payload);
    }
    setOpen(false);
  }

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full px-4 md:px-6 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-6">
          {/* Top bar */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Buku Kelas</h1>
          </div>

          {/* Toolbar */}
          <Card>
            <CardContent className="p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="flex items-center gap-2 w-full md:w-[420px]">
                <div className="relative w-full">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari judul/penulis/ISBN…"
                    className="pl-8"
                    value={search}
                    onChange={(e) => {
                      setPage(1);
                      setSearch(e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={status}
                  onValueChange={(v) => {
                    setPage(1);
                    setStatus(v);
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="available">Tersedia</SelectItem>
                    <SelectItem value="borrowed">Dipinjam</SelectItem>
                    <SelectItem value="archived">Diarsipkan</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={openAdd}>
                  <Plus className="h-4 w-4 mr-1" /> Tambah Buku
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Daftar Buku
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
              {/* Desktop: Tabel */}
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/40">
                    <tr className="text-left">
                      <th className="px-4 py-2 w-[56px]">#</th>
                      <th className="px-4 py-2">Buku</th>
                      <th className="px-4 py-2">Penulis</th>
                      <th className="px-4 py-2">Mapel</th>
                      <th className="px-4 py-2">ISBN</th>
                      <th className="px-4 py-2">Tahun</th>
                      <th className="px-4 py-2">Hal.</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2 w-[120px]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(isLoading || isFetching) && (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-6 text-muted-foreground"
                        >
                          Memuat data buku…
                        </td>
                      </tr>
                    )}
                    {!isLoading && pageItems.length === 0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-6 text-muted-foreground"
                        >
                          Tidak ada data.
                        </td>
                      </tr>
                    )}
                    {pageItems.map((b, idx) => (
                      <tr key={b.id} className="border-b last:border-0">
                        <td className="px-4 py-3 align-top">
                          {(page - 1) * perPage + idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-3">
                            {b.cover_url ? (
                              <img
                                src={b.cover_url}
                                alt={b.title}
                                className="h-12 w-9 rounded object-cover border"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-12 w-9 rounded border bg-muted" />
                            )}
                            <div>
                              <div className="font-medium line-clamp-2">
                                {b.title}
                              </div>
                              {b.description ? (
                                <div className="text-xs text-muted-foreground line-clamp-1">
                                  {b.description}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{b.author ?? "-"}</td>
                        <td className="px-4 py-3">{b.subject ?? "-"}</td>
                        <td className="px-4 py-3">{b.isbn ?? "-"}</td>
                        <td className="px-4 py-3">{b.year ?? "-"}</td>
                        <td className="px-4 py-3">{b.pages ?? "-"}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              b.status === "available"
                                ? "default"
                                : b.status === "borrowed"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {statusLabel[b.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(b)}
                              aria-label="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => doDelete(b.id)}
                              disabled={deleting}
                              aria-label="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Cards */}
              <div className="md:hidden p-4 grid grid-cols-1 gap-3">
                {(isLoading || isFetching) && (
                  <>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4 flex gap-3">
                          <Skeleton className="h-16 w-12 rounded" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-3 w-2/3" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}

                {!isLoading && pageItems.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    Tidak ada data.
                  </div>
                )}

                {pageItems.map((b) => (
                  <Card key={b.id}>
                    <CardContent className="p-4 flex gap-3">
                      {b.cover_url ? (
                        <img
                          src={b.cover_url}
                          alt={b.title}
                          className="h-20 w-16 rounded object-cover border"
                        />
                      ) : (
                        <div className="h-20 w-16 rounded border bg-muted" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium line-clamp-2">
                          {b.title}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {b.author ?? "-"} • {b.subject ?? "-"}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge
                            variant={
                              b.status === "available"
                                ? "default"
                                : b.status === "borrowed"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {statusLabel[b.status]}
                          </Badge>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openEdit(b)}
                          >
                            <Pencil className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => doDelete(b.id)}
                            disabled={deleting}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Hapus
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 border-t flex items-center justify-between text-sm">
                <div>
                  Menampilkan {pageItems.length} dari {filtered.length} buku
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    Hal. {page} / {totalPages}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add/Edit Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[560px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editing ? "Edit Buku" : "Tambah Buku"}
                  </DialogTitle>
                  <DialogDescription>
                    Lengkapi detail buku di bawah ini, kemudian simpan.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <Label htmlFor="title">Judul</Label>
                    <Input
                      id="title"
                      name="title"
                      required
                      defaultValue={editing?.title ?? ""}
                    />
                  </div>

                  <div>
                    <Label htmlFor="author">Penulis</Label>
                    <Input
                      id="author"
                      name="author"
                      defaultValue={editing?.author ?? ""}
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Mapel</Label>
                    <Input
                      id="subject"
                      name="subject"
                      defaultValue={editing?.subject ?? ""}
                    />
                  </div>

                  <div>
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                      id="isbn"
                      name="isbn"
                      defaultValue={editing?.isbn ?? ""}
                    />
                  </div>

                  <div>
                    <Label htmlFor="year">Tahun</Label>
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      inputMode="numeric"
                      defaultValue={editing?.year ?? ""}
                    />
                  </div>

                  <div>
                    <Label htmlFor="pages">Halaman</Label>
                    <Input
                      id="pages"
                      name="pages"
                      type="number"
                      inputMode="numeric"
                      defaultValue={editing?.pages ?? ""}
                    />
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Select
                      name="status"
                      defaultValue={editing?.status ?? "available"}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Tersedia</SelectItem>
                        <SelectItem value="borrowed">Dipinjam</SelectItem>
                        <SelectItem value="archived">Diarsipkan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="cover_url">URL Sampul (opsional)</Label>
                    <Input
                      id="cover_url"
                      name="cover_url"
                      defaultValue={editing?.cover_url ?? ""}
                      placeholder="https://…"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description">Deskripsi (opsional)</Label>
                    <Input
                      id="description"
                      name="description"
                      defaultValue={editing?.description ?? ""}
                    />
                  </div>
                </div>

                <DialogFooter className="mt-5">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={creating || updating}>
                    Simpan
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
