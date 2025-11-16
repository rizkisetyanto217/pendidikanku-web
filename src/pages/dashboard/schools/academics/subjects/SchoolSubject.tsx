// src/pages/sekolahislamku/pages/academic/SchoolSubject.table.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "@/lib/axios";

/* icons */
import { ArrowLeft, ArrowUpDown, Loader2, AlertCircle } from "lucide-react";

/* ---------- BreadCrum ---------- */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* shadcn/ui */
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/* dialogs & inputs reused */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

/* re-use your DataTable */
import {
  DataTable,
  type ColumnDef,
} from "@/components/costum/table/CDataTable"; // ⬅️ sesuaikan path file CDataTable kamu

/* ================= Types ================= */
export type SubjectStatus = "active" | "inactive";

export type SubjectRow = {
  id: string; // subject_id
  code: string;
  name: string;
  status: SubjectStatus;
  class_count: number;
  total_hours_per_week: number | null;
  book_count: number;
  assignments: ClassSubjectItem[];
};

type SubjectsAPIItem = {
  subject_id: string;
  subject_school_id: string;
  subject_code: string | null;
  subject_name: string;
  subject_desc?: string | null;
  subject_slug?: string | null;
  subject_image_url?: string | null;
  subject_is_active: boolean;
  subject_created_at: string;
  subject_updated_at: string;
};

type SubjectsAPIResp = {
  data: SubjectsAPIItem[];
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
    count: number;
    per_page_options: number[];
  };
};

type ClassSubjectItem = {
  class_subject_id: string;
  class_subject_school_id: string;
  class_subject_parent_id: string;
  class_subject_subject_id: string;
  class_subject_slug: string;
  class_subject_order_index: number | null;
  class_subject_hours_per_week: number | null;
  class_subject_min_passing_score: number | null;
  class_subject_weight_on_report: number | null;
  class_subject_is_core: boolean | null;
  class_subject_subject_name_snapshot: string;
  class_subject_subject_code_snapshot: string | null;
  class_subject_subject_slug_snapshot: string | null;
  class_subject_subject_url_snapshot: string | null;
  class_subject_is_active: boolean;
  class_subject_created_at: string;
  class_subject_updated_at: string;
};

type ClassSubjectsAPIResp = {
  data: ClassSubjectItem[];
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
};

type ClassSubjectBookItem = {
  class_subject_book_id: string;
  class_subject_book_school_id: string;
  class_subject_book_class_subject_id: string;
  class_subject_book_book_id: string;
  class_subject_book_slug: string;
  class_subject_book_is_active: boolean;
  class_subject_book_book_title_snapshot: string;
  class_subject_book_book_author_snapshot: string | null;
  class_subject_book_book_slug_snapshot: string;
  class_subject_book_book_image_url_snapshot: string | null;
  class_subject_book_subject_id_snapshot: string;
  class_subject_book_subject_code_snapshot: string;
  class_subject_book_subject_name_snapshot: string;
  class_subject_book_subject_slug_snapshot: string;
  class_subject_book_created_at: string;
  class_subject_book_updated_at: string;
};

type CSBListResp = {
  data: ClassSubjectBookItem[];
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
};

/* ================= Const ================= */
const API_PREFIX = "/u"; // ⬅️ pakai API user-scope terbaru
const ADMIN_PREFIX = "/a";

/* ================= Helpers ================= */
const sumHours = (arr: ClassSubjectItem[]) => {
  const hrs = arr
    .map((x) => x.class_subject_hours_per_week ?? 0)
    .filter((n) => Number.isFinite(n));
  if (hrs.length === 0) return null;
  return hrs.reduce((a, b) => a + b, 0);
};

function useResolvedSchoolId() {
  const params = useParams<{ schoolId?: string; school_id?: string }>();
  const { search } = useLocation();
  const sp = useMemo(() => new URLSearchParams(search), [search]);
  return params.schoolId || params.school_id || sp.get("school_id") || "";
}

/* ================= Mutations ================= */
function useCreateSubjectMutation(school_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: FormData) => {
      const { data } = await axios.post(
        `${ADMIN_PREFIX}/${school_id}/subjects`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects-merged", school_id] });
    },
  });
}

function useUpdateSubjectMutation(school_id: string, subjectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: FormData) => {
      const { data } = await axios.patch(
        `${ADMIN_PREFIX}/${school_id}/subjects/${subjectId}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects-merged", school_id] });
    },
  });
}

function useDeleteSubjectMutation(school_id: string, subjectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete(
        `${ADMIN_PREFIX}/${school_id}/subjects/${subjectId}`
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects-merged", school_id] });
    },
  });
}

/* ================= Small UI ================= */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

/* ================= Detail Modal ================= */
function SubjectDetailDialog({
  open,
  subject,
  onClose,
}: {
  open: boolean;
  subject: SubjectRow | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail Mapel — {subject?.name}</DialogTitle>
          <DialogDescription>
            Informasi ringkas dan penugasan per kelas.
          </DialogDescription>
        </DialogHeader>

        {subject && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Kode" value={subject.code || "-"} />
              <InfoRow
                label="Status"
                value={
                  subject.status === "active" ? (
                    <Badge>Aktif</Badge>
                  ) : (
                    <Badge variant="secondary">Nonaktif</Badge>
                  )
                }
              />
              <InfoRow label="Jumlah Kelas" value={subject.class_count} />
              <InfoRow
                label="Total Jam/Minggu"
                value={
                  subject.total_hours_per_week != null
                    ? `${subject.total_hours_per_week}`
                    : "-"
                }
              />
              <InfoRow label="Jumlah Buku" value={subject.book_count} />
            </div>

            <div>
              <div className="font-semibold mb-2">Penugasan per Kelas</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[720px]">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="py-2 pr-3">Slug Kelas</th>
                      <th className="py-2 pr-3">Jam/Minggu</th>
                      <th className="py-2 pr-3">Passing</th>
                      <th className="py-2 pr-3">Bobot Rapor</th>
                      <th className="py-2 pr-3">Core</th>
                      <th className="py-2 pr-3">Aktif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subject.assignments.map((cs) => (
                      <tr key={cs.class_subject_id} className="border-b">
                        <td className="py-2 pr-3">
                          {cs.class_subject_slug || "-"}
                        </td>
                        <td className="py-2 pr-3">
                          {cs.class_subject_hours_per_week ?? "-"}
                        </td>
                        <td className="py-2 pr-3">
                          {cs.class_subject_min_passing_score ?? "-"}
                        </td>
                        <td className="py-2 pr-3">
                          {cs.class_subject_weight_on_report ?? "-"}
                        </td>
                        <td className="py-2 pr-3">
                          {cs.class_subject_is_core ? "Ya" : "Tidak"}
                        </td>
                        <td className="py-2 pr-3">
                          {cs.class_subject_is_active ? "Aktif" : "Nonaktif"}
                        </td>
                      </tr>
                    ))}
                    {subject.assignments.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-4 text-center text-muted-foreground"
                        >
                          Belum ditugaskan ke kelas manapun.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ================= Create/Edit/Delete Dialogs (reused) ================= */
function CreateSubjectDialog({
  open,
  schoolId,
  onClose,
}: {
  open: boolean;
  schoolId: string;
  onClose: () => void;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const createMutation = useCreateSubjectMutation(schoolId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    if (code.trim()) fd.append("subject_code", code.trim());
    fd.append("subject_name", name.trim());
    if (desc.trim()) fd.append("subject_desc", desc.trim());
    if (file) fd.append("file", file);
    await createMutation.mutateAsync(fd);
    onClose();
    setCode("");
    setName("");
    setDesc("");
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Tambah Mapel</DialogTitle>
          <DialogDescription>Isi detail mapel di bawah ini.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label>Kode (opsional)</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="B-Ing-1"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Nama *</Label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bahasa Inggris"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Deskripsi (opsional)</Label>
            <Textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Deskripsi singkat"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Gambar (opsional)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {createMutation.isError && (
            <div className="text-destructive text-sm">
              {(createMutation.error as any)?.message ??
                "Gagal membuat subject."}
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="gap-1"
            >
              {createMutation.isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditSubjectDialog({
  open,
  schoolId,
  subject,
  onClose,
}: {
  open: boolean;
  schoolId: string;
  subject: SubjectRow | null;
  onClose: () => void;
}) {
  const [code, setCode] = useState(subject?.code ?? "");
  const [name, setName] = useState(subject?.name ?? "");
  const [desc, setDesc] = useState<string>("");
  const [isActive, setIsActive] = useState(subject?.status === "active");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    setCode(subject?.code ?? "");
    setName(subject?.name ?? "");
    setIsActive(subject?.status === "active");
    setDesc("");
    setFile(null);
  }, [subject?.id]);

  const updateMutation = useUpdateSubjectMutation(schoolId, subject?.id ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) return;

    const fd = new FormData();
    fd.append("subject_name", name.trim());
    fd.append("subject_is_active", isActive ? "true" : "false");
    if (code.trim()) fd.append("subject_code", code.trim());
    if (desc.trim()) fd.append("subject_desc", desc.trim());
    if (file) fd.append("file", file);

    await updateMutation.mutateAsync(fd);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Mapel — {subject?.name}</DialogTitle>
          <DialogDescription>Perbarui informasi mapel.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label>Kode</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Nama *</Label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={isActive}
              onCheckedChange={(v) => setIsActive(Boolean(v))}
              id="is-active"
            />
            <Label htmlFor="is-active">Aktif</Label>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Deskripsi (opsional)</Label>
            <Textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Update deskripsi jika perlu"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Gambar (opsional — menimpa yang lama)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {updateMutation.isError && (
            <div className="text-destructive text-sm">
              {(updateMutation.error as any)?.message ??
                "Gagal mengubah subject."}
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="gap-1"
            >
              {updateMutation.isPending ? "Menyimpan…" : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmDeleteDialog({
  open,
  title,
  message,
  confirmLabel = "Hapus",
  loading = false,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end gap-2">
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={loading}>
            {loading ? "Menghapus…" : confirmLabel}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ================= Page (TABLE) ================= */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

const SchoolSubjectTable: React.FC<Props> = ({ showBack = false, backTo }) => {
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Mapel",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Akademik" },
        { label: "Mapel" },
      ],
      actions: null,
    });
  }, [setHeader]);

  const schoolId = useResolvedSchoolId();
  const [detailData, setDetailData] = useState<SubjectRow | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [editData, setEditData] = useState<SubjectRow | null>(null);
  const [deleteData, setDeleteData] = useState<SubjectRow | null>(null);

  // controls (mengikat ke DataTable)
  const [query, setQuery] = useState("");
  const [onlyActive] = useState<"1" | "0">("1");
  const [sortBy, setSortBy] = useState<
    "name-asc" | "name-desc" | "code-asc" | "code-desc"
  >("name-asc");

  const delMut = useDeleteSubjectMutation(schoolId ?? "", deleteData?.id ?? "");

  const mergedQ = useQuery({
    queryKey: ["subjects-merged", schoolId],
    enabled: !!schoolId,
    queryFn: async (): Promise<SubjectRow[]> => {
      const [subjectsResp, classSubjectsResp, booksResp] = await Promise.all([
        // 🔹 SUBJECTS — API BARU: GET /api/u/subjects/list
        axios
          .get<SubjectsAPIResp>(`${API_PREFIX}/subjects/list`, {
            params: { page: 1, per_page: 500 },
          })
          .then((r) => r.data),

        // 🔹 CLASS SUBJECTS — API BARU: GET /api/u/class-subjects/list
        axios
          .get<ClassSubjectsAPIResp>(`${API_PREFIX}/class-subjects/list`, {
            params: { page: 1, per_page: 1000 },
          })
          .then((r) => r.data),

        // 🔹 CLASS SUBJECT BOOKS — API BARU: GET /api/u/class-subject-books/list
        axios
          .get<CSBListResp>(`${API_PREFIX}/class-subject-books/list`, {
            params: { page: 1, per_page: 1000 },
          })
          .then((r) => r.data),
      ]);

      const classBySubject = new Map<string, ClassSubjectItem[]>();
      for (const cs of classSubjectsResp.data) {
        const key = cs.class_subject_subject_id;
        if (!classBySubject.has(key)) classBySubject.set(key, []);
        classBySubject.get(key)!.push(cs);
      }

      const bookCountBySubject = new Map<string, number>();
      for (const b of booksResp.data) {
        const sid = b.class_subject_book_subject_id_snapshot;
        bookCountBySubject.set(sid, (bookCountBySubject.get(sid) ?? 0) + 1);
      }

      const rows: SubjectRow[] = subjectsResp.data.map((s) => {
        const assignments = classBySubject.get(s.subject_id) ?? [];
        return {
          id: s.subject_id,
          code: s.subject_code ?? "",
          name: s.subject_name,
          status: s.subject_is_active ? "active" : "inactive",
          class_count: assignments.length,
          total_hours_per_week: sumHours(assignments),
          book_count: bookCountBySubject.get(s.subject_id) ?? 0,
          assignments,
        };
      });

      return rows;
    },
  });

  /* ===== transform -> filter + sort di layer tabel ===== */
  const rowsFilteredSorted = useMemo(() => {
    let arr = (mergedQ.data ?? []).slice();

    if (onlyActive === "1") {
      arr = arr.filter((s) => s.status === "active");
    }
    if (query.trim()) {
      const k = query.trim().toLowerCase();
      arr = arr.filter(
        (s) =>
          s.name.toLowerCase().includes(k) || s.code.toLowerCase().includes(k)
      );
    }

    const [key, dir] = (sortBy || "name-asc").split("-") as [
      "name" | "code",
      "asc" | "desc"
    ];
    const asc = dir !== "desc";
    arr.sort((a, b) => {
      const A = (key === "code" ? a.code : a.name).toLowerCase();
      const B = (key === "code" ? b.code : b.name).toLowerCase();
      if (A < B) return asc ? -1 : 1;
      if (A > B) return asc ? 1 : -1;
      return 0;
    });

    return arr;
  }, [mergedQ.data, query, onlyActive, sortBy]);

  /* ===== Columns ===== */
  const columns: ColumnDef<SubjectRow>[] = [
    {
      id: "code",
      header: "Kode",
      minW: "120px",
      cell: (r) => (r.code ? <span className="font-mono">{r.code}</span> : "-"),
    },
    {
      id: "name",
      header: "Nama",
      minW: "220px",
      cell: (r) => (
        <div>
          <div className="font-medium">{r.name}</div>
          <div className="text-[11px] text-muted-foreground">
            {r.assignments.length} kelas ditugaskan
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      minW: "120px",
      cell: (r) =>
        r.status === "active" ? (
          <Badge className="justify-center">Aktif</Badge>
        ) : (
          <Badge variant="secondary" className="justify-center">
            Nonaktif
          </Badge>
        ),
    },
    {
      id: "class_count",
      header: "Kelas",
      minW: "80px",
      cell: (r) => r.class_count,
    },
    {
      id: "total_hours_per_week",
      header: "Jam/Minggu",
      minW: "110px",
      cell: (r) => r.total_hours_per_week ?? "-",
    },
    {
      id: "book_count",
      header: "Buku",
      minW: "80px",
      cell: (r) => r.book_count,
    },
  ];

  /* ===== Right controls slot (status + sort + tombol tambah) ===== */
  const RightSlot = (
    <div className="flex items-center gap-2">
      <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
        <SelectTrigger className="h-9 w-[170px]" data-interactive>
          <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Urutkan" />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="name-asc">Nama A→Z</SelectItem>
          <SelectItem value="name-desc">Nama Z→A</SelectItem>
          <SelectItem value="code-asc">Kode A→Z</SelectItem>
          <SelectItem value="code-desc">Kode Z→A</SelectItem>
        </SelectContent>
      </Select>

      <Button className="gap-1" onClick={() => setOpenCreate(true)}>
        + Tambah
      </Button>
    </div>
  );

  return (
    <div className="w-full">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6">
          {/* Header minimal (back + title) */}
          <div className="flex items-center justify-between">
            <div className="md:flex hidden items-center gap-3">
              {showBack && (
                <Button
                  onClick={handleBack}
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer self-start"
                >
                  <ArrowLeft size={20} />
                </Button>
              )}
              <h1 className="font-semibold text-lg">Mapel</h1>
            </div>
          </div>

          {/* Loading / Error state di atas tabel (optional) */}
          {mergedQ.isLoading && (
            <Card>
              <CardContent className="p-6 text-center flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin" /> Memuat…
              </CardContent>
            </Card>
          )}
          {mergedQ.isError && (
            <Card>
              <CardContent className="p-6 text-center text-destructive flex items-center gap-2">
                <AlertCircle /> Gagal memuat data.
              </CardContent>
            </Card>
          )}

          {/* DataTable */}
          {!mergedQ.isLoading && !mergedQ.isError && (
            <DataTable<SubjectRow>
              defaultQuery={query}
              onQueryChange={setQuery}
              searchByKeys={["name", "code"]}
              searchPlaceholder="Cari nama/kode…"
              rows={rowsFilteredSorted}
              columns={columns}
              getRowId={(r) => r.id}
              loading={false}
              error={null}
              pageSize={30}
              pageSizeOptions={[20, 30, 50]}
              viewModes={["table", "card"]}
              defaultView="table"
              stickyHeader
              zebra
              rightSlot={RightSlot}
              enableActions
              actions={{
                mode: "menu",
                onView: (row) => navigate(`${row.id}`),
                onEdit: (row) => setEditData(row),
                onDelete: (row) => setDeleteData(row),
                labels: { view: "Detail", edit: "Edit", delete: "Hapus" },
                size: "sm",
              }}
              onRowClick={(row) => navigate(`${row.id}`)}
              storageKey="subjects.table.view"
              minTableWidth={880}
              renderCard={(r) => (
                <div className="rounded-xl border p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{r.name}</div>
                    {r.status === "active" ? (
                      <Badge>Aktif</Badge>
                    ) : (
                      <Badge variant="secondary">Nonaktif</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Kode: {r.code || "-"}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                    <div className="rounded border p-2">
                      <div className="text-xs text-muted-foreground">Kelas</div>
                      <div className="font-medium">{r.class_count}</div>
                    </div>
                    <div className="rounded border p-2">
                      <div className="text-xs text-muted-foreground">
                        Jam/Mgg
                      </div>
                      <div className="font-medium">
                        {r.total_hours_per_week ?? "-"}
                      </div>
                    </div>
                    <div className="rounded border p-2">
                      <div className="text-xs text-muted-foreground">Buku</div>
                      <div className="font-medium">{r.book_count}</div>
                    </div>
                  </div>
                </div>
              )}
            />
          )}
        </div>
      </main>

      {/* Dialogs */}
      <SubjectDetailDialog
        open={!!detailData}
        subject={detailData}
        onClose={() => setDetailData(null)}
      />

      {schoolId && (
        <CreateSubjectDialog
          open={openCreate}
          schoolId={schoolId}
          onClose={() => setOpenCreate(false)}
        />
      )}

      {schoolId && (
        <EditSubjectDialog
          open={!!editData}
          schoolId={schoolId}
          subject={editData}
          onClose={() => setEditData(null)}
        />
      )}

      <ConfirmDeleteDialog
        open={!!deleteData}
        title={`Hapus "${deleteData?.name}"?`}
        message="Yakin ingin menghapus pelajaran ini? Tindakan tidak dapat dibatalkan."
        confirmLabel={delMut.isPending ? "Menghapus…" : "Hapus"}
        loading={delMut.isPending}
        onClose={() => setDeleteData(null)}
        onConfirm={async () => {
          if (!schoolId || !deleteData) return;
          try {
            await delMut.mutateAsync();
          } finally {
            setDeleteData(null);
          }
        }}
      />
    </div>
  );
};

export default SchoolSubjectTable;