// src/pages/sekolahislamku/teacher/books/TeacherCSSTBookDetail.tsx
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, CalendarDays, Hash, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ================= Types ================= */
type UIStatus = "available" | "borrowed" | "archived";

type BookDTO = {
  book_id: string;
  book_school_id: string;
  book_title: string;
  book_author?: string;
  book_desc?: string;
  book_slug?: string;
  book_image_url?: string;
  book_publisher?: string;
  book_publication_year?: number;
  book_created_at?: string;
  book_updated_at?: string;
  /** UI-only (bukan kolom DB) */
  _ui_status?: UIStatus;
};

/* ============== Dummy helper (fallback) ============== */
function makeDummyBook(bookId: string): BookDTO {
  const now = new Date().toISOString();
  return {
    book_id: bookId,
    book_school_id: "00000000-0000-0000-0000-000000000001",
    book_title: "Tahsin Juz Amma Dasar",
    book_author: "Ust. Fulan",
    book_desc:
      "Materi tajwid & makhraj huruf untuk pemula. Disusun ringkas, dilengkapi contoh bacaan dan latihan.",
    book_slug: "tahsin-juz-amma-dasar",
    book_image_url:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop",
    book_publisher: "Pendidikanku Press",
    book_publication_year: 2023,
    book_created_at: now,
    book_updated_at: now,
    _ui_status: "available",
  };
}

const statusLabel: Record<UIStatus, string> = {
  available: "Tersedia",
  borrowed: "Dipinjam",
  archived: "Diarsipkan",
};

const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "-";

/* ================= Component ================= */
export default function TeacherCSSTBookDetail() {
  const { bookId = "" } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Ambil dari state kalau ada, dan TETAPKAN tipe-nya supaya tidak jadi any.
  const stateBook =
    (location.state as { book?: Partial<BookDTO> } | null)?.book ?? {};

  // Merge ke dummy dengan tipe final yang jelas
  const dto: BookDTO = {
    ...makeDummyBook(bookId || "dummy-book-id"),
    ...stateBook,
  };

  // Narrow ke variabel lokal biar index ke statusLabel aman
  const uiStatus: UIStatus | undefined = dto._ui_status;

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6">
          {/* Topbar */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Detail Buku
              </h1>
              <div className="text-xs md:text-sm text-muted-foreground">
                ID: <code className="opacity-80">{dto.book_id}</code>
              </div>
            </div>

            {uiStatus && (
              <Badge
                variant={
                  uiStatus === "available"
                    ? "default"
                    : uiStatus === "borrowed"
                      ? "secondary"
                      : "outline"
                }
              >
                {statusLabel[uiStatus]}
              </Badge>
            )}

            <Button variant="secondary" onClick={() => alert("Edit dummy")}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>

          {/* Header: Cover + Title */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Cover */}
                <div className="shrink-0">
                  {dto.book_image_url ? (
                    <img
                      src={dto.book_image_url}
                      alt={dto.book_title}
                      className="h-44 w-32 md:h-56 md:w-40 rounded-md object-cover border"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-44 w-32 md:h-56 md:w-40 rounded-md border bg-muted" />
                  )}
                </div>

                {/* Meta */}
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Judul</div>
                    <div className="text-xl md:text-2xl font-semibold">
                      {dto.book_title}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        Penulis
                      </div>
                      <div className="text-sm">{dto.book_author ?? "-"}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        Penerbit
                      </div>
                      <div className="text-sm">{dto.book_publisher ?? "-"}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        Tahun Terbit
                      </div>
                      <div className="text-sm">
                        {dto.book_publication_year ?? "-"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Slug</div>
                      <div className="text-sm">
                        {dto.book_slug ? (
                          <code className="px-1.5 py-0.5 rounded bg-muted">
                            {dto.book_slug}
                          </code>
                        ) : (
                          "-"
                        )}
                      </div>
                    </div>
                  </div>

                  {dto.book_desc && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        Deskripsi
                      </div>
                      <p className="text-sm leading-relaxed">{dto.book_desc}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Teknis */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Hash className="h-4 w-4" /> School ID
                </div>
                <div className="text-xs break-all">{dto.book_school_id}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> Dibuat
                </div>
                <div className="text-sm">{dateLong(dto.book_created_at)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> Diperbarui
                </div>
                <div className="text-sm">{dateLong(dto.book_updated_at)}</div>
              </CardContent>
            </Card>
          </div>

          {/* File/Gambar (opsional) */}
          {dto.book_image_url && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="text-sm text-muted-foreground">
                  Pranala Sampul
                </div>
                <a
                  href={dto.book_image_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline underline-offset-4"
                >
                  {dto.book_image_url}
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
