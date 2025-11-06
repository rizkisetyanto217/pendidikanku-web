// src/pages/sekolahislamku/pages/student/StudentProfil.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Calendar,
  Mail,
  MapPin,
  Phone,
  User,
  GraduationCap,
  Award,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/* ===== Helpers ===== */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

/* ===== Data Dummy ===== */
const dummyStudent = {
  fullname: "Ahmad Fauzi",
  nis: "202512345",
  class: "X IPA 1",
  birthDate: "2010-04-15",
  birthPlace: "Jakarta",
  address: "Jl. Merdeka No. 45, Jakarta",
  phone: "+628123456789",
  email: "ahmad.fauzi@student.sekolahislamku.id",
  avatar: "",
  achievements: [
    "Juara 1 Olimpiade Matematika 2024",
    "Juara 2 MTQ Antar Sekolah 2023",
    "Peserta Lomba Cerdas Cermat Nasional 2022",
  ],
  subjects: ["Matematika", "Fisika", "Kimia", "Tahfidz", "Bahasa Arab"],
};

export default function StudentProfil() {
  const navigate = useNavigate();
  const [avatarPreview] = useState(dummyStudent.avatar);

  return (
    <div className="w-full bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <h1 className="text-base md:text-lg font-semibold">Profil Siswa</h1>
        </div>
      </header>

      <main className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="mx-auto max-w-6xl grid gap-6">
          {/* ---- Kartu Head (Avatar + Nama + Status) ---- */}
          <Card>
            <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {avatarPreview && (
                    <AvatarImage
                      src={avatarPreview}
                      alt={dummyStudent.fullname}
                    />
                  )}
                  <AvatarFallback className="text-lg font-semibold">
                    {getInitials(dummyStudent.fullname)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                  title="Ubah foto (coming soon)"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 text-center md:text-left space-y-2">
                <div>
                  <h2 className="text-lg font-semibold">
                    {dummyStudent.fullname}
                  </h2>
                  <div className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>{dummyStudent.class}</span>
                  </div>
                </div>

                <Badge className="w-fit">Aktif</Badge>
              </div>
            </CardContent>
          </Card>

          {/* ---- Info Dasar ---- */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Informasi Dasar</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">NIS</div>
                    <div className="font-medium">{dummyStudent.nis}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Tanggal Lahir</div>
                    <div className="font-medium">
                      {dateLong(dummyStudent.birthDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Tempat Lahir</div>
                    <div className="font-medium">{dummyStudent.birthPlace}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Alamat</div>
                    <div className="font-medium">{dummyStudent.address}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Telepon</div>
                    <div className="font-medium">{dummyStudent.phone}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Email</div>
                    <div className="font-medium">{dummyStudent.email}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ---- Mata Pelajaran ---- */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Mata Pelajaran</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2">
                {dummyStudent.subjects.map((sub, i) => (
                  <Badge key={i} variant="outline" className="gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {sub}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ---- Prestasi ---- */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Prestasi</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <ul className="space-y-2 text-sm">
                {dummyStudent.achievements.map((a, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Award className="h-4 w-4 mt-0.5 text-primary" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
