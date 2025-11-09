// src/pages/public/Panduan.tsx
import * as React from "react";
import {
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

/* shadcn/ui */
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

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

export default function PendWebGuide() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <WebsiteNavbar />
      <div className="h-16" />

      {/* HERO */}
      <FullBleed>
        <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-90" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Panduan SekolahIslamku
          </h1>
          <p className="text-sm md:text-base opacity-90 mb-6 max-w-2xl mx-auto">
            Temukan panduan penggunaan, dokumentasi, dan tutorial agar lebih
            cepat memahami fitur-fitur SekolahIslamku.
          </p>
        </section>
      </FullBleed>

      {/* 3 KARTU PANDUAN */}
      <FullBleed>
        <section className="w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="rounded-2xl text-center">
              <CardContent className="p-6">
                <FileText className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Mulai Cepat</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Ikuti panduan langkah awal untuk setup akun sekolah Anda.
                </p>
                <Button asChild className="rounded-full">
                  <a href="/docs/quickstart">Baca Panduan</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl text-center">
              <CardContent className="p-6">
                <BookOpen className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Dokumentasi</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Dokumentasi lengkap untuk modul akademik, keuangan, dan
                  administrasi.
                </p>
                <Button asChild variant="secondary" className="rounded-full">
                  <a href="/docs">Lihat Dokumentasi</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl text-center">
              <CardContent className="p-6">
                <Video className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Video Tutorial</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Belajar lebih cepat lewat video tutorial interaktif.
                </p>
                <Button asChild variant="secondary" className="rounded-full">
                  <a href="/website/tutorial">Tonton Video</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </FullBleed>

      {/* FAQ & Tips (Accordion) */}
      <FullBleed>
        <section className="w-full px-4 sm:px-6 lg:px-8 pb-12">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3">Pertanyaan Umum</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-1">
                    <AccordionTrigger className="text-left">
                      <span className="inline-flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        Bagaimana cara login?
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Gunakan akun yang diberikan sekolah Anda. Jika lupa sandi,
                      gunakan fitur “Lupa Password” untuk reset melalui
                      email/nomor ponsel yang terdaftar.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq-2">
                    <AccordionTrigger className="text-left">
                      <span className="inline-flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Apakah data saya aman?
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Ya. Kami menerapkan enkripsi data, kontrol akses berbasis
                      peran, dan backup terjadwal untuk menjaga keamanan &
                      integritas data sekolah.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3">Tips Penggunaan</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li>Perbarui data siswa dan guru secara berkala.</li>
                  <li>Gunakan fitur ekspor untuk menyimpan laporan penting.</li>
                  <li>
                    Aktifkan notifikasi untuk update akademik dan keuangan.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </FullBleed>

      {/* CTA STRIP */}
      <FullBleed>
        <section className="w-full bg-card border-t border-border">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Masih butuh bantuan? Kunjungi dokumentasi lengkap kami.
            </p>
            <Button asChild className="rounded-full">
              <a href="/docs">Dokumentasi Lengkap</a>
            </Button>
          </div>
        </section>
      </FullBleed>

      {/* Footer penuh (opsional) */}
      {/* <WebsiteFooter /> */}
    </div>
  );
}
