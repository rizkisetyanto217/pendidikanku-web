// src/pages/dashboard/schools/academics/books/details/SchoolBookDetail.tsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { BookOpen, ArrowLeft, ExternalLink, ImageOff } from "lucide-react";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

/* === header layout hook === */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import CActionsButton from "@/components/costum/common/buttons/CActionsButton";
import CDeleteDialog from "@/components/costum/common/buttons/CDeleteDialog";
import CBadgeStatus from "@/components/costum/common/badges/CBadgeStatus";


/* ================= Types ================= */

export type ClassSubjectLite = {
  class_subject_id: string;
  class_subject_school_id: string;
  class_subject_class_parent_id: string;
  class_subject_subject_id: string;
  class_subject_slug: string;
  class_subject_order_index: number;
  class_subject_min_passing_score: number;
  class_subject_is_core: boolean;
  class_subject_is_active: boolean;
  class_subject_subject_name_cache?: string | null;
  class_subject_subject_code_cache?: string | null;
  class_subject_subject_slug_cache?: string | null;
  class_subject_class_parent_name_cache?: string | null;
  class_subject_class_parent_code_cache?: string | null;
  class_subject_class_parent_level_cache?: number | null;
};

export type BookAPI = {
  book_id: string;
  book_school_id: string;
  book_title: string;
  book_author?: string | null;
  book_desc?: string | null;
  book_slug?: string | null;
  book_image_url?: string | null;
  book_image_object_key?: string | null;
  book_purchase_url?: string | null;
  book_publisher?: string | null;
  book_publication_year?: number | null;
  book_created_at?: string;
  book_updated_at?: string;
  book_is_deleted?: boolean;
  // hasil merge dari include.class_subjects
  class_subjects?: ClassSubjectLite[];
};

type BookListResp = {
  data: BookAPI[];
  include?: {
    class_subjects?: ClassSubjectLite[];
  };
  message?: string;
};

/* ============ Helpers ============ */
function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/* ============ API ============ */
async function fetchBookDetail(id: string): Promise<BookAPI | null> {
  try {
    const r = await axios.get<BookListResp>("/api/u/books/list", {
      params: {
        include: "class_subjects",
        id,
      },
    });

    const list = r.data?.data ?? [];
    const raw = list[0];
    if (!raw) return null;

    const classSubjects = r.data?.include?.class_subjects ?? [];

    // gabungkan supaya komponen tinggal baca dari 1 object
    return {
      ...raw,
      class_subjects: classSubjects,
    };
  } catch {
    return null;
  }
}

/* ============ Page ============ */
export default function SchoolBookDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Detail Buku",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Akademik" },
        { label: "Buku", href: "akademik/buku" },
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

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      await axios.delete(`/api/a/books/${id}`);
    },
    onSuccess: () => {
      navigate(-1);
    },
  });

  const isDeleting = deleteMutation.isPending;

  const book = q.data ?? null;
  const isLoading = q.isLoading;

  const [deleteOpen, setDeleteOpen] = React.useState(false);




  return (
    <div className="bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="md:flex hidden gap-3 items-center">
              <Button variant="ghost" onClick={() => navigate(-1)} size="icon">
                <ArrowLeft size={20} />
              </Button>
              <h1 className="font-semibold text-lg md:text-xl">Detail Buku</h1>
              <div className="min-w-0">
                {isLoading ? (
                  <>
                    <Skeleton className="h-6 w-56" />
                    <Skeleton className="h-4 w-32 mt-2" />
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Detail Buku */}
          <Card className="border bg-card shadow-sm">
            <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
              {/* Cover - DIPERKECIL */}
              <div className="md:col-span-3 flex justify-start md:justify-center">
                <div className="w-full max-w-[130px] md:max-w-[170px] aspect-[3/4] rounded-lg overflow-hidden bg-muted relative shadow-sm">
                  {isLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : book?.book_image_url ? (
                    <img
                      src={book.book_image_url}
                      alt={book.book_title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <ImageOff size={26} />
                      <span className="text-xs">Tidak ada cover</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Meta */}
              <div className="md:col-span-9 space-y-6">
                {/* Title + Actions */}
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    {isLoading ? (
                      <>
                        <Skeleton className="h-7 w-64" />
                        <Skeleton className="h-4 w-40" />
                      </>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold tracking-tight">
                          {book?.book_title ?? "Buku tidak ditemukan"}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Penulis: {book?.book_author ?? "Tidak diketahui"}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-3 shrink-0">
                    <CActionsButton
                      onEdit={() =>
                        navigate(`edit`, {
                          state: { book }
                        })
                      }
                      onDelete={() => setDeleteOpen(true)}
                      loadingDelete={isDeleting}
                    />
                  </div>
                </div>

                <Separator />

                {/* Info Utama */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoBlock
                    label="Penerbit"
                    value={book?.book_publisher ?? "—"}
                  />
                  <InfoBlock
                    label="Tahun Terbit"
                    value={book?.book_publication_year ?? "—"}
                  />
                  <InfoBlock
                    label="Status"
                    value={
                      <CBadgeStatus
                        status={book?.book_is_deleted ? "inactive" : "active"}
                      />
                    }
                  />
                </div>

                {/* Link Pembelian */}
                <div className="pt-1">
                  <InfoBlock
                    label="Link Pembelian"
                    value={
                      book?.book_purchase_url ? (
                        <a
                          href={book.book_purchase_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:underline"
                        >
                          <ExternalLink size={14} /> Buka halaman pembelian
                        </a>
                      ) : (
                        "—"
                      )
                    }
                  />
                </div>

                {/* Tanggal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoBlock
                    label="Dibuat pada"
                    value={formatDate(book?.book_created_at)}
                  />
                  <InfoBlock
                    label="Terakhir diupdate"
                    value={formatDate(book?.book_updated_at)}
                  />
                </div>

                {/* Deskripsi */}
                {book?.book_desc && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Deskripsi
                    </div>
                    <p className="text-sm leading-relaxed">{book.book_desc}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pemakaian (berdasarkan include.class_subjects) */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base font-semibold inline-flex items-center gap-2">
                <BookOpen size={18} /> Dipakai di Mata Pelajaran / Kelas
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-4 md:p-6">
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-7 w-40" />
                  ))}
                </div>
              ) : !book ? (
                <p className="text-sm text-muted-foreground">
                  Buku tidak ditemukan.
                </p>
              ) : !book.class_subjects || book.class_subjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum terhubung ke mata pelajaran.
                </p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {book.class_subjects.map((cs) => (
                    <div
                      key={cs.class_subject_id}
                      className="px-3 py-1.5 rounded-md text-sm bg-muted hover:bg-muted/70 
                       border shadow-sm transition-all"
                    >
                      {" "}
                      {cs.class_subject_class_parent_name_cache ??
                        "Tanpa nama kelas"}{" "}
                      •{" "}
                      {cs.class_subject_subject_name_cache ??
                        "Tanpa nama mapel"}
                      {cs.class_subject_subject_code_cache && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({cs.class_subject_subject_code_cache})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <CDeleteDialog
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            loading={isDeleting}
            title={`Hapus buku "${book?.book_title ?? ""}"?`}
            description="Tindakan ini tidak dapat dibatalkan."
            onConfirm={() => deleteMutation.mutate()}
          />
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