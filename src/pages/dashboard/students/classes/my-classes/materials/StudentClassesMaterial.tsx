// src/pages/sekolahislamku/pages/student/StudentMateri.tsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  BookOpen,
  Download,
  Search,
} from "lucide-react";

// shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ===== Utils ===== */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

type MaterialType = "pdf" | "doc" | "ppt" | "video" | "link";
type Material = {
  id: string;
  title: string;
  desc?: string;
  type: MaterialType;
  createdAt: string;
  author?: string;
  attachments?: { name: string; url?: string }[];
};

/* ===== Meta kelas (opsional, untuk judul) ===== */
const CLASS_META: Record<
  string,
  { name: string; room?: string; homeroom?: string }
> = {
  "tpa-a": { name: "TPA A", room: "Aula 1", homeroom: "Ustadz Abdullah" },
  "tpa-b": { name: "TPA B", room: "R. Tahfiz", homeroom: "Ustadz Salman" },
};

/* ===== Dummy materi per kelas (key by id dari MyClass) ===== */
const MATERIALS_BY_CLASS: Record<string, Material[]> = {
  "tpa-a": [
    {
      id: "m-001",
      title: "Mad Thabi'i — Ringkasan & Contoh",
      desc: "Definisi, cara membaca, dan contoh bacaan mad thabi'i.",
      type: "pdf",
      createdAt: new Date(Date.now() - 864e5).toISOString(),
      author: "Ustadz Abdullah",
      attachments: [{ name: "mad-thabii.pdf" }],
    },
    {
      id: "m-002",
      title: "Video: Makharijul Huruf (Ringkas)",
      desc: "Ringkasan tempat keluarnya huruf hijaiyah.",
      type: "video",
      createdAt: new Date().toISOString(),
      author: "Ustadzah Amina",
      attachments: [{ name: "YouTube", url: "https://youtu.be/dQw4w9WgXcQ" }],
    },
  ],
  "tpa-b": [
    {
      id: "m-101",
      title: "Target Hafalan Juz 30 (Pekan Ini)",
      desc: "Daftar ayat & target hafalan mingguan.",
      type: "ppt",
      createdAt: new Date(Date.now() - 2 * 864e5).toISOString(),
      author: "Ustadz Salman",
      attachments: [{ name: "target-hafalan.pptx" }],
    },
  ],
};

const typeBadge = (t: MaterialType) => {
  switch (t) {
    case "pdf":
      return { variant: "secondary" as const, label: "PDF" };
    case "doc":
      return { variant: "outline" as const, label: "DOC" };
    case "ppt":
      return { variant: "outline" as const, label: "PPT" };
    case "video":
      return { variant: "default" as const, label: "VIDEO" };
    case "link":
      return { variant: "secondary" as const, label: "LINK" };
  }
};

const StudentMaterial: React.FC = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();

  const classMeta = CLASS_META[id ?? ""] ?? { name: id ?? "-" };
  const allMaterials = MATERIALS_BY_CLASS[id ?? ""] ?? [];

  /* Search/filter */
  const [q, setQ] = useState("");
  const materials = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return allMaterials;
    return allMaterials.filter(
      (m) =>
        m.title.toLowerCase().includes(key) ||
        (m.desc ?? "").toLowerCase().includes(key) ||
        (m.author ?? "").toLowerCase().includes(key)
    );
  }, [q, allMaterials]);

  const goBackToList = () =>
    navigate(`/${slug}/murid/menu-utama/my-class`, { replace: false });

  const handleDownload = (m: Material) => {
    const att = m.attachments?.[0];
    if (!att) {
      alert("Belum ada lampiran untuk materi ini.");
      return;
    }
    if (att.url) {
      window.open(att.url, "_blank", "noopener,noreferrer");
      return;
    }
    // Fallback: buat file dummy agar UX unduh tetap ada
    const blob = new Blob(
      [
        `Materi: ${m.title}\n\nIni adalah placeholder untuk lampiran "${att.name}".`,
      ],
      { type: "text/plain;charset=utf-8" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = att.name || `${m.title}.txt`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();
  };

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full px-4 md:px-6 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Content */}
          <div className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Back inline */}
            <div className="md:flex hidden gap-3 items-center">
              <Button variant="ghost" onClick={goBackToList}>
                <ArrowLeft size={20} />
              </Button>
              <h1 className="text-lg font-semibold">Materi Kelas</h1>
            </div>

            {/* Header + Search */}
            <Card>
              <CardContent className="p-4 md:p-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-primary" />
                  <div>
                    <div className="font-semibold">
                      Daftar Materi — {classMeta.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {classMeta.room ? `${classMeta.room} • ` : ""}
                      {classMeta.homeroom ? `Wali: ${classMeta.homeroom}` : ""}
                    </div>
                  </div>
                </div>

                <div className="relative w-full md:w-80">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
                  />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari judul/penjelasan/penulis…"
                    className="pl-9"
                  />
                </div>
              </CardContent>
            </Card>

            {/* List materi */}
            <div className="grid gap-3">
              {materials.map((m) => {
                const b = typeBadge(m.type);
                return (
                  <Card key={m.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="truncate">{m.title}</span>
                        <Badge variant={b.variant} className="h-6 shrink-0">
                          {b.label}
                        </Badge>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="px-4 md:px-5 pb-4">
                      {m.desc && (
                        <p className="text-sm text-muted-foreground">
                          {m.desc}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays size={14} />
                        <span>Dibuat: {dateLong(m.createdAt)}</span>
                        {m.author && <span>• Oleh {m.author}</span>}
                        {m.attachments?.length ? (
                          <>
                            <span>•</span>
                            <span>{m.attachments.length} lampiran</span>
                          </>
                        ) : null}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t pt-3">
                        <div className="text-sm text-muted-foreground">
                          Aksi
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(m)}
                          >
                            <Download size={16} className="mr-1" />
                            Unduh
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {materials.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-sm text-center text-muted-foreground">
                    Belum ada materi untuk kelas ini.
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tombol kembali (mobile) */}
            <div className="md:hidden">
              <Button
                variant="outline"
                onClick={goBackToList}
                className="inline-flex gap-2"
              >
                <ArrowLeft size={16} /> Kembali ke Kelas
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentMaterial;
