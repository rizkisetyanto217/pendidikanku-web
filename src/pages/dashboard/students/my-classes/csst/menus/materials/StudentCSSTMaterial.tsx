// src/pages/sekolahislamku/student/StudentCSSTMaterialList.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

/* icons */
import {
  ArrowLeft,
  Download,
  ExternalLink,
  CalendarDays,
  Copy,
  Check,
  FileText,
  Link as LinkIcon,
  PlayCircle,
  Clock,
  CheckCircle2,
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

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
// import api from "@/lib/axios";

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

  // Udemy-style meta
  sectionId: string;
  sectionTitle: string;
  sectionOrder: number;
  lectureOrder: number;
  durationMinutes?: number;
  isCompleted?: boolean;
  isPreview?: boolean;
};

type Section = {
  id: string;
  title: string;
  order: number;
  lectures: Material[];
};

/* =========================================================
   DUMMY FETCHER — versi "Udemy style"
========================================================= */

// bikin tanggal beda-beda dikit biar realistis
const mkISO = (offsetDays = 0, offsetMinutes = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setMinutes(d.getMinutes() + offsetMinutes);
  return d.toISOString();
};

async function fetchMaterialsByClass(classId: string): Promise<Material[]> {
  // TODO: ganti ke API:
  // const res = await api.get(
  //   `/api/u/class-section-subject-teachers/${classId}/materials`
  // );
  // return res.data.data as Material[];

  return Promise.resolve<Material[]>([
    /* =============================
       Section 1 — Pendahuluan & Adab
    ============================= */
    {
      id: "m-vid-intro",
      classId,
      title: "Pengantar Kelas: Adab & Tata Cara Belajar",
      type: "youtube",
      createdAt: mkISO(-7),
      author: "Ustadz Abdullah",
      url: "https://www.youtube.com/watch?v=UtS63Aur2dU",
      description:
        "Video pengantar kelas yang menjelaskan tujuan, adab, dan ritme belajar di kelas ini.",
      content:
        "Di video ini ustadz menjelaskan gambaran besar materi yang akan dipelajari, cara memaksimalkan kelas online, adab terhadap ilmu dan guru, serta tips manajemen waktu agar santri bisa istiqamah belajar setiap pekan.",
      sectionId: "sec-1",
      sectionTitle: "Pendahuluan Kelas & Adab Menuntut Ilmu",
      sectionOrder: 1,
      lectureOrder: 1,
      durationMinutes: 10,
      isPreview: true,
      isCompleted: false,
    },
    {
      id: "m-art-1",
      classId,
      title: "Artikel: Adab Menuntut Ilmu — Ikhlas & Niat",
      type: "article",
      createdAt: mkISO(-6, 10),
      author: "Ustadz Abdullah",
      description:
        "Pembahasan fokus tentang niat, keikhlasan, dan bahaya riya dalam menuntut ilmu.",
      content:
        "Bismillah. Niat adalah ruh dari setiap amal. Seorang penuntut ilmu wajib meluruskan niatnya: belajar untuk mencari ridha Allah Ta'ala, mengangkat kebodohan dari diri sendiri dan orang lain, serta menjaga agama ini dengan ilmu yang benar.\n\nDi antara bentuk niat yang salah adalah belajar agar dipuji, dianggap hebat, atau untuk mengalahkan orang lain dalam debat. Ulama salaf sangat keras mengingatkan bahaya riya, sum'ah, dan ujub dalam majelis ilmu.\n\nTips praktis:\n- Perbarui niat sebelum mulai pelajaran.\n- Baca doa sebelum belajar.\n- Hindari membanggakan diri dengan ilmu yang dimiliki.\n- Jadikan ilmu sebagai jalan amal, bukan sekadar wawasan.",
      sectionId: "sec-1",
      sectionTitle: "Pendahuluan Kelas & Adab Menuntut Ilmu",
      sectionOrder: 1,
      lectureOrder: 2,
      durationMinutes: 15,
      isCompleted: false,
    },
    {
      id: "m-art-2",
      classId,
      title: "Artikel: Menghormati Guru dan Teman Belajar",
      type: "article",
      createdAt: mkISO(-5, 30),
      author: "Ustadzah Amina",
      description:
        "Adab terhadap guru dan sesama penuntut ilmu, baik di kelas offline maupun online.",
      content:
        "Di antara adab terhadap guru adalah mendengarkan dengan sungguh-sungguh, tidak memotong pembicaraan, menjaga tutur kata di chat, serta mendoakan kebaikan untuk guru secara sembunyi-sembunyi.\n\nAdapun kepada sesama penuntut ilmu: tidak meremehkan, tidak menertawakan pertanyaan yang dianggap sepele, dan saling membantu dalam memahami materi. Majelis ilmu adalah tempat saling menguatkan, bukan saling menjatuhkan.",
      sectionId: "sec-1",
      sectionTitle: "Pendahuluan Kelas & Adab Menuntut Ilmu",
      sectionOrder: 1,
      lectureOrder: 3,
      durationMinutes: 12,
      isCompleted: false,
    },

    /* =============================
       Section 2 — Modul Tajwid
    ============================= */
    {
      id: "m-file-tajwid",
      classId,
      title: "Modul PDF: Tajwid Dasar — Makharijul Huruf",
      type: "file",
      createdAt: mkISO(-4),
      author: "Ustadzah Amina",
      url: "https://example.com/tajwid-dasar.pdf",
      fileName: "tajwid-dasar-makharijul-huruf.pdf",
      fileSize: 325_120,
      description:
        "Modul tajwid untuk mengenal makhraj huruf, disertai contoh dan latihan.",
      sectionId: "sec-2",
      sectionTitle: "Modul Tajwid Dasar",
      sectionOrder: 2,
      lectureOrder: 1,
      durationMinutes: 20,
      isCompleted: false,
    },
    {
      id: "m-file-latihan",
      classId,
      title: "Latihan Soal: Adab Penuntut Ilmu (PDF)",
      type: "file",
      createdAt: mkISO(-3, 15),
      author: "Tim Madinah Salam",
      url: "https://example.com/latihan-adab-penuntut-ilmu.pdf",
      fileName: "latihan-adab-penuntut-ilmu.pdf",
      fileSize: 210_560,
      description:
        "Kumpulan soal latihan untuk mengukur pemahaman adab menuntut ilmu.",
      sectionId: "sec-2",
      sectionTitle: "Modul Tajwid Dasar",
      sectionOrder: 2,
      lectureOrder: 2,
      durationMinutes: 10,
      isCompleted: false,
    },

    /* =============================
       Section 3 — Referensi Online
    ============================= */
    {
      id: "m-link-quran",
      classId,
      title: "Website: Quran.com — Baca & Dengar Al-Qur'an",
      type: "link",
      createdAt: mkISO(-3),
      url: "https://quran.com",
      description:
        "Rujukan bacaan Al-Qur'an dengan berbagai qiraat, terjemah, dan tafsir.",
      sectionId: "sec-3",
      sectionTitle: "Referensi Online Pendukung",
      sectionOrder: 3,
      lectureOrder: 1,
      durationMinutes: 5,
      isCompleted: false,
      isPreview: true,
    },
    {
      id: "m-link-kitab",
      classId,
      title: "Kitab Online: Ta'limul Muta'allim",
      type: "link",
      createdAt: mkISO(-2),
      url: "https://example.com/talimul-mutaallim",
      description:
        "Kitab klasik tentang adab penuntut ilmu yang menjadi rujukan utama di banyak pesantren.",
      sectionId: "sec-3",
      sectionTitle: "Referensi Online Pendukung",
      sectionOrder: 3,
      lectureOrder: 2,
      durationMinutes: 8,
      isCompleted: false,
    },
    {
      id: "m-link-bonus",
      classId,
      title: "Artikel Eksternal: Menjaga Konsistensi dalam Belajar",
      type: "link",
      createdAt: mkISO(),
      url: "https://example.com/menjaga-konsistensi-belajar",
      description:
        "Bacaan tambahan tentang bagaimana menjaga kebiasaan belajar dalam jangka panjang.",
      sectionId: "sec-3",
      sectionTitle: "Referensi Online Pendukung",
      sectionOrder: 3,
      lectureOrder: 3,
      durationMinutes: 7,
      isCompleted: false,
    },

    /* =============================
       Section 4 — Video Bab & Ringkasan
    ============================= */
    {
      id: "m-vid-1",
      classId,
      title: "Video Bab 1: Definisi Ilmu dan Keutamaannya",
      type: "youtube",
      createdAt: mkISO(-2, 20),
      author: "Ustadz Abdullah",
      url: "https://www.youtube.com/watch?v=iwq4Zb3jTMs",
      description:
        "Penjelasan singkat tentang definisi ilmu syar'i, perbedaan ilmu yang bermanfaat dan tidak bermanfaat, serta keutamaannya dalam Al-Qur'an dan sunnah.",
      content:
        "Disarankan menonton video ini sebelum membaca artikel pendukung. Catat dalil yang disebutkan dan coba tuliskan kembali dengan bahasa sendiri.",
      sectionId: "sec-4",
      sectionTitle: "Video Bab & Ringkasan Materi",
      sectionOrder: 4,
      lectureOrder: 1,
      durationMinutes: 18,
      isCompleted: false,
    },
    {
      id: "m-vid-2",
      classId,
      title: "Video Bab 2: Rintangan Menuntut Ilmu",
      type: "youtube",
      createdAt: mkISO(-1, 45),
      author: "Ustadz Abdullah",
      url: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
      description:
        "Membahas hambatan umum: malas, sibuk, gadget, dan lingkungan yang tidak mendukung, serta cara mengatasinya.",
      content:
        "Tonton video ini sambil mencatat: rintangan apa yang paling sering muncul dalam aktivitas belajar kamu, lalu tulis solusi praktis yang bisa kamu lakukan pekan ini.",
      sectionId: "sec-4",
      sectionTitle: "Video Bab & Ringkasan Materi",
      sectionOrder: 4,
      lectureOrder: 2,
      durationMinutes: 21,
      isCompleted: false,
    },
    {
      id: "m-art-3",
      classId,
      title: "Artikel Ringkasan: Rintangan dan Solusi Menuntut Ilmu",
      type: "article",
      createdAt: mkISO(-1, 50),
      author: "Tim Madinah Salam",
      description:
        "Ringkasan tertulis dari video Bab 2, cocok untuk yang suka belajar dengan membaca.",
      content:
        "Ringkasan utama dari pembahasan rintangan menuntut ilmu:\n\n1. **Malas dan menunda-nunda** — Obatnya adalah memaksa diri di awal, membuat jadwal kecil yang konsisten, dan menjauhi kebiasaan scroll tanpa tujuan.\n2. **Kesibukan yang tidak teratur** — Buat blok waktu khusus untuk belajar, walaupun hanya 20–30 menit per hari.\n3. **Lingkungan yang tidak mendukung** — Cari teman ketaatan, bergabung di grup belajar, dan minimalkan interaksi yang melemahkan semangat.\n4. **Gadget dan distraksi online** — Atur mode fokus saat belajar, matikan notifikasi, dan gunakan gadget hanya untuk membuka materi yang dibutuhkan.",
      sectionId: "sec-4",
      sectionTitle: "Video Bab & Ringkasan Materi",
      sectionOrder: 4,
      lectureOrder: 3,
      durationMinutes: 16,
      isCompleted: false,
    },
  ]);
}

/* =========================================================
   HELPERS
========================================================= */
const QK = {
  MATERIALS: (classId: string) =>
    ["student", "class", classId, "materials"] as const,
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

const formatDuration = (minutes?: number) => {
  if (!minutes) return "-";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}j ${m}m` : `${h}j`;
};

/* =========================================================
   PAGE STUDENT
========================================================= */
export default function StudentCSSTMaterial() {
  // param sesuai route: :csstId
  const { csstId = "" } = useParams<{ csstId: string }>();
  const classId = csstId;

  const navigate = useNavigate();
  const { setHeader } = useDashboardHeader();

  useEffect(() => {
    setHeader({
      title: "Materi Kelas",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas Saya" },
        { label: "Detail Mapel" },
        { label: "Materi Kelas" },
      ],
      showBack: true,
    });
  }, [setHeader]);

  // materials
  const { data: materials = [], isFetching } = useQuery({
    queryKey: QK.MATERIALS(classId),
    queryFn: () => fetchMaterialsByClass(classId),
    enabled: !!classId,
    staleTime: 2 * 60_000,
  });

  // sections (grouping ala Udemy)
  const sections: Section[] = useMemo(() => {
    const map = new Map<string, Section>();
    for (const m of materials) {
      if (!map.has(m.sectionId)) {
        map.set(m.sectionId, {
          id: m.sectionId,
          title: m.sectionTitle,
          order: m.sectionOrder,
          lectures: [],
        });
      }
      map.get(m.sectionId)!.lectures.push(m);
    }
    const arr = Array.from(map.values());
    arr.forEach((s) =>
      s.lectures.sort((a, b) => a.lectureOrder - b.lectureOrder)
    );
    return arr.sort((a, b) => a.order - b.order);
  }, [materials]);

  const totalLectures = materials.length;
  const totalMinutes = materials.reduce(
    (sum, m) => sum + (m.durationMinutes ?? 0),
    0
  );

  // current lecture
  const [current, setCurrent] = useState<Material | null>(null);

  useEffect(() => {
    if (!materials.length) return;
    setCurrent((prev) => {
      if (prev) return prev;
      const firstVideo = materials.find((m) => m.type === "youtube");
      return firstVideo ?? materials[0];
    });
  }, [materials]);

  // search materi di sidebar
  const [q, setQ] = useState("");

  const filteredSections = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return sections;
    return sections
      .map((s) => ({
        ...s,
        lectures: s.lectures.filter(
          (m) =>
            m.title.toLowerCase().includes(qq) ||
            (m.description ?? "").toLowerCase().includes(qq) ||
            (m.author ?? "").toLowerCase().includes(qq)
        ),
      }))
      .filter((s) => s.lectures.length > 0);
  }, [sections, q]);

  const handleSelectLecture = (m: Material) => {
    setCurrent(m);
    // biar di mobile langsung ke video
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyShare = async (m: Material) => {
    const shareUrl =
      m.url || `${window.location.origin}/class/${classId}/materials/${m.id}`;
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

  const renderPlayerContent = () => {
    if (!current) {
      return (
        <div className="aspect-video w-full rounded-md bg-muted animate-pulse" />
      );
    }

    const ytId =
      current.type === "youtube" ? extractYouTubeId(current.url) : null;

    if (current.type === "youtube" && ytId) {
      return (
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${ytId}`}
          title={current.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      );
    }

    if (current.type === "article") {
      return (
        <div className="w-full h-full bg-background border rounded-md p-4 overflow-auto">
          <h2 className="font-semibold mb-3">{current.title}</h2>
          <div className="text-sm whitespace-pre-line">
            {current.content ?? "Belum ada konten artikel."}
          </div>
        </div>
      );
    }

    if ((current.type === "file" || current.type === "link") && current.url) {
      return (
        <div className="w-full h-full bg-background border rounded-md p-4 flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-muted-foreground max-w-md">
            Materi ini berupa{" "}
            <span className="font-medium">
              {current.type === "file" ? "file" : "tautan"}
            </span>
            . Klik tombol di bawah untuk membuka.
          </p>
          <a
            href={current.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex"
          >
            <Button className="gap-2">
              {current.type === "file" ? (
                <Download className="h-4 w-4" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              {current.type === "file" ? "Unduh / Buka File" : "Buka Tautan"}
            </Button>
          </a>
        </div>
      );
    }

    return (
      <div className="aspect-video w-full rounded-md bg-muted flex items-center justify-center text-sm text-muted-foreground">
        Tidak ada konten yang dapat ditampilkan.
      </div>
    );
  };

  /* =========================
     Render
  ========================= */
  return (
    <div className="w-full bg-background text-foreground">
      <main className="mx-auto max-w-6xl space-y-6 px-4 md:px-6 pb-8">
        {/* Header actions (mobile) */}
        <div className="flex items-center justify-between md:hidden pt-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Materi Kelas
              </h1>
              <p className="text-xs text-muted-foreground">
                Kelas / mapel: {classId || "-"}
              </p>
            </div>
          </div>
        </div>

        {materials.length === 0 ? (
          <Card className="mt-4">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Belum ada materi yang dibagikan oleh guru untuk kelas ini.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(280px,340px)] xl:grid-cols-[minmax(0,3.5fr)_minmax(280px,360px)]">
            {/* LEFT: Player + tabs */}
            <section className="space-y-4">
              <Card className="overflow-hidden">
                <div className="aspect-video w-full bg-black">
                  {renderPlayerContent()}
                </div>
                <CardHeader className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase font-medium">
                    {current?.sectionTitle ?? "Materi Kelas"}
                  </p>
                  <CardTitle className="text-lg md:text-xl">
                    {current?.title ?? "Pilih materi untuk mulai belajar"}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {current && (
                      <>
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          <span>{dateLong(current.createdAt)}</span>
                        </div>
                        {current.durationMinutes && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {formatDuration(current.durationMinutes)}
                            </span>
                          </div>
                        )}
                        {current.author && <span>• Oleh {current.author}</span>}
                        <div className="flex items-center gap-1.5">
                          <TypeIcon t={current.type} />
                          <span className="capitalize">{current.type}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardHeader>
              </Card>

              {/* Tabs ala Udemy: overview, notes, announcements */}
              <Card>
                <CardContent className="pt-4">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="notes">Catatan</TabsTrigger>
                      <TabsTrigger value="announcements">
                        Pengumuman
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      {current?.description && (
                        <div className="text-sm">{current.description}</div>
                      )}
                      {current?.content && (
                        <div className="text-sm text-muted-foreground whitespace-pre-line">
                          {current.content}
                        </div>
                      )}
                      {!current?.description && !current?.content && (
                        <p className="text-sm text-muted-foreground">
                          Belum ada ringkasan untuk materi ini.
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent value="notes">
                      <p className="text-sm text-muted-foreground">
                        Fitur catatan pribadi belum aktif. Nantinya santri bisa
                        menyimpan catatan khusus untuk setiap materi di sini.
                      </p>
                    </TabsContent>

                    <TabsContent value="announcements">
                      <p className="text-sm text-muted-foreground">
                        Pengumuman terkait kelas akan muncul di sini: perubahan
                        jadwal, tambahan tugas, atau informasi penting lainnya.
                      </p>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </section>

            {/* RIGHT: Course content ala Udemy */}
            <aside className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Daftar Materi Kelas
                  </CardTitle>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span>{totalLectures} materi</span>
                      <span>•</span>
                      <span>
                        Perkiraan durasi total: {formatDuration(totalMinutes)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 text-[11px]">
                      <span className="inline-flex items-center gap-1">
                        <PlayCircle className="h-3 w-3" /> video
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-3 w-3" /> artikel
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Download className="h-3 w-3" /> file
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" /> link
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="relative">
                    <input
                      className="w-full rounded-md border bg-background px-3 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      placeholder="Cari materi di kelas ini…"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />
                  </div>

                  <div className="max-h-[480px] overflow-y-auto pr-1">
                    <Accordion
                      type="single"
                      collapsible
                      defaultValue={sections[0]?.id}
                    >
                      {filteredSections.map((section) => {
                        const totalSecMinutes = section.lectures.reduce(
                          (sum, m) => sum + (m.durationMinutes ?? 0),
                          0
                        );
                        return (
                          <AccordionItem
                            key={section.id}
                            value={section.id}
                            className="border-border"
                          >
                            <AccordionTrigger className="px-2 text-left">
                              <div className="flex flex-col items-start gap-1">
                                <span className="text-sm font-medium">
                                  {section.title}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  {section.lectures.length} materi •{" "}
                                  {formatDuration(totalSecMinutes)}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-1 pb-2">
                              <div className="flex flex-col">
                                {section.lectures.map((m) => {
                                  const isActive = current?.id === m.id;
                                  const isVideo = m.type === "youtube";
                                  return (
                                    <button
                                      key={m.id}
                                      type="button"
                                      onClick={() => handleSelectLecture(m)}
                                      className={`flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left text-xs transition-colors ${
                                        isActive
                                          ? "bg-primary/10 text-primary"
                                          : "hover:bg-muted"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full border text-[10px]">
                                          {isVideo ? (
                                            <PlayCircle className="h-3 w-3" />
                                          ) : m.type === "article" ? (
                                            <FileText className="h-3 w-3" />
                                          ) : m.type === "file" ? (
                                            <Download className="h-3 w-3" />
                                          ) : (
                                            <LinkIcon className="h-3 w-3" />
                                          )}
                                        </span>
                                        <div className="flex flex-col">
                                          <span className="line-clamp-2">
                                            {m.title}
                                          </span>
                                          <span className="mt-0.5 text-[11px] text-muted-foreground">
                                            {m.author ? `Oleh ${m.author}` : ""}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex flex-col items-end gap-1">
                                        {m.durationMinutes && (
                                          <div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            <span>
                                              {formatDuration(
                                                m.durationMinutes
                                              )}
                                            </span>
                                          </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                          {m.isCompleted && (
                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                          )}
                                          {m.isPreview && (
                                            <span className="rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                              Preview
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </div>
                </CardContent>
                {isFetching && (
                  <CardFooter className="py-2">
                    <span className="text-[11px] text-muted-foreground">
                      Memuat pembaruan materi…
                    </span>
                  </CardFooter>
                )}
              </Card>

              {/* Card kecil: info share / link */}
              {current && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Aksi cepat materi ini
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2 pt-0">
                    {current.url && (
                      <a
                        href={
                          current.type === "youtube"
                            ? `https://www.youtube.com/watch?v=${
                                extractYouTubeId(current.url) ?? ""
                              }`
                            : current.url
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button variant="outline" size="sm" className="gap-2">
                          {current.type === "file" ? (
                            <Download className="h-4 w-4" />
                          ) : (
                            <ExternalLink className="h-4 w-4" />
                          )}
                          Buka Materi
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => copyShare(current)}
                    >
                      {copiedId === current.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copiedId === current.id
                        ? "Link Disalin"
                        : "Salin Link Materi"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
