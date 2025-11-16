// src/pages/sekolahislamku/dashboard-school/books/SchoolBookDetail.tsx
import React, { useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { BookOpen, ArrowLeft, ExternalLink, ImageOff } from "lucide-react";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

/* === header layout hook === */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";


/* ================= Types ================= */
export type SectionLite = {
  class_sections_id: string;
  class_sections_name: string;
  class_sections_slug?: string | null;
  class_sections_code?: string | null;
  class_sections_capacity?: number | null;
  class_sections_is_active: boolean;
};

export type UsageItem = {
  class_subject_books_id: string;
  class_subjects_id: string;
  subjects_id: string;
  classes_id: string;
  sections: SectionLite[];
};

export type BookAPI = {
  books_id: string;
  books_school_id: string;
  books_title: string;
  books_author?: string | null;
  books_desc?: string | null;
  books_url?: string | null;
  books_image_url?: string | null;
  books_slug?: string | null;
  usages: UsageItem[];
};

type BookDetailResp = { data: BookAPI; message?: string };

/* ============ Dummy Data (fallback saat detail belum ada) ============ */
const DUMMY_BOOKS: BookAPI[] = [
  {
    books_id: "dummy-1",
    books_school_id: "school-1",
    books_title: "Matematika Dasar",
    books_author: "Ahmad Fauzi",
    books_desc: "Buku dasar untuk memahami konsep matematika SD.",
    books_url: "https://contoh.com/matematika-dasar",
    books_image_url: null,
    books_slug: "matematika-dasar",
    usages: [
      {
        class_subject_books_id: "csb-1",
        class_subjects_id: "sub-1",
        subjects_id: "mat-1",
        classes_id: "cls-1",
        sections: [
          {
            class_sections_id: "sec-1",
            class_sections_name: "Kelas 1A",
            class_sections_slug: "kelas-1a",
            class_sections_code: "1A",
            class_sections_capacity: 30,
            class_sections_is_active: true,
          },
        ],
      },
    ],
  },
];

/* ============ API ============ */
async function fetchBookDetail(id: string): Promise<BookAPI | null> {
  try {
    const r = await axios.get<BookDetailResp>(`/api/a/books/${id}`);
    return r.data?.data ?? null;
  } catch {
    return null;
  }
}

/* ============ Page ============ */
export default function SchoolBookDetail() {
  const { slug = "", id = "" } = useParams<{ slug: string; id: string }>();
  const base = slug ? `/${encodeURIComponent(slug)}` : "";
  const navigate = useNavigate();

  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Detail Buku",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Akademik" },
        { label: "Tahun Akademik", href: "akademik/buku" },
        { label: "Detail" },
      ],
      showBack: true,
    });
  }, [setHeader]);

  const q = useQuery({
    queryKey: ["book-detail", id],
    enabled: !!id,
    queryFn: () => fetchBookDetail(id),
    staleTime: 60_000,
  });

  const book =
    q.data ?? DUMMY_BOOKS.find((b) => b.books_id === id || b.books_slug === id);

  const sectionsFlat = useMemo(
    () => (book?.usages ?? []).flatMap((u) => u.sections || []),
    [book?.usages]
  );

  const isLoading = q.isLoading && !book;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="w-full px-4 py-4 md:px-6 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="md:flex hidden gap-3 items-center">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="hidden md:inline-flex items-center gap-1.5"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="font-semibold text-lg md:text-xl">Detail Buku</h1>
            <div className="min-w-0">
              {isLoading ? (
                <>
                  <Skeleton className="h-6 w-56" />
                  <Skeleton className="h-4 w-32 mt-2" />
                </>
              ) : (
                <>
                  {/* <h1 className="text-lg md:text-xl font-semibold truncate">
                    {book?.books_title ?? "Buku tidak ditemukan"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {book?.books_author ?? "—"}
                  </p> */}
                </>
              )}
              </div>
            </div>
          </div>

          {/* Detail Buku */}
          <Card>
            <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Cover */}
              <div className="md:col-span-4">
                <div className="w-full aspect-[3/4] rounded-md overflow-hidden grid place-items-center bg-muted">
                  {isLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : book?.books_image_url ? (
                    <img
                      src={book.books_image_url}
                      alt={book.books_title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-sm text-muted-foreground">
                      <ImageOff size={18} />
                      <span>Tidak ada cover</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Meta */}
              <div className="md:col-span-8 space-y-4">
                <InfoBlock label="Judul" value={book?.books_title ?? "—"} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoBlock
                    label="Penulis"
                    value={book?.books_author ?? "—"}
                  />
                  <InfoBlock label="Slug" value={book?.books_slug ?? "—"} />
                </div>

                {book?.books_url && (
                  <a
                    href={book.books_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm underline"
                  >
                    <ExternalLink size={14} /> Kunjungi URL Buku
                  </a>
                )}

                {book?.books_desc && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Deskripsi
                    </div>
                    <p className="text-sm leading-relaxed">{book.books_desc}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pemakaian */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base font-semibold inline-flex items-center gap-2">
                <BookOpen size={18} /> Dipakai di Kelas/Section
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-4 md:p-6">
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-7 w-40" />
                  ))}
                </div>
              ) : !book ? (
                <p className="text-sm text-muted-foreground">
                  Buku tidak ditemukan.
                </p>
              ) : sectionsFlat.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum terhubung ke kelas/section.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {sectionsFlat.map((s) => (
                    <Link
                      key={s.class_sections_id}
                      to={`${base}/sekolah/classes/${s.class_sections_id}`}
                      className="px-3 py-1 rounded-full text-sm border hover:bg-muted"
                    >
                      {s.class_sections_name}
                      {s.class_sections_code && ` (${s.class_sections_code})`}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

/* ============ Small UI ============ */
function InfoBlock({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="font-medium text-sm">{value}</div>
    </div>
  );
}
