// src/pages/sekolahislamku/teacher/TeacherCSSTMaterialList.tsx
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
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
  FileText,
  Link as LinkIcon,
  PlayCircle,
} from "lucide-react";

/* shadcn/ui */
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

/* DataTable reusable */
import {
  DataTable,
  type ColumnDef,
} from "@/components/costum/table/CDataTable";

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

  description?: string;
  content?: string;
  url?: string;
  fileName?: string;
  fileSize?: number;
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
   DUMMY FETCHERS
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

const TypeIcon = ({ t }: { t: MaterialType }) =>
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
   PAGE (pakai DataTable)
========================================================= */
export default function TeacherCSSTMaterialList() {
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

  // delete
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    qc.setQueryData<Material[]>(QK.MATERIALS(id), (old = []) =>
      old.filter((x) => x.id !== targetId)
    );
    setDeleteTarget(null);
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyShare = async (m: Material) => {
    const shareUrl =
      m.url || `${window.location.origin}/class/${id}/materials/${m.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const el = document.createElement("textarea");
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    } finally {
      setCopiedId(m.id);
      setTimeout(() => setCopiedId(null), 1200);
    }
  };

  /* =========================
     DataTable columns
  ========================= */
  const columns = useMemo<ColumnDef<Material>[]>(() => {
    const TitleCell = (m: Material) => {
      const ytId = m.type === "youtube" ? extractYouTubeId(m.url) : null;
      return (
        <div className="text-left space-y-1 max-w-[42ch]">
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
              data-no-row-click
            >
              {m.url}
            </a>
          )}
        </div>
      );
    };

    const TypeCell = (m: Material) => (
      <div className="inline-flex items-center gap-2">
        <TypeIcon t={m.type} />
        <span className="capitalize">{m.type}</span>
      </div>
    );

    return [
      {
        id: "title",
        header: "Judul",
        cell: TitleCell,
        align: "left",
        minW: "320px",
      },
      { id: "type", header: "Jenis", cell: TypeCell, minW: "120px" },
      {
        id: "createdAt",
        header: "Dibuat",
        cell: (m: Material) => dateLong(m.createdAt),
        minW: "180px",
      },
      {
        id: "author",
        header: "Author",
        cell: (m: Material) => m.author ?? "—",
        minW: "160px",
      },
    ];
  }, []);

  /* =========================
     Card renderer (mobile / card view)
  ========================= */
  const renderCard = (m: Material) => {
    const ytId = m.type === "youtube" ? extractYouTubeId(m.url) : null;
    return (
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base truncate">{m.title}</CardTitle>
          {m.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {m.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{dateLong(m.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <TypeIcon t={m.type} />
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

          {m.type === "article" && m.content && (
            <div className="text-sm border rounded-md p-3 bg-muted/30 max-h-40 overflow-auto">
              {m.content}
            </div>
          )}

          {(m.type === "link" || m.type === "file") && m.url && (
            <div className="text-sm">
              <a
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 underline break-all"
              >
                Buka {m.type === "file" ? "file" : "tautan"}{" "}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}

          {m.type === "youtube" && ytId && (
            <div className="aspect-video w-full overflow-hidden rounded-md border">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${ytId}`}
                title={m.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
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
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                data-no-row-click
              >
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
            onClick={(e) => {
              e.stopPropagation();
              copyShare(m);
            }}
            data-no-row-click
            title="Salin tautan materi"
          >
            {copiedId === m.id ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copiedId === m.id ? "Disalin" : "Salin Link"}
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`edit/${m.id}`);
            }}
            data-no-row-click
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(m);
            }}
            data-no-row-click
          >
            <Trash2 className="h-4 w-4" />
            Hapus
          </Button>
        </CardFooter>
      </Card>
    );
  };

  /* =========================
     Render
  ========================= */
  return (
    <div className="w-full bg-background text-foreground py-6">
      <main className="mx-auto space-y-6">
        {/* Header actions */}
        <div className="flex items-center justify-between">
          <div className="w-full flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-lg font-semibold tracking-tight">
              {cls ? `Materi: ${cls.name}` : "Materi Kelas"}
            </h1>
            <div className="ml-auto flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("new")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Materi
              </Button>
            </div>
          </div>
        </div>

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

        {/* DATATABLE */}
        <div className="px-4 md:px-6 pb-8">
          <DataTable<Material>
            title="Daftar Materi"
            defaultQuery={q}
            onQueryChange={setQ}
            searchByKeys={["title", "description", "author"]}
            columns={columns}
            rows={filtered}
            getRowId={(m: Material) => m.id}
            stickyHeader
            zebra
            viewModes={["table", "card"]}
            defaultView="table"
            renderCard={renderCard}
            onRowClick={(m: Material) => navigate(`edit/${m.id}`)}
            rightSlot={
              isFetching ? (
                <span className="text-xs text-muted-foreground">Memuat…</span>
              ) : null
            }
            renderActions={(m: Material) => (
              <div className="flex items-center justify-center gap-2">
                {m.url && (
                  <a href={m.url} target="_blank" rel="noreferrer">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      data-no-row-click
                      title={m.type === "file" ? "Unduh file" : "Buka tautan"}
                    >
                      {m.type === "file" ? (
                        <Download className="h-4 w-4" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                    </Button>
                  </a>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  data-no-row-click
                  onClick={() => navigate(`edit/${m.id}`)}
                  title="Edit materi"
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  data-no-row-click
                  onClick={() => setDeleteTarget(m)}
                  title="Hapus materi"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            rowHover
            emptySlot={
              <div className="text-sm text-muted-foreground">
                Belum ada materi untuk kelas ini.
              </div>
            }
          />
        </div>
      </main>
    </div>
  );
}
