// src/pages/SekolahIslamkuTutorial.tsx
import React, { useState } from "react";
import {
  GraduationCap,
  Users,
  Settings,
  PlayCircle,
  CheckCircle2,
  LogIn,
  Smartphone,
  CalendarDays,
  ClipboardList,
  MessageSquare,
  CreditCard,
  FileText,
  Link as LinkIcon,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

import WebsiteNavbar from "@/components/common/public/CWebsiteNavbar";
import WebsiteFooter from "@/pages/profile/website/website/components/CPendWebFooter";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ================= Utilities ================= */
const FullBleed: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <div
    className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen ${className}`}
  >
    {children}
  </div>
);

const Section: React.FC<
  React.PropsWithChildren<{ id?: string; className?: string }>
> = ({ id, className = "", children }) => (
  <section id={id} className={`px-4 sm:px-6 lg:px-8 ${className}`}>
    <div className="w-full">{children}</div>
  </section>
);

/* ================= Page ================= */
type RoleKey = "murid" | "guru" | "sekolah";

export default function PendWebTutorial() {
  const [role, setRole] = useState<RoleKey>("murid");

  /* ---------- data per role ---------- */
  const steps: Record<
    RoleKey,
    { title: string; desc: string; icon: React.ElementType }[]
  > = {
    murid: [
      {
        title: "Masuk / Daftar",
        desc: "Gunakan akun dari sekolah atau undangan wali kelas.",
        icon: LogIn,
      },
      {
        title: "Lengkapi Profil",
        desc: "Periksa data siswa & orang tua; ubah kontak bila perlu.",
        icon: Smartphone,
      },
      {
        title: "Lihat Jadwal",
        desc: "Pantau jadwal pelajaran & agenda ujian dari menu Kalender.",
        icon: CalendarDays,
      },
      {
        title: "Kumpulkan Tugas",
        desc: "Unggah jawaban, cek nilai dan feedback guru.",
        icon: ClipboardList,
      },
      {
        title: "Nilai & Kehadiran",
        desc: "Rekap nilai, absen harian, dan catatan sikap real-time.",
        icon: CheckCircle2,
      },
      {
        title: "Komunikasi",
        desc: "Terima pengumuman & chat wali kelas (portal orang tua).",
        icon: MessageSquare,
      },
    ],
    guru: [
      {
        title: "Masuk & Atur Kelas",
        desc: "Cek kelas yang diampu, atur RPP & topik pembelajaran.",
        icon: Settings,
      },
      {
        title: "Jadwal & Materi",
        desc: "Buat pertemuan, unggah materi, tugas/kuis dengan tenggat.",
        icon: CalendarDays,
      },
      {
        title: "Absensi Cepat",
        desc: "QR/ID atau centang manual; rekap otomatis.",
        icon: Smartphone,
      },
      {
        title: "Penilaian & Rapor",
        desc: "Input nilai & deskripsi sikap, finalkan rapor.",
        icon: CheckCircle2,
      },
      {
        title: "Komunikasi Orang Tua",
        desc: "Kirim pengumuman kelas, pesan ke wali, pantau respons.",
        icon: MessageSquare,
      },
      {
        title: "Analitik Kelas",
        desc: "Ringkasan ketercapaian & siswa yang perlu perhatian.",
        icon: ClipboardList,
      },
    ],
    sekolah: [
      {
        title: "Onboarding & Struktur",
        desc: "Tambah tahun ajaran, rombel, mapel, guru, data siswa.",
        icon: Settings,
      },
      {
        title: "PPDB & Penempatan",
        desc: "Buka gelombang, verifikasi berkas, tempatkan kelas otomatis.",
        icon: ClipboardList,
      },
      {
        title: "Kalender Akademik",
        desc: "Atur kalender, ujian, hari besar; sinkron otomatis.",
        icon: CalendarDays,
      },
      {
        title: "Kebijakan Absensi",
        desc: "Aktifkan QR/ID, toleransi terlambat & alur izin/sakit.",
        icon: Smartphone,
      },
      {
        title: "Keuangan & SPP",
        desc: "Buat tagihan, aktifkan payment gateway, rekonsiliasi.",
        icon: CreditCard,
      },
      {
        title: "Pelaporan & KPI",
        desc: "Dashboard 360°, ekspor Excel/PDF untuk pimpinan.",
        icon: CheckCircle2,
      },
    ],
  };

  const resources: Record<
    RoleKey,
    { title: string; kind: "video" | "doc" | "link"; href: string }[]
  > = {
    murid: [
      { title: "Video 3 Menit: Mulai dari HP", kind: "video", href: "#" },
      { title: "Panduan PDF: Portal Orang Tua", kind: "doc", href: "#" },
      { title: "FAQ Absensi & Nilai", kind: "link", href: "#" },
    ],
    guru: [
      { title: "Video: Input Nilai & Rapor", kind: "video", href: "#" },
      { title: "Template RPP & Bank Soal", kind: "doc", href: "#" },
      { title: "Best Practice Komunikasi", kind: "link", href: "#" },
    ],
    sekolah: [
      { title: "Checklist Implementasi 7 Hari", kind: "doc", href: "#" },
      { title: "Video: PPDB End-to-End", kind: "video", href: "#" },
      { title: "Contoh SOP & Kebijakan", kind: "link", href: "#" },
    ],
  };

  const faqs: Record<RoleKey, { q: string; a: string }[]> = {
    murid: [
      {
        q: "Lupa kata sandi?",
        a: "Gunakan Lupa Password atau minta reset ke admin sekolah.",
      },
      {
        q: "Tidak lihat kelas?",
        a: "Pastikan tahun ajaran aktif & kamu sudah dimasukkan ke rombel.",
      },
    ],
    guru: [
      {
        q: "Nilai tidak muncul di rapor?",
        a: "Pastikan komponen penilaian lengkap & periode benar.",
      },
      {
        q: "Tidak bisa absen QR?",
        a: "Cek koneksi, izin kamera browser, atau pakai input manual.",
      },
    ],
    sekolah: [
      {
        q: "Payment gateway belum aktif?",
        a: "Lengkapi dokumen merchant & hubungi tim aktivasi.",
      },
      {
        q: "Ekspor PDF kosong?",
        a: "Periksa filter (kelas/semester) lalu generate ulang.",
      },
    ],
  };

  /* ---------- small components ---------- */
  const RoleTabs = () => (
    <Tabs
      value={role}
      onValueChange={(v) => setRole(v as RoleKey)}
      className="w-full max-w-3xl"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="murid" className="gap-2">
          <GraduationCap className="h-4 w-4" /> Murid / Ortu
        </TabsTrigger>
        <TabsTrigger value="guru" className="gap-2">
          <Users className="h-4 w-4" /> Guru
        </TabsTrigger>
        <TabsTrigger value="sekolah" className="gap-2">
          <Settings className="h-4 w-4" /> Sekolah / Admin
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );

  const StepItem = ({
    title,
    desc,
    Icon,
  }: {
    title: string;
    desc: string;
    Icon: React.ElementType;
  }) => (
    <Card className="rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border bg-card">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold">{title}</div>
            <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ResourceCard = ({
    title,
    kind,
    href,
  }: {
    title: string;
    kind: "video" | "doc" | "link";
    href: string;
  }) => {
    const icon =
      kind === "video" ? PlayCircle : kind === "doc" ? FileText : LinkIcon;
    return (
      <a
        href={href}
        className="block rounded-2xl border bg-card p-4 transition hover:shadow-sm"
      >
        <div className="flex items-start gap-3">
          {React.createElement(icon, { className: "h-5 w-5" })}
          <div className="text-sm font-medium">{title}</div>
        </div>
      </a>
    );
  };

  return (
    <FullBleed>
      <div className="min-h-screen w-screen overflow-x-hidden bg-background text-foreground">
        <WebsiteNavbar />
        <div className="h-20" />

        {/* HERO */}
        <div className="relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=2400&auto=format&fit=crop"
            alt="Tutorial background"
            className="absolute inset-0 h-full w-full object-cover opacity-20 saturate-90 dark:opacity-25"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--background))] via-[hsl(var(--background))] to-[hsl(var(--background))]" />
          <Section className="relative py-14 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-3 gap-2">
                <PlayCircle className="h-3.5 w-3.5" />
                Tutorial & Panduan Cepat
              </Badge>
              <h1 className="mt-1 text-4xl font-bold md:text-5xl">
                Mulai dengan Peran Anda
              </h1>
              <p className="mt-3 text-muted-foreground">
                Ikuti langkah ringkas sesuai peran. Tersedia video singkat,
                panduan PDF, dan FAQ.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button asChild className="rounded-full">
                  <a href="#video">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Lihat Video 3 Menit
                  </a>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <a href="/website/hubungi-kami">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Butuh Bantuan?
                  </a>
                </Button>
              </div>
            </div>
          </Section>
        </div>

        {/* ROLE TABS */}
        <Section className="py-8">
          <div className="flex items-center justify-center">
            <RoleTabs />
          </div>
        </Section>

        {/* QUICK START */}
        <Section id="quick-start" className="py-6 md:py-10">
          <header className="mb-6">
            <h2 className="text-2xl font-bold md:text-3xl">
              Langkah Cepat{" "}
              {role === "murid"
                ? "Murid/Ortu"
                : role === "guru"
                ? "Guru"
                : "Sekolah/Admin"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              5–6 langkah ringkas untuk langsung jalan.
            </p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {steps[role].map((s) => (
              <StepItem
                key={s.title}
                title={s.title}
                desc={s.desc}
                Icon={s.icon}
              />
            ))}
          </div>
        </Section>

        {/* RESOURCES */}
        <Section id="resources" className="py-10 md:py-14">
          <header className="mb-6">
            <h3 className="text-xl font-bold md:text-2xl">
              Materi & Sumber Daya
            </h3>
          </header>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources[role].map((r) => (
              <ResourceCard
                key={r.title}
                title={r.title}
                kind={r.kind}
                href={r.href}
              />
            ))}
          </div>
          <div className="mt-6">
            <Button asChild variant="outline" className="rounded-full">
              <a href="#">
                <FileText className="mr-2 h-4 w-4" />
                Unduh Panduan Lengkap (PDF)
              </a>
            </Button>
          </div>
        </Section>

        {/* VIDEO STRIP */}
        <Section id="video" className="py-10">
          <Card className="rounded-3xl">
            <CardContent className="p-4 md:p-6">
              <div className="grid items-center gap-6 lg:grid-cols-2">
                <div className="aspect-video overflow-hidden rounded-2xl border bg-card">
                  {/* Tempel embed YouTube/Vimeo di sini */}
                  <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                    Preview Video Tutorial (tempel embed)
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold md:text-2xl">
                    Video Ringkas sesuai Peran
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Tonton alur utama: login, navigasi menu, dan tugas harian.
                    Durasi ±3 menit.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" className="rounded-full">
                      Murid/Ortu
                    </Button>
                    <Button variant="outline" className="rounded-full">
                      Guru
                    </Button>
                    <Button variant="outline" className="rounded-full">
                      Sekolah/Admin
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* FAQ */}
        <Section id="faq" className="py-12 md:py-16">
          <header className="mb-8">
            <h3 className="text-xl font-bold md:text-2xl">
              FAQ –{" "}
              {role === "murid"
                ? "Murid/Ortu"
                : role === "guru"
                ? "Guru"
                : "Sekolah/Admin"}
            </h3>
          </header>
          <div className="grid gap-6 lg:grid-cols-2">
            {faqs[role].map((f) => (
              <Card key={f.q} className="rounded-2xl">
                <CardContent className="p-5">
                  <div className="font-semibold">{f.q}</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {f.a}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <a href="/website/hubungi-kami">
                <HelpCircle className="mr-2 h-4 w-4" />
                Masih Bingung? Hubungi Kami
              </a>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <a href="/website/fitur">
                <ChevronRight className="mr-2 h-4 w-4" />
                Jelajahi Semua Fitur
              </a>
            </Button>
          </div>
        </Section>

        <WebsiteFooter />
      </div>
    </FullBleed>
  );
}
