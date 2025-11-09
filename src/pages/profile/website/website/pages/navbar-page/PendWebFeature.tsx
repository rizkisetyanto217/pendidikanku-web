// src/pages/public/Fitur.tsx
import * as React from "react";
import {
  BookOpen,
  Users,
  Clock,
  Calendar,
  DollarSign,
  MessageSquare,
  Layers,
  Library,
  CheckCircle2,
} from "lucide-react";

/* shadcn/ui */
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* Komponenmu */
import WebsiteNavbar from "@/components/common/public/CWebsiteNavbar";
// import WebsiteFooter from "@/components/CPendWebFooter"; // pakai kalau mau footer penuh

const FullBleed: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div
    className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen ${className}`}
  >
    {children}
  </div>
);

export default function PendWebFeature() {
  const fiturList = [
    {
      icon: Users,
      title: "Penerimaan Siswa Baru (PPDB)",
      desc: "Form online, seleksi, verifikasi berkas, pembayaran, hingga penetapan kelas otomatis.",
    },
    {
      icon: BookOpen,
      title: "Akademik & Kurikulum",
      desc: "RPP, penjadwalan, penilaian, rapor digital, kelulusan—tersentral.",
    },
    {
      icon: Clock,
      title: "Absensi & Kehadiran",
      desc: "Scan QR/ID, izin/surat sakit, rekap kehadiran real-time untuk guru & siswa.",
    },
    {
      icon: DollarSign,
      title: "Keuangan & SPP",
      desc: "Tagihan otomatis, pembayaran online, laporan keuangan transparan.",
    },
    {
      icon: MessageSquare,
      title: "Komunikasi & Notifikasi",
      desc: "Pengumuman via WhatsApp, email, dan notifikasi aplikasi.",
    },
    {
      icon: Calendar,
      title: "Kalender Akademik",
      desc: "Jadwal ujian, libur, dan kegiatan dalam satu kalender digital.",
    },
    {
      icon: Library,
      title: "Inventaris & Perpustakaan",
      desc: "Kelola buku, inventaris kelas, peminjaman dan pengembalian.",
    },
  ];

  const advantages = [
    "Implementasi cepat < 7 hari",
    "Satu dashboard terintegrasi",
    "Fleksibel & mudah digunakan",
    "Keamanan data terjamin",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <WebsiteNavbar />
      <div className="h-16" />

      {/* HERO */}
      <FullBleed>
        <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 text-center">
          <Layers className="mx-auto h-12 w-12 mb-4 opacity-90" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Fitur SekolahIslamku
          </h1>
          <p className="text-sm md:text-base opacity-90 mb-6 max-w-2xl mx-auto">
            Semua modul penting untuk operasional sekolah—akademik,
            administrasi, keuangan, dan komunikasi—tersedia dalam satu platform.
          </p>
        </section>
      </FullBleed>

      {/* FITUR GRID */}
      <FullBleed>
        <section className="w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fiturList.map((f) => (
              <Card key={f.title} className="rounded-2xl border bg-card">
                <CardContent className="p-6">
                  <f.icon className="h-10 w-10 text-primary mb-3" />
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </FullBleed>

      {/* KEUNGGULAN SINGKAT */}
      <FullBleed>
        <section className="w-full px-4 sm:px-6 lg:px-8 pb-12">
          <Card className="rounded-2xl border bg-card">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 text-center">
                Keunggulan Platform
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                {advantages.map((adv) => (
                  <div
                    key={adv}
                    className="flex items-center gap-2 rounded-xl border px-3 py-2 bg-background"
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-foreground">{adv}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </FullBleed>

      {/* CTA STRIP */}
      <FullBleed>
        <section className="w-full bg-card border-t border-border">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Ingin tahu lebih banyak tentang fitur kami? Hubungi tim sales
              untuk demo gratis.
            </p>
            <Button asChild className="rounded-full">
              <a href="tel:+628123456789">Hubungi Sales</a>
            </Button>
          </div>
        </section>
      </FullBleed>

      {/* Footer penuh (opsional) */}
      {/* <WebsiteFooter /> */}
    </div>
  );
}
