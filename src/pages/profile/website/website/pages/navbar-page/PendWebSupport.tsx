// src/pages/public/SupportPage.tsx
import React from "react";
import {
  Heart,
  Phone,
  Mail,
  Banknote,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import WebsiteNavbar from "@/components/common/public/CWebsiteNavbar";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

export default function PendWebSupport() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <WebsiteNavbar />
      <div className="h-16" />

      {/* ====== HERO FULL WIDTH ====== */}
      <FullBleed>
        <section
          className="
            bg-gradient-to-r
            from-[hsl(var(--primary))]
            to-[hsl(var(--secondary))]
            text-white
            py-20 px-4 sm:px-6 lg:px-8 text-center
          "
        >
          <Heart className="mx-auto mb-4 h-12 w-12 text-white/80" />
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">
            Dukung SekolahIslamKu
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-lg/7 text-white/90">
            Kontribusi Anda membantu kami terus menghadirkan layanan pendidikan
            Islam yang lebih baik bagi semua santri, orang tua, dan guru.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-full"
            >
              <NavLink to="/website/daftar-sekarang">
                Bergabung Sekarang
              </NavLink>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="rounded-full bg-white/10 text-white hover:bg-white/15"
            >
              <a href="#cara-dukung">Cara Mendukung</a>
            </Button>
          </div>
        </section>
      </FullBleed>

      {/* ====== 3 KARTU DUKUNGAN ====== */}
      <FullBleed>
        <section
          id="cara-dukung"
          className="w-full grid grid-cols-1 gap-6 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8"
        >
          <Card className="rounded-2xl shadow">
            <CardContent className="p-6 text-center">
              <Banknote className="mx-auto mb-3 h-10 w-10 text-green-500" />
              <h3 className="text-lg font-semibold">Donasi</h3>
              <p className="mt-1 mb-4 text-sm text-muted-foreground">
                Dukung operasional dan pengembangan fitur lewat donasi.
              </p>
              <Button
                asChild
                className="rounded-full bg-green-600 hover:bg-green-600/90"
              >
                <NavLink to="/website/donasi">Donasi Sekarang</NavLink>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow">
            <CardContent className="p-6 text-center">
              <Phone className="mx-auto mb-3 h-10 w-10 text-blue-500" />
              <h3 className="text-lg font-semibold">Hubungi Kami</h3>
              <p className="mt-1 mb-4 text-sm text-muted-foreground">
                Butuh panduan atau proposal? Tim kami siap membantu.
              </p>
              <Button
                asChild
                className="rounded-full bg-blue-600 hover:bg-blue-600/90"
              >
                <a href="tel:+628123456789">Telepon</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow">
            <CardContent className="p-6 text-center">
              <Mail className="mx-auto mb-3 h-10 w-10 text-purple-500" />
              <h3 className="text-lg font-semibold">Email</h3>
              <p className="mt-1 mb-4 text-sm text-muted-foreground">
                Kirim pertanyaan, saran, atau kolaborasi ke email resmi kami.
              </p>
              <Button
                asChild
                className="rounded-full bg-purple-600 hover:bg-purple-600/90"
              >
                <a href="mailto:support@sekolahislamku.id">Kirim Email</a>
              </Button>
            </CardContent>
          </Card>
        </section>
      </FullBleed>

      {/* ====== DETAIL & FAQ ====== */}
      <FullBleed>
        <section className="w-full grid grid-cols-1 gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-6">
              <h3 className="mb-3 text-lg font-semibold">Detail Donasi</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="text-muted-foreground">Bank:</span>{" "}
                  <span className="font-medium">BSI</span>
                </li>
                <li>
                  <span className="text-muted-foreground">No. Rekening:</span>{" "}
                  <span className="font-medium">1234 5678 9012</span>
                </li>
                <li>
                  <span className="text-muted-foreground">Atas Nama:</span>{" "}
                  <span className="font-medium">Yayasan SekolahIslamKu</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-6">
              <h3 className="mb-3 text-lg font-semibold">Pertanyaan Umum</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="inline-flex items-center gap-2 font-medium">
                    <HelpCircle className="h-4 w-4" /> Apakah donasi transparan?
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    Ya, laporan ringkas penggunaan donasi akan dipublikasikan.
                  </p>
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 font-medium">
                    <ShieldCheck className="h-4 w-4" /> Apakah ada bukti donasi?
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    Ada. Anda akan menerima konfirmasi via email setelah
                    verifikasi.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FOOTER STRIP */}
        <footer className="w-full border-t bg-card">
          <div className="flex w-full flex-col items-center justify-between gap-4 px-4 py-6 sm:px-6 md:flex-row lg:px-8">
            <p className="text-center text-sm text-muted-foreground md:text-left">
              Butuh bantuan cepat? Hubungi kami lewat telepon atau email.
            </p>
            <div className="flex items-center gap-3">
              <Button
                asChild
                className="rounded-full bg-blue-600 hover:bg-blue-600/90"
              >
                <a href="tel:+628123456789">Telepon</a>
              </Button>
              <Button
                asChild
                className="rounded-full bg-purple-600 hover:bg-purple-600/90"
              >
                <a href="mailto:support@sekolahislamku.id">Email</a>
              </Button>
            </div>
          </div>
        </footer>
      </FullBleed>
    </div>
  );
}
