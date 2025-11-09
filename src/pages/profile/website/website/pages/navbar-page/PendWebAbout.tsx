// src/pages/public/About.tsx
import * as React from "react";
import { Users, BookOpen, Award, Heart } from "lucide-react";

/* shadcn/ui */
import { Card, CardContent } from "@/components/ui/card";

/* Komponen kamu */
import WebsiteNavbar from "@/components/common/public/CWebsiteNavbar";
import WebsiteFooter from "@/pages/profile/website/website/components/CPendWebFooter";

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

export default function PendWebAbout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <WebsiteNavbar />
      <div className="h-16" />

      <FullBleed>
        {/* HERO (pakai token shadcn) */}
        <section className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="mx-auto h-12 w-12 mb-4 opacity-90" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Tentang SekolahIslamku
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-sm md:text-base opacity-90">
            Kami mendukung sekolah Islam agar efisien, transparan, dan mudah
            dalam mengelola akademik, keuangan, dan komunikasi.
          </p>
        </section>

        {/* VISI & MISI */}
        <section className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3">Visi</h3>
                <p className="text-sm text-muted-foreground">
                  Menjadi platform pendidikan Islam digital yang terpercaya
                  untuk mendukung sekolah, guru, siswa, dan orang tua dalam
                  menciptakan ekosistem pembelajaran modern dan islami.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3">Misi</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li>Memberikan layanan administrasi sekolah yang efisien.</li>
                  <li>
                    Meningkatkan keterlibatan orang tua dalam pendidikan anak.
                  </li>
                  <li>
                    Mendukung guru dalam pengelolaan kelas &amp; kurikulum.
                  </li>
                  <li>Transparansi dalam keuangan &amp; komunikasi sekolah.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* NILAI & KEUNGGULAN */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-center font-bold text-2xl md:text-3xl mb-8">
            Nilai &amp; Keunggulan Kami
          </h2>

          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="rounded-2xl text-center">
              <CardContent className="p-6">
                <Users className="h-10 w-10 text-primary mx-auto mb-3" />
                <h4 className="font-semibold text-lg mb-2">Kolaboratif</h4>
                <p className="text-sm text-muted-foreground">
                  Komunikasi guru, siswa, dan orang tua dalam satu platform.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl text-center">
              <CardContent className="p-6">
                <BookOpen className="h-10 w-10 text-primary mx-auto mb-3" />
                <h4 className="font-semibold text-lg mb-2">Inovatif</h4>
                <p className="text-sm text-muted-foreground">
                  Akademik, keuangan, absensi, dan perpustakaan dalam satu
                  sistem.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl text-center">
              <CardContent className="p-6">
                <Award className="h-10 w-10 text-primary mx-auto mb-3" />
                <h4 className="font-semibold text-lg mb-2">Terpercaya</h4>
                <p className="text-sm text-muted-foreground">
                  Keamanan data dengan enkripsi &amp; kontrol akses ketat.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FOOTER (pakai komponen shadcn-ized) */}
        <WebsiteFooter />
      </FullBleed>
    </div>
  );
}
