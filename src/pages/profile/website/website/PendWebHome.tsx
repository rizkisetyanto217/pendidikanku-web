// src/pages/SekolahIslamkuHome.tsx
import React from "react";
import {
  BookOpen,
  Users,
  Award,
  Clock,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Phone,
  Star,
} from "lucide-react";
import sekolah1 from "@/assets/sekolah1.jpeg";
// import sekolah2 from "@/assets/sekolah2.jpeg";
import sekolah3 from "@/assets/sekolah3.jpg";
import sekolah4 from "@/assets/sekolah4.webp";
import sekolah5 from "@/assets/sekolah5.png";
import keuangan from "@/assets/keuangan.jpg";

import WebsiteNavbar from "@/components/common/public/CWebsiteNavbar";
import WebsiteFooter from "./components/CPendWebFooter";

import TestimonialCarousel, {
  type TestimonialItem,
} from "@/components/pages/home/CTestimonialCarousel";
import { Link } from "react-router-dom";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

/** =================== Data =================== */
const modules = [
  {
    title: "Penerimaan Siswa Baru (PPDB)",
    desc: "Form online, seleksi, verifikasi berkas, pembayaran, hingga penetapan kelas otomatis.",
    icon: Users,
    img: sekolah4,
  },
  {
    title: "Akademik & Kurikulum",
    desc: "RPP, penjadwalan, penilaian, rapor digital, kelulusan—semuanya tersentral.",
    icon: BookOpen,
    img: sekolah5,
  },
  {
    title: "Absensi & Kehadiran",
    desc: "Scan QR/ID, izin/surat sakit, rekap kehadiran real-time untuk guru & siswa.",
    icon: Clock,
    img: sekolah3,
  },
];

const features = [
  { title: "Keuangan & SPP", img: keuangan },
  { title: "Komunikasi & Notifikasi", img: sekolah4 },
  { title: "LMS & E-Learning", img: sekolah5 },
  { title: "Inventaris & Perpustakaan", img: sekolah3 },
];

const advantages = [
  {
    label: "Implementasi Cepat",
    points: [
      "Onboarding < 7 hari",
      "Template data siap pakai",
      "Tim support responsif",
    ],
  },
  {
    label: "Satu Dashboard",
    points: ["360° data sekolah", "KPI & analitik", "Ekspor ke Excel/PDF"],
  },
  {
    label: "Integrasi Fleksibel",
    points: [
      "WhatsApp/Email gateway",
      "Payment gateway",
      "Siapkan SSO sekolah",
    ],
  },
  {
    label: "Keamanan Data",
    points: ["Backup harian", "Kontrol akses role-based", "Jejak audit"],
  },
];

const testimonials: TestimonialItem[] = [
  {
    name: "Nurhandayani",
    role: "Kepala Sekolah SMP Nurul Fajar",
    quote:
      "Administrasi jauh lebih tertib. Orang tua bisa pantau nilai & SPP dari rumah, guru fokus mengajar.",
    img: sekolah4,
  },
  {
    name: "Fajar Nugraha",
    role: "Wakasek Kurikulum SMK Cendekia",
    quote:
      "Penjadwalan & rapor digital mempercepat pekerjaan hingga 60%. Laporan kepala sekolah real-time.",
    img: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Hj. Rahmawati",
    role: "Kepala Madrasah Aliyah",
    quote:
      "Absensi digital mempermudah monitoring kehadiran siswa, rekap otomatis tanpa manual.",
    img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Budi Santoso",
    role: "Guru Matematika",
    quote: "Input nilai cepat, rapor online bisa diakses orang tua kapan pun.",
    img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Siti Aminah",
    role: "Wali Murid",
    quote:
      "Saya mudah memantau kehadiran, nilai, dan tagihan SPP dari satu aplikasi.",
    img: "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Hendri Pratama",
    role: "Kepala TU",
    quote: "Transaksi SPP transparan, rekonsiliasi tinggal ekspor laporan.",
    img: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=800&auto=format&fit=crop",
  },
];

const kpis = [
  { label: "Sekolah Terbantu", value: "250+" },
  { label: "Guru & Staff", value: "8.5k+" },
  { label: "Siswa Tercatat", value: "150k+" },
  { label: "Integrasi Aktif", value: "50+" },
];

/** ========= Utilities ========= */
const FullBleed: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = "", children }) => (
  <div
    className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen ${className}`}
  >
    {children}
  </div>
);

const Section: React.FC<{
  id?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ id, className = "", children }) => (
  <section id={id} className={`px-4 sm:px-6 lg:px-8 ${className}`}>
    <div className="w-full">{children}</div>
  </section>
);

/* =================== Page =================== */
export default function PendWebHome() {
  return (
    <FullBleed>
      <div
        id="home"
        className="min-h-screen w-screen overflow-x-hidden bg-background text-foreground"
      >
        {/* NAVBAR */}
        <WebsiteNavbar />
        <div />

        {/* HERO */}
        <div className="relative overflow-hidden">
          <img
            src={sekolah1}
            alt="Hero background"
            className="absolute inset-0 h-full w-full object-cover opacity-25 saturate-90 dark:opacity-30"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--background))] via-[hsl(var(--background))] to-[hsl(var(--background))]" />

          <Section className="relative py-20 sm:py-20 lg:py-28">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              {/* Left: copy + CTA */}
              <div>
                <Badge
                  variant="secondary"
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1"
                >
                  <Star className="h-3.5 w-3.5" />
                  Solusi End-to-End untuk Administrasi Sekolah
                </Badge>

                <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl xl:text-6xl">
                  Sekolah{" "}
                  <span className="text-[hsl(var(--primary))]">
                    Lebih Mudah
                  </span>
                  , Cepat, & Transparan
                </h1>

                <p className="mt-4 max-w-3xl text-muted-foreground">
                  Dari PPDB, akademik, kehadiran, keuangan, hingga komunikasi
                  orang tua—semua terintegrasi dalam satu platform yang ringan
                  dan aman.
                </p>

                {/* CTA row */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button asChild className="rounded-full">
                    <Link to="/website/daftar-sekarang">
                      <ChevronRight className="mr-2 h-4 w-4" />
                      Daftar Sekarang Gratis
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="rounded-full">
                    <Link to="dukungan">🤝 Dukung Kami</Link>
                  </Button>
                </div>

                {/* KPI ringkas (opsional) */}
                <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {kpis.map((k) => (
                    <span
                      key={k.label}
                      className="inline-flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-medium text-foreground">
                        {k.value}
                      </span>{" "}
                      {k.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: mock dashboard */}
              <div>
                <Card className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl">
                  <CardContent className="h-full w-full p-0">
                    <img
                      src={sekolah4}
                      alt="Dashboard Sekolah"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 rounded-2xl border bg-card/80 p-3 backdrop-blur">
                      <Award className="h-4 w-4" />
                      <p className="text-xs text-muted-foreground">
                        Dashboard menyatukan akademik, keuangan, absensi, &
                        komunikasi dalam satu layar.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Section>
        </div>

        {/* MODUL INTI */}
        <Section id="program" className="py-16 md:py-20">
          <header className="mb-8 text-center md:mb-12">
            <h2 className="text-3xl font-bold md:text-4xl">
              Modul Inti Platform
            </h2>
            <p className="mt-3 text-muted-foreground">
              Tersedia lengkap—siap digunakan dari hari pertama implementasi.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-3 xl:gap-8">
            {modules.map((m) => (
              <Card
                key={m.title}
                className="group overflow-hidden rounded-3xl shadow-sm transition hover:shadow-md"
              >
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={m.img}
                      alt={m.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-xl bg-card/90 px-3 py-1.5 text-xs backdrop-blur">
                      <m.icon className="h-4 w-4" /> {m.title}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground">{m.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        {/* FITUR TAMBAHAN */}
        <Section id="fasilitas" className="py-16 md:py-20">
          <header className="mb-8 text-center md:mb-12">
            <h2 className="text-3xl font-bold md:text-4xl">
              Fitur Tambahan yang Kuat
            </h2>
            <p className="mt-3 text-muted-foreground">
              Sesuaikan kebutuhan sekolah—aktifkan modul sesuai prioritas.
            </p>
          </header>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-8">
            {features.map((f) => (
              <Card
                key={f.title}
                className="overflow-hidden rounded-3xl shadow-sm transition hover:shadow"
              >
                <CardContent className="p-0">
                  <img
                    src={f.img}
                    alt={f.title}
                    className="h-48 w-full object-cover"
                    loading="lazy"
                  />
                  <figcaption className="p-4 text-sm font-medium">
                    {f.title}
                  </figcaption>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        {/* KEUNGGULAN */}
        <Section id="keunggulan" className="py-16 md:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold md:text-4xl">
                Mengapa Memilih Kami
              </h2>
              <p className="mt-3 max-w-prose text-muted-foreground">
                Tim kami berpengalaman membantu sekolah negeri & swasta
                meningkatkan efisiensi operasional tanpa mengubah budaya kerja
                inti.
              </p>
              <ul className="mt-6 space-y-3">
                {advantages.map((k) => (
                  <li
                    key={k.label}
                    className="rounded-2xl border bg-muted/40 p-4"
                  >
                    <div className="mb-2 font-semibold">{k.label}</div>
                    <div className="flex flex-wrap gap-2">
                      {k.points.map((p) => (
                        <Badge
                          key={p}
                          variant="outline"
                          className="gap-1.5 rounded-full"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> {p}
                        </Badge>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <Card className="overflow-hidden rounded-3xl shadow-xl">
                <CardContent className="p-0">
                  <img
                    src={sekolah4}
                    alt="Tim implementasi"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </CardContent>
              </Card>
              <div className="absolute -bottom-6 -right-6 hidden rounded-2xl bg-primary px-4 py-3 text-primary-foreground md:block shadow-lg">
                Fokus: Efisiensi • Transparansi • Data-Driven
              </div>
            </div>
          </div>
        </Section>

        {/* TESTIMONI */}
        <Section id="testimoni" className="py-16 md:py-28">
          <header className="mb-8 text-center md:mb-12">
            <h2 className="text-3xl font-bold md:text-4xl">Kata Mereka</h2>
            <p className="mt-3 text-muted-foreground">
              Dampak nyata di sekolah pengguna layanan kami.
            </p>
          </header>

          <TestimonialCarousel
            items={testimonials}
            autoplayDelayMs={4000}
            showArrows
          />
        </Section>

        {/* CTA DEMO */}
        <div id="demo" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))]" />
          <img
            src={sekolah5}
            alt="CTA Demo"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
            loading="lazy"
          />
          <Section className="relative py-16 md:py-20">
            <Card className="grid items-center gap-8 rounded-3xl border bg-white/10 p-6 backdrop-blur-sm md:grid-cols-2 md:p-10 dark:bg-black/10">
              <CardContent className="p-0">
                <h3 className="text-2xl font-bold text-white md:text-3xl">
                  Jadwalkan Demo Gratis
                </h3>
                <p className="mt-2 text-white/90">
                  Lihat bagaimana platform kami menyederhanakan operasional
                  sekolah Anda—langsung bersama tim kami.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild variant="secondary" className="rounded-full">
                    <a href="#kontak">
                      <Calendar className="mr-2 h-4 w-4" />
                      Booking Slot Demo
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-white/60 text-white hover:bg-white/10"
                  >
                    <a href="#kontak">
                      <Phone className="mr-2 h-4 w-4" />
                      Hubungi Sales
                    </a>
                  </Button>
                </div>
              </CardContent>
              <ul className="space-y-3 text-sm text-white">
                {[
                  "Tanpa biaya setup",
                  "Bisa migrasi data",
                  "Bebas kontrak panjang",
                  "Garansi bantuan implementasi",
                ].map((x) => (
                  <li key={x} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5" /> {x}
                  </li>
                ))}
              </ul>
            </Card>
          </Section>
        </div>

        {/* NEWSLETTER */}
        <Section className="py-16 md:py-20">
          <Card className="rounded-3xl">
            <CardContent className="p-6 md:p-10">
              <div className="grid items-center gap-8 md:grid-cols-2">
                <div>
                  <h3 className="text-2xl font-bold">
                    Dapatkan Update Fitur & Studi Kasus
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Kami kirim ringkas—insight dan rilis terbaru ke email Anda.
                  </p>
                </div>
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="flex flex-col gap-3 sm:flex-row"
                >
                  <Input
                    type="email"
                    required
                    placeholder="Email sekolah Anda"
                    className="h-11 rounded-2xl"
                  />
                  <Button className="h-11 rounded-2xl">Langganan</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* FOOTER */}
        <WebsiteFooter />
      </div>
    </FullBleed>
  );
}
