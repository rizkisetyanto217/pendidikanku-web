// src/pages/DukungKami.tsx
import * as React from "react";
import {
  Heart,
  Handshake,
  Users,
  School,
  BookOpen,
  Database,
  CreditCard,
  QrCode,
  Repeat,
  ShieldCheck,
  FileText,
  ChevronRight,
  Mail,
  Phone,
} from "lucide-react";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

/* Navbar & Footer kamu (biarkan seperti semula) */
import WebsiteNavbar from "@/components/common/public/CWebsiteNavbar";
import WebsiteFooter from "@/pages/profile/website/website/components/CPendWebFooter";


/* =========================================
   Small layout helpers (Tailwind-only)
========================================= */
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
    <div className="w-full max-w-6xl mx-auto">{children}</div>
  </section>
);

/* =========================================
   Page
========================================= */
export default function PendWebSupportUs() {
  return (
    <FullBleed>
      {/* page bg pakai CSS var + class gradient */}
      <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-support text-foreground">
        {/* NAVBAR */}
        <WebsiteNavbar />
        <div className="h-20 sm:h-24" />

        {/* ===== HERO ===== */}
        <div className="relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2400&auto=format&fit=crop"
            alt="Komunitas pendidikan berkolaborasi"
            className="absolute inset-0 h-full w-full object-cover opacity-[0.18] dark:opacity-[0.24] saturate-[.9]"
            loading="eager"
          />
          <Section className="relative py-14 sm:py-20 lg:py-24">
            <div className="text-center max-w-3xl mx-auto">
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1 text-xs gap-2 bg-background/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur"
              >
                <Heart className="h-3.5 w-3.5" />
                Gerakan Berbagi Akses Teknologi Pendidikan
              </Badge>

              <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
                Dukung Kami
              </h1>
              <p className="mt-3 text-muted-foreground">
                Visi kami: <b>setiap madrasah, pesantren, dan sekolah Islam</b>{" "}
                bisa memakai SekolahIslamku <b>secara gratis</b>—berkat donatur
                yang peduli pendidikan.
              </p>

              <div className="mt-6 flex items-center justify-center gap-3">
                <Button asChild size="lg" className="rounded-full">
                  <a href="#donasi">
                    <CreditCard className="h-4 w-4 mr-2" /> Donasi Sekarang
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full"
                >
                  <a href="#ajukan">
                    <ChevronRight className="h-4 w-4 mr-2" />
                    Ajukan Beasiswa Lisensi
                  </a>
                </Button>
              </div>
            </div>
          </Section>
        </div>

        {/* ===== VISI & MISI ===== */}
        <Section id="visi-misi" className="py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <School className="h-5 w-5" /> Visi
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Akses teknologi pendidikan yang <b>merata</b>, <b>aman</b>,
                  dan <b>berdampak</b> bagi seluruh lembaga pendidikan Islam di
                  Indonesia.
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Handshake className="h-5 w-5" /> Misi
                </div>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {[
                    "Mensubsidi lisensi platform bagi lembaga yang membutuhkan",
                    "Menyediakan pelatihan dan pendampingan untuk guru & operator",
                    "Menjaga keberlanjutan infrastruktur (server, backup, keamanan)",
                    "Mendorong kolaborasi donatur, yayasan, dan komunitas",
                  ].map((x) => (
                    <li key={x} className="flex items-start gap-2">
                      <Heart className="h-4 w-4 mt-0.5" /> {x}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* ===== PROGRAM ===== */}
        <Section id="program" className="py-12 md:py-16">
          <header className="mb-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ke Mana Donasi Anda Dialokasikan
            </h2>
            <p className="mt-3 text-muted-foreground">
              Kami fokus pada dampak langsung bagi sekolah.
            </p>
          </header>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Beasiswa Lisensi",
                desc: "Membiayai penggunaan platform untuk sekolah membutuhkan.",
              },
              {
                icon: Database,
                title: "Infrastruktur",
                desc: "Server, backup harian, monitoring, dan keamanan data.",
              },
              {
                icon: Users,
                title: "Pelatihan Guru",
                desc: "Sesi onboarding, materi, dan pendampingan operasional.",
              },
              {
                icon: ShieldCheck,
                title: "Kepatuhan & Audit",
                desc: "Kebijakan, SOP, dan jejak audit demi transparansi.",
              },
            ].map((i) => (
              <Card key={i.title} className="rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <i.icon className="h-5 w-5" />
                    <div>
                      <div className="font-semibold">{i.title}</div>
                      <p className="text-sm mt-1 text-muted-foreground">
                        {i.desc}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        {/* ===== DAMPAK ===== */}
        <Section id="dampak" className="py-12">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "Sekolah Terbantu", value: "250+" },
              { label: "Guru & Staf Terlatih", value: "8.5k+" },
              { label: "Siswa Terlayani", value: "150k+" },
            ].map((k) => (
              <Card key={k.label} className="rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{k.value}</div>
                  <div className="text-xs mt-1 text-muted-foreground">
                    {k.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6 rounded-2xl">
            <CardContent className="p-4 text-sm text-muted-foreground">
              *Estimasi biaya berjenjang untuk lisensi & infrastruktur akan
              dipublikasikan pada laporan triwulan. Donatur dapat memilih skema{" "}
              <b>sekali donasi</b> atau <b>berkala (recurring)</b> sesuai
              preferensi.
            </CardContent>
          </Card>
        </Section>

        {/* ===== DONASI ===== */}
        <Section id="donasi" className="py-12 md:py-16">
          <header className="mb-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Cara Berdonasi
            </h2>
            <p className="mt-3 text-muted-foreground">
              Pilih metode yang paling nyaman untuk Anda.
            </p>
          </header>

          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {/* Bank */}
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 font-semibold">
                  <CreditCard className="h-5 w-5" /> Transfer Bank (Contoh)
                </div>
                <ul className="mt-3 text-sm space-y-2 text-muted-foreground">
                  <li>Bank Syariah Indonesia (BSI)</li>
                  <li>
                    No. Rek: <b>123 456 7890</b>
                  </li>
                  <li>
                    a/n: <b>Yayasan SekolahIslamku</b>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* QRIS */}
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 font-semibold">
                  <QrCode className="h-5 w-5" /> QRIS (Contoh)
                </div>
                <div className="mt-3 aspect-square rounded-xl border grid place-items-center text-xs text-muted-foreground">
                  Tempat QRIS — ganti dengan gambar resmi
                </div>
              </CardContent>
            </Card>

            {/* Recurring */}
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 font-semibold">
                  <Repeat className="h-5 w-5" /> Donasi Berkala
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Dukung sekolah secara berkelanjutan setiap bulan. Anda akan
                  menerima ringkasan dampak melalui email.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  {["Rp100k", "Rp250k", "Rp500k", "Rp1jt"].map((x) => (
                    <Badge key={x} variant="outline" className="rounded-full">
                      {x}/bulan
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="rounded-full">
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
              >
                <Phone className="h-4 w-4 mr-2" /> Konfirmasi via WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <a href="mailto:donasi@sekolahislamku.id">
                <Mail className="h-4 w-4 mr-2" /> donasi@sekolahislamku.id
              </a>
            </Button>
          </div>
        </Section>

        {/* ===== TRANSPARANSI ===== */}
        <Section id="transparansi" className="py-12 md:py-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                Transparansi & Akuntabilitas
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {[
                  "Laporan triwulan: alokasi dana & jumlah sekolah terbantu",
                  "Rangkuman dampak: guru terlatih, siswa terlayani, progres fitur",
                  "Audit internal & jejak audit sistem untuk setiap perubahan kebijakan",
                ].map((x) => (
                  <li key={x} className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 mt-0.5" /> {x}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Button asChild variant="outline" className="rounded-full">
                  <a href="#">
                    <FileText className="h-4 w-4 mr-2" /> Contoh Laporan (PDF)
                  </a>
                </Button>
              </div>
            </div>

            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" /> Sponsor Perusahaan / CSR
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Perusahaan dapat bermitra untuk mensubsidi lisensi sekolah
                  sasaran (daerah 3T/TPK, pesantren kecil, dll). Kami sediakan
                  paket branding, laporan dampak, dan pelibatan karyawan.
                </p>
                <Button asChild variant="outline" className="mt-4 rounded-full">
                  <a href="mailto:partnership@sekolahislamku.id">
                    <Mail className="h-4 w-4 mr-2" />{" "}
                    partnership@sekolahislamku.id
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* ===== AJUKAN BEASISWA ===== */}
        <Section id="ajukan" className="py-12 md:py-16">
          <Card className="rounded-3xl">
            <CardContent className="p-6 md:p-8">
              <div className="grid lg:grid-cols-2 gap-8 items-start">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Ajukan Beasiswa Lisensi
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Lembaga Anda membutuhkan subsidi lisensi? Ajukan di sini.
                    Tim kami akan menyeleksi berdasarkan kriteria kebutuhan dan
                    dampak.
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {[
                      "Prioritas: madrasah/pesantren kecil, daerah 3T/TPK, atau biaya operasional terbatas",
                      "Komitmen minimal: satu PIC operasional & kesediaan mengikuti pelatihan",
                      "Pelaporan dampak sederhana tiap semester",
                    ].map((x) => (
                      <li key={x} className="flex items-start gap-2">
                        <CheckIcon /> {x}
                      </li>
                    ))}
                  </ul>
                </div>

                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="space-y-4"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Nama Lembaga</Label>
                      <Input required placeholder="Yayasan / Sekolah" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Jenjang</Label>
                      <Input placeholder="MI/MTs/MA/SD/SMP/SMA/SMK/Pesantren" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Kontak PIC</Label>
                      <Input placeholder="Nama & No. HP" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        required
                        placeholder="nama@domain.com"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Kota/Kabupaten</Label>
                      <Input placeholder="Contoh: Lombok Timur" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Link Website/Media Sosial</Label>
                      <Input placeholder="https://..." />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Cerita Singkat Kebutuhan</Label>
                      <Textarea
                        rows={4}
                        placeholder="Ceritakan kondisi & kebutuhan…"
                      />
                    </div>
                  </div>

                  <Separator className="my-2" />
                  <Button type="submit" className="rounded-full">
                    <ChevronRight className="h-4 w-4 mr-2" />
                    Ajukan
                  </Button>
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

/* Simple check icon (tanpa lib tambahan) */
function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="mt-0.5"
    >
      <path
        d="M20 6L9 17l-5-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
