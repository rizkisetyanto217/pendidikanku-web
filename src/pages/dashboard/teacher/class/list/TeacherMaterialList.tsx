// src/pages/sekolahislamku/teacher/MaterialsClass.shadcn.tsx
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Search,
  Filter,
  Plus,
  CalendarDays,
  Copy,
  Check,
  Pencil,
  Trash2,
  MoreVertical,
  FileText,
  Link as LinkIcon,
  PlayCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

/* =========================================================
   TYPES
========================================================= */
type MaterialType = "article" | "file" | "link" | "youtube";

export type Material = {
  id: string;
  classId: string;
  title: string;
  type: MaterialType;
  createdAt: string;
  updatedAt?: string;
  author?: string;

  // optional fields by type
  description?: string;
  content?: string; // article body (markdown/plain)
  url?: string; // link / file / youtube url
  fileName?: string; // for file
  fileSize?: number; // for file (bytes)
};

type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";
type NextSession = {
  dateISO: string;
  time: string;
  title: string;
  room?: string;
};
type TeacherClassSummary = {
  id: string;
  name: string;
  room?: string;
  homeroom: string;
  assistants?: string[];
  studentsCount: number;
  todayAttendance: Record<AttendanceStatus, number>;
  nextSession?: NextSession;
  materialsCount: number;
  assignmentsCount: number;
  academicTerm: string;
  cohortYear: number;
};

/* =========================================================
   DUMMY FETCHERS (ganti ke API saat siap)
========================================================= */
const mkISO = (d = new Date()) => d.toISOString();

async function fetchTeacherClasses(): Promise<TeacherClassSummary[]> {
  const now = new Date();
  const mkd = (add = 0) => {
    const x = new Date(now);
    x.setDate(x.getDate() + add);
    return x.toISOString();
  };
  return Promise.resolve([
    {
      id: "tpa-a",
      name: "TPA A",
      room: "Aula 1",
      homeroom: "Ustadz Abdullah",
      assistants: ["Ustadzah Amina"],
      studentsCount: 22,
      todayAttendance: { hadir: 18, online: 1, sakit: 1, izin: 1, alpa: 1 },
      nextSession: {
        dateISO: mkd(0),
        time: "07:30",
        title: "Tahsin — Tajwid & Makhraj",
        room: "Aula 1",
      },
      materialsCount: 12,
      assignmentsCount: 4,
      academicTerm: "2025/2026 — Ganjil",
      cohortYear: 2025,
    },
  ]);
}

async function fetchMaterialsByClass(classId: string): Promise<Material[]> {
  // status ditiadakan (sesuai tipe Material sekarang)
  return Promise.resolve([
    {
      id: "m-1",
      classId,
      title: "Artikel: Adab Menuntut Ilmu",
      type: "article",
      createdAt: mkISO(),
      author: "Ustadz Abdullah",
      description: "Ringkasan adab belajar untuk santri.",
      content:
        "Bismillah. Beberapa adab menuntut ilmu: ikhlas, menghormati guru, disiplin waktu, dan mengamalkan ilmu.",
    },
    {
      id: "m-2",
      classId,
      title: "PDF: Tajwid Dasar",
      type: "file",
      createdAt: mkISO(),
      author: "Ustadzah Amina",
      url: "https://example.com/tajwid-dasar.pdf",
      fileName: "tajwid-dasar.pdf",
      fileSize: 325_120,
      description: "Modul tajwid huruf makhraj.",
    },
    {
      id: "m-3",
      classId,
      title: "Link: Website Belajar Qur'an",
      type: "link",
      createdAt: mkISO(),
      url: "https://quran.com",
      description: "Rujukan bacaan dan tafsir.",
    },
    {
      id: "m-4",
      classId,
      title: "YouTube: Makhraj Huruf Hijaiyah",
      type: "youtube",
      createdAt: mkISO(),
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "Video penjelasan makhraj huruf.",
    },
  ]);
}

/* =========================================================
   HELPERS
========================================================= */
const QK = {
  CLASSES: ["teacher", "classes"] as const,
  MATERIALS: (classId: string) => ["class", classId, "materials"] as const,
};

const bytesToHuman = (n?: number) => {
  if (!n && n !== 0) return "-";
  if (n < 1024) return `${n} B`;
  const k = 1024;
  const sizes = ["KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  const v = n / Math.pow(k, i + 1);
  return `${v.toFixed(1)} ${sizes[i]}`;
};

const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

function extractYouTubeId(url?: string) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const segs = u.pathname.split("/");
      const idx = segs.findIndex((s) => s === "embed");
      if (idx >= 0 && segs[idx + 1]) return segs[idx + 1];
    }
  } catch {}
  return null;
}

const typeIcon = (t: MaterialType) =>
  t === "article" ? (
    <FileText className="h-4 w-4" />
  ) : t === "file" ? (
    <Download className="h-4 w-4" />
  ) : t === "link" ? (
    <LinkIcon className="h-4 w-4" />
  ) : (
    <PlayCircle className="h-4 w-4" />
  );

/* =========================================================
   ADD / EDIT MODALS
========================================================= */
type AddMaterialPayload = {
  title: string;
  type: MaterialType;
  description?: string;
  content?: string;
  url?: string;
  fileName?: string;
  fileSize?: number;
};
type EditMaterialPayload = AddMaterialPayload;

function AddMaterialDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (p: AddMaterialPayload) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<MaterialType>("article");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState<number | undefined>(undefined);

  const reset = () => {
    setTitle("");
    setType("article");
    setDescription("");
    setContent("");
    setUrl("");
    setFileName("");
    setFileSize(undefined);
  };

  const submit = () => {
    onSubmit({
      title: title.trim(),
      type,
      description: description.trim() || undefined,
      content: type === "article" ? content : undefined,
      url: type !== "article" ? url.trim() || undefined : undefined,
      fileName: type === "file" ? fileName.trim() || undefined : undefined,
      fileSize: type === "file" ? fileSize : undefined,
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Tambah Materi</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="mtitle">Judul</Label>
            <Input
              id="mtitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Jenis</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as MaterialType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Artikel</SelectItem>
                  <SelectItem value="file">File / PDF</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="mdesc">Deskripsi (opsional)</Label>
            <Textarea
              id="mdesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {type === "article" && (
            <div className="grid gap-2">
              <Label htmlFor="mcontent">Isi Artikel</Label>
              <Textarea
                id="mcontent"
                rows={8}
                placeholder="Tulis artikel (markdown/plain)…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          )}

          {(type === "link" || type === "youtube") && (
            <div className="grid gap-2">
              <Label htmlFor="murl">
                {type === "youtube" ? "URL YouTube" : "URL"}
              </Label>
              <Input
                id="murl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
          )}

          {type === "file" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="mfileurl">URL File</Label>
                <Input
                  id="mfileurl"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://…/dokumen.pdf"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mfilename">Nama File</Label>
                <Input
                  id="mfilename"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="dokumen.pdf"
                />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="mfilesize">Ukuran (byte) – opsional</Label>
                <Input
                  id="mfilesize"
                  type="number"
                  value={fileSize ?? ""}
                  onChange={(e) =>
                    setFileSize(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="contoh: 325120"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={submit} disabled={!title.trim()}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditMaterialDialog({
  open,
  onClose,
  defaultValues,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  defaultValues?: EditMaterialPayload;
  onSubmit: (p: EditMaterialPayload) => void;
}) {
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [type, setType] = useState<MaterialType>(
    defaultValues?.type ?? "article"
  );
  const [description, setDescription] = useState(
    defaultValues?.description ?? ""
  );
  const [content, setContent] = useState(defaultValues?.content ?? "");
  const [url, setUrl] = useState(defaultValues?.url ?? "");
  const [fileName, setFileName] = useState(defaultValues?.fileName ?? "");
  const [fileSize, setFileSize] = useState<number | undefined>(
    defaultValues?.fileSize
  );

  if (open && defaultValues && title !== defaultValues.title) {
    setTitle(defaultValues.title ?? "");
    setType(defaultValues.type ?? "article");
    setDescription(defaultValues.description ?? "");
    setContent(defaultValues.content ?? "");
    setUrl(defaultValues.url ?? "");
    setFileName(defaultValues.fileName ?? "");
    setFileSize(defaultValues.fileSize);
  }

  const submit = () => {
    onSubmit({
      title: title.trim(),
      type,
      description: description.trim() || undefined,
      content: type === "article" ? content : undefined,
      url: type !== "article" ? url.trim() || undefined : undefined,
      fileName: type === "file" ? fileName.trim() || undefined : undefined,
      fileSize: type === "file" ? fileSize : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Materi</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="mtitle">Judul</Label>
            <Input
              id="mtitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Jenis</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as MaterialType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Artikel</SelectItem>
                  <SelectItem value="file">File / PDF</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="mdesc">Deskripsi (opsional)</Label>
            <Textarea
              id="mdesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {type === "article" && (
            <div className="grid gap-2">
              <Label htmlFor="mcontent">Isi Artikel</Label>
              <Textarea
                id="mcontent"
                rows={8}
                placeholder="Tulis artikel (markdown/plain)…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          )}

          {(type === "link" || type === "youtube") && (
            <div className="grid gap-2">
              <Label htmlFor="murl">
                {type === "youtube" ? "URL YouTube" : "URL"}
              </Label>
              <Input
                id="murl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
          )}

          {type === "file" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="mfileurl">URL File</Label>
                <Input
                  id="mfileurl"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://…/dokumen.pdf"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mfilename">Nama File</Label>
                <Input
                  id="mfilename"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="dokumen.pdf"
                />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="mfilesize">Ukuran (byte) – opsional</Label>
                <Input
                  id="mfilesize"
                  type="number"
                  value={fileSize ?? ""}
                  onChange={(e) =>
                    setFileSize(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="contoh: 325120"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={submit} disabled={!title.trim()}>
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
   PAGE (TABLE for md+, CARDS for mobile)
========================================================= */
export default function TeacherMaterialList() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // kelas
  const { data: classes = [] } = useQuery({
    queryKey: QK.CLASSES,
    queryFn: fetchTeacherClasses,
    staleTime: 5 * 60_000,
  });
  const cls = useMemo(() => classes.find((c) => c.id === id), [classes, id]);

  // materials
  const { data: materials = [], isFetching } = useQuery({
    queryKey: QK.MATERIALS(id),
    queryFn: () => fetchMaterialsByClass(id),
    enabled: !!id,
    staleTime: 2 * 60_000,
  });

  // filter & search
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | MaterialType>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = materials;
    if (type !== "all") list = list.filter((m) => m.type === type);
    const qq = q.trim().toLowerCase();
    if (qq) {
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(qq) ||
          (m.description ?? "").toLowerCase().includes(qq)
      );
    }
    return [...list].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    );
  }, [materials, q, type]);

  // dialog states
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);

  const editDefaults = useMemo(() => {
    if (!editing) return undefined;
    const { title, type, description, content, url, fileName, fileSize } =
      editing;
    return {
      title,
      type,
      description,
      content,
      url,
      fileName,
      fileSize,
    } as EditMaterialPayload;
  }, [editing]);

  const handleAddSubmit = (p: AddMaterialPayload) => {
    const nowISO = new Date().toISOString();
    const item: Material = {
      id: `m-${Date.now()}`,
      classId: id,
      title: p.title,
      type: p.type,
      description: p.description,
      content: p.content,
      url: p.url,
      fileName: p.fileName,
      fileSize: p.fileSize,
      createdAt: nowISO,
      author: cls?.homeroom ?? "Guru",
    };
    qc.setQueryData<Material[]>(QK.MATERIALS(id), (old = []) => [item, ...old]);
    setOpenAdd(false);
  };

  const handleEditSubmit = (p: EditMaterialPayload) => {
    qc.setQueryData<Material[]>(QK.MATERIALS(id), (old = []) =>
      old.map((m) =>
        m.id !== editing?.id
          ? m
          : {
              ...m,
              title: p.title,
              type: p.type,
              description: p.description,
              content: p.content,
              url: p.url,
              fileName: p.fileName,
              fileSize: p.fileSize,
              updatedAt: new Date().toISOString(),
            }
      )
    );
    setOpenEdit(false);
    setEditing(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    qc.setQueryData<Material[]>(QK.MATERIALS(id), (old = []) =>
      old.filter((x) => x.id !== targetId)
    );
    setDeleteTarget(null);
  };

  const onEdit = (m: Material) => {
    setEditing(m);
    setOpenEdit(true);
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyShare = async (m: Material) => {
    const shareUrl =
      m.url || `${window.location.origin}/class/${id}/materials/${m.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(m.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      const el = document.createElement("textarea");
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedId(m.id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  return (
    <div className="w-full">
      {/* Header actions */}
      <div className="px-4 md:px-6 pt-4 md:pt-6">
        <div className="w-full flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold tracking-tight">
            {cls ? `Materi: ${cls.name}` : "Materi Kelas"}
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenAdd(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Materi
            </Button>
          </div>
        </div>
      </div>

      {/* Add & Edit */}
      <AddMaterialDialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddSubmit}
      />
      <EditMaterialDialog
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setEditing(null);
        }}
        defaultValues={editDefaults}
        onSubmit={handleEditSubmit}
      />

      {/* AlertDialog Hapus */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus materi?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `“${deleteTarget.title}” akan dihapus dan tidak dapat dikembalikan.`
                : "Materi akan dihapus."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* FILTERS */}
      <div className="w-full px-4 md:px-6">
        <Card className="mb-6">
          <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="sr-only">
                Cari materi
              </Label>
              <div className="flex items-center gap-3 h-10 rounded-md border px-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari materi…"
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="sr-only">Filter jenis</Label>
              <div className="flex items-center gap-3 h-10">
                <div className="h-10 aspect-square grid place-items-center rounded-md border">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                </div>
                <Select value={type} onValueChange={(v) => setType(v as any)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Semua jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua jenis</SelectItem>
                    <SelectItem value="article">Artikel</SelectItem>
                    <SelectItem value="file">File/PDF</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DESKTOP/TABLET: TABLE (md+) */}
      <div className="hidden md:block px-4 md:px-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[38%]">Judul</TableHead>
                  <TableHead className="w-[12%]">Jenis</TableHead>
                  <TableHead className="w-[18%]">Dibuat</TableHead>
                  <TableHead className="w-[18%]">Author</TableHead>
                  <TableHead className="w-[14%] text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => {
                  const ytId =
                    m.type === "youtube" ? extractYouTubeId(m.url) : null;
                  return (
                    <TableRow key={m.id} className="align-top">
                      <TableCell>
                        <div className="font-medium truncate">{m.title}</div>
                        {m.description && (
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {m.description}
                          </div>
                        )}
                        {m.type !== "article" && m.url && (
                          <a
                            className="text-xs underline break-all text-muted-foreground"
                            href={
                              m.type === "youtube" && ytId
                                ? `https://www.youtube.com/watch?v=${ytId}`
                                : m.url
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            {m.url}
                          </a>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          {typeIcon(m.type)}
                          <span className="capitalize">{m.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {dateLong(m.createdAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {m.author ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex flex-wrap gap-2 justify-end">
                          {m.url && (
                            <a
                              href={m.url}
                              target="_blank"
                              rel="noreferrer"
                              className="break-all"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                              >
                                {m.type === "file" ? (
                                  <Download className="h-4 w-4" />
                                ) : (
                                  <ExternalLink className="h-4 w-4" />
                                )}
                                {m.type === "file" ? "Unduh" : "Buka"}
                              </Button>
                            </a>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => copyShare(m)}
                            title="Salin tautan materi"
                          >
                            {copiedId === m.id ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            {copiedId === m.id ? "Disalin" : "Salin"}
                          </Button>
                          <Link to={`../material/${m.id}`} relative="path">
                            <Button size="sm" className="gap-2">
                              Buka <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-2"
                            onClick={() => onEdit(m)}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-2"
                            onClick={() => setDeleteTarget(m)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filtered.length === 0 && !isFetching && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      Belum ada materi untuk kelas ini.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* MOBILE: CARDS (< md) */}
      <div className="md:hidden px-4 pb-8 space-y-4">
        {isFetching && filtered.length === 0 && (
          <Card>
            <CardContent className="p-8">
              <div className="text-sm text-muted-foreground text-center">
                Memuat materi…
              </div>
            </CardContent>
          </Card>
        )}

        {filtered.map((m) => {
          const ytId = m.type === "youtube" ? extractYouTubeId(m.url) : null;

          return (
            <Card key={m.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3 break-words">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">
                      {m.title}
                    </CardTitle>
                    {m.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {m.description}
                      </p>
                    )}
                  </div>

                  {/* Kebab menu (mobile actions) */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Aksi materi"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem asChild>
                        <Link
                          to={`../material/${m.id}`}
                          className="flex items-center gap-2"
                        >
                          <ChevronRight className="h-4 w-4" /> Buka
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onEdit(m)}
                        className="flex items-center gap-2"
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(m)}
                        className="flex items-center gap-2 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3 break-words">
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>Dibuat: {dateLong(m.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {typeIcon(m.type)}{" "}
                    <span className="capitalize">{m.type}</span>
                  </div>
                  {m.author && <span>• Oleh {m.author}</span>}
                  {m.type === "file" && (
                    <span>
                      • {m.fileName ?? "file"}{" "}
                      {m.fileSize ? `(${bytesToHuman(m.fileSize)})` : ""}
                    </span>
                  )}
                </div>

                {/* Preview ringkas */}
                {m.type === "article" && m.content && (
                  <div className="text-sm border rounded-md p-3 bg-muted/30 max-h-40 overflow-auto">
                    {m.content}
                  </div>
                )}

                {m.type === "link" && m.url && (
                  <div className="text-sm">
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 underline break-all"
                    >
                      Buka tautan <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}

                {m.type === "file" && m.url && (
                  <div className="text-sm">
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 underline break-all"
                    >
                      Buka file <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}

                {m.type === "youtube" && ytId && (
                  <>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <a
                        href={`https://www.youtube.com/watch?v=${ytId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 underline break-all"
                      >
                        Buka di YouTube <ExternalLink className="h-4 w-4" />
                      </a>

                      <Button
                        variant="ghost"
                        size="sm"
                        aria-expanded={expandedId === m.id}
                        onClick={() =>
                          setExpandedId(expandedId === m.id ? null : m.id)
                        }
                      >
                        {expandedId === m.id ? "Tutup Preview" : "Preview"}
                      </Button>
                    </div>

                    {expandedId === m.id && (
                      <div className="w-full mt-2">
                        <div className="aspect-video w-full overflow-hidden rounded-md border">
                          <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${ytId}`}
                            title={m.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>

              <CardFooter className="flex flex-wrap gap-2">
                {m.url && (
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all"
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      {m.type === "file" ? (
                        <Download className="h-4 w-4" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                      {m.type === "file" ? "Unduh / Buka" : "Buka"}
                    </Button>
                  </a>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => copyShare(m)}
                  title="Salin tautan materi"
                >
                  {copiedId === m.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copiedId === m.id ? "Disalin" : "Salin Link"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}

        {filtered.length === 0 && !isFetching && (
          <Card>
            <CardContent className="p-8">
              <div className="text-sm text-muted-foreground text-center">
                Belum ada materi untuk kelas ini.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
