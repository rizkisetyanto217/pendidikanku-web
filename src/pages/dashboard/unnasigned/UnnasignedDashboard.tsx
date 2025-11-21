// src/pages/dashboard/unnasigned/UnnasignedDashboard.tsx
import React from "react";
import { useParams, useLocation } from "react-router-dom";

/* data user */
import { useCurrentUser } from "@/hooks/useCurrentUser";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

/* icons */
import {
  User,
  GraduationCap,
  Info,
  Phone,
  MessageCircle,
  CalendarDays,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const UnnasignedDashboard: React.FC = () => {
  const { school_slug } = useParams<{ school_slug: string }>();
  const location = useLocation();
  const { data: currentUser, isLoading } = useCurrentUser();

  const membership =
    currentUser?.membership ?? currentUser?.memberships?.[0] ?? null;

  const schoolName = membership?.school_name ?? "Masjid / Sekolah";
  const userName = currentUser?.user_name ?? "Teman Santri";
  const userEmail = currentUser?.email ?? "";

  // Basis URL (misalnya: /diploma-ilmi)
  const baseSlug = school_slug ? `/${school_slug}` : "";

  // Kamu bisa sesuaikan ini dengan rute yang sudah ada
  const registrationUrl = `${baseSlug}/pendaftaran`;
  const contactUrl = `${baseSlug}/kontak`; // placeholder, bisa diarahkan ke halaman kontak sekolah
  const programsUrl = `${baseSlug}/program`; // placeholder list program/kelas

  if (isLoading && !currentUser) {
    return (
      <div className="p-6 grid gap-4">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background text-foreground">
      <main className="max-w-screen-2xl mx-auto py-6 px-4 space-y-6">
        {/* Header status */}
        <Card className="shadow-sm">
          <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="h-12 w-12 rounded-full grid place-items-center bg-primary/10 text-primary">
                <User className="h-6 w-6" />
              </span>
              <div>
                <div className="text-sm text-muted-foreground">
                  Selamat datang
                </div>
                <div className="text-lg font-semibold leading-tight">
                  {userName}
                </div>
                <div className="text-xs text-muted-foreground">
                  Terhubung ke: {schoolName}
                  {userEmail ? ` • ${userEmail}` : ""}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                <Info className="h-3.5 w-3.5 mr-1" />
                Status: Belum masuk kelas
              </Badge>
              <Badge variant="outline">
                <GraduationCap className="h-3.5 w-3.5 mr-1" />
                Menunggu penempatan kelas
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 3 highlight cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Apa artinya?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Akunmu sudah terhubung dengan{" "}
                <span className="font-medium">{schoolName}</span>, tetapi kamu
                belum dimasukkan ke kelas tertentu.
              </p>
              <p>
                Biasanya ini terjadi ketika proses pendaftaran masih berjalan
                atau admin belum meng-input kelasmu di sistem.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                Kenapa perlu masuk kelas?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                  <span>
                    Agar jadwal belajar & kajianmu tampil di dashboard.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                  <span>
                    Supaya bisa menerima tugas, ujian, dan nilai resmi.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                  <span>
                    Untuk memudahkan ustadz/ustadzah memantau kehadiran &
                    perkembanganmu.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Langkah cepat
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Pilih salah satu langkah di bawah ini untuk mulai bergabung ke
                kelas:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Konfirmasi ke admin/pengelola masjid/sekolah.</li>
                <li>Tanyakan program atau kelas yang tersedia.</li>
                <li>Pastikan data namamu sesuai dengan data pendaftaran.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* CTA utama */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          {/* Kiri: ajakan bergabung */}
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                Mulai gabung ke kelas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                InsyaAllah di {schoolName} tersedia beberapa program/kelas. Kamu
                bisa mulai dari:
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Mendaftar program atau kelas yang kamu inginkan.</li>
                <li>
                  Menunggu admin memverifikasi dan menempatkanmu ke kelas.
                </li>
                <li>
                  Setelah masuk kelas, jadwal, tugas, dan nilai akan muncul di
                  dashboard.
                </li>
              </ol>

              <div className="pt-3 space-y-2">
                <Button
                  className="w-full justify-between"
                  onClick={() => (window.location.href = registrationUrl)}
                >
                  <span>Daftar program / kelas sekarang</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => (window.location.href = programsUrl)}
                >
                  <span>Lihat daftar program yang tersedia</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Kanan: kontak & bantuan */}
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                Butuh bantuan?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Kalau merasa sudah daftar tapi belum dimasukkan ke kelas, atau
                masih bingung harus pilih program yang mana, kamu bisa:
              </p>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-0.5 text-primary" />
                  <span>
                    Menghubungi admin/panitia pendaftaran di {schoolName}.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <MessageCircle className="h-4 w-4 mt-0.5 text-primary" />
                  <span>
                    Menanyakan via WhatsApp/nomor kontak resmi masjid/sekolah
                    untuk menanyakan status penempatan kelas.
                  </span>
                </li>
              </ul>

              <div className="pt-3 space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => (window.location.href = contactUrl)}
                >
                  Buka halaman kontak / informasi admin
                </Button>
              </div>

              <Separator className="my-2" />

              <p className="text-xs text-muted-foreground">
                Posisi saat ini:{" "}
                <span className="font-mono break-all">{location.pathname}</span>
                . Setelah admin memasukkanmu ke kelas, tampilan dashboard ini
                akan otomatis berubah menjadi dashboard siswa lengkap (jadwal,
                tugas, nilai, dan tagihan).
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default UnnasignedDashboard;