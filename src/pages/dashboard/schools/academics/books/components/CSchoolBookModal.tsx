// src/pages/.../CSchoolBookModal.tsx
import  { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";

/* shadcn/ui */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

type BookEdit = {
  books_id: string;
  books_title: string;
  books_author?: string | null;
  books_desc?: string | null;
  books_url?: string | null;
  books_image_url?: string | null;
};

type Props = {
  open: boolean;
  mode: "create" | "edit";
  book?: BookEdit | null;
  onClose: () => void;
  onSuccess: (id?: string) => void;
};

export default function CSchoolBookModal({
  open,
  mode,
  book,
  onClose,
  onSuccess,
}: Props) {
  const qc = useQueryClient();
  const isEdit = mode === "edit";

  // form
  const [title, setTitle] = useState(book?.books_title ?? "");
  const [author, setAuthor] = useState(book?.books_author ?? "");
  const [desc, setDesc] = useState(book?.books_desc ?? "");
  const [url, setUrl] = useState(book?.books_url ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    book?.books_image_url ?? null
  );

  useEffect(() => {
    if (!open) return;
    setTitle(book?.books_title ?? "");
    setAuthor(book?.books_author ?? "");
    setDesc(book?.books_desc ?? "");
    setUrl(book?.books_url ?? "");
    setPreview(book?.books_image_url ?? null);
    setFile(null);
  }, [book?.books_id, open]);

  useEffect(() => {
    if (!file) return;
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  // ===== Fake API (pakai localStorage) =====
  function fakeSaveBook(newBook: BookEdit) {
    const raw = localStorage.getItem("dummy_books") || "[]";
    const arr: BookEdit[] = JSON.parse(raw);

    if (isEdit) {
      const idx = arr.findIndex((b) => b.books_id === newBook.books_id);
      if (idx >= 0) arr[idx] = newBook;
    } else {
      arr.push(newBook);
    }

    localStorage.setItem("dummy_books", JSON.stringify(arr));
    return newBook;
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const newBook: BookEdit = {
        books_id: isEdit ? book!.books_id : `dummy-${Date.now()}`,
        books_title: title,
        books_author: author,
        books_desc: desc,
        books_url: url,
        books_image_url: preview, // simpan preview URL
      };
      return fakeSaveBook(newBook);
    },
    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: ["books-list"] });
      onSuccess(res?.books_id);
    },
    onError: (err: any) => {
      alert(err?.message || "Gagal menyimpan buku (fake).");
    },
  });

  const canSave = title.trim().length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !mutation.isPending) onClose();
      }}
    >
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="px-4 md:px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base md:text-lg">
              {isEdit ? "Edit Buku (Fake)" : "Tambah Buku (Fake)"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => !mutation.isPending && onClose()}
              aria-label="Tutup"
            >
              <X size={18} />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-4 md:p-6">
          <div className="grid md:grid-cols-12 gap-4">
            {/* Preview & File */}
            <div className="md:col-span-4">
              <Card>
                <CardContent className="p-2">
                  <div className="w-full aspect-[3/4] rounded-md overflow-hidden grid place-items-center bg-muted">
                    {preview ? (
                      <img
                        src={preview}
                        className="w-full h-full object-cover"
                        alt="Preview"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Preview cover
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="mt-3 grid gap-2">
                <Label htmlFor="file">Cover (opsional)</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-8 grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="title">Judul *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="cth. Matematika Kelas 7"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="author">Penulis</Label>
                  <Input
                    id="author"
                    value={author ?? ""}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={url ?? ""}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://…"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="desc">Deskripsi</Label>
                <Textarea
                  id="desc"
                  value={desc ?? ""}
                  onChange={(e) => setDesc(e.target.value)}
                  className="min-h-[96px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 md:px-6 py-4 border-t flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Batal
          </Button>
          <Button
            disabled={!canSave || mutation.isPending}
            onClick={() => {
              if (!canSave) return;
              mutation.mutate();
            }}
          >
            {mutation.isPending ? "Menyimpan…" : "Simpan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
