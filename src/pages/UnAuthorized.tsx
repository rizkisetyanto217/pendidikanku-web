// src/pages/Unauthorized.tsx
import * as React from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  ArrowLeft,
  Home,
  Building2,
  Landmark,
  KeyRound,
  UsersRound,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type LocState = { need?: string[]; from?: string };

// helper slug
function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

type Mode = "none" | "create-school" | "join-school";

export default function Unauthorized() {
  const nav = useNavigate();
  const loc = useLocation();
  const state = (loc.state || {}) as LocState;

  // ===== states: pilih aksi =====
  const [mode, setMode] = useState<Mode>("none");

  // ====== form DKM (dummy) ======
  const [mName, setMName] = useState("school Al-Hikmah");
  const [mCity, setMCity] = useState("Bandung");
  const [mAddress, setMAddress] = useState("Jl. Contoh No. 123");
  const [schoolCreatedSlug, setSchoolCreatedSlug] = useState<string | null>(
    null
  );

  const createSchool = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = slugify(mName) || "school-baru";
    // dummy “berhasil”
    setSchoolCreatedSlug(slug);
  };

  // ====== form join sekolah (dummy) ======
  const [code, setCode] = useState("");
  const [joinAs, setJoinAs] = useState<"teacher" | "student">("teacher");
  const [joined, setJoined] = useState<{ slug: string; school: string } | null>(
    null
  );

  const submitJoin = (e: React.FormEvent) => {
    e.preventDefault();
    // dummy resolver kode
    // contoh kode: ALHIKMAH-2025  -> slug "al-hikmah"
    let school = "SDIT Al-Hikmah";
    let slug = "al-hikmah";
    if (!/alhikmah|al-hikmah|hikmah|2025/i.test(code)) {
      school = "Contoh School";
      slug = "contoh-school";
    }
    setJoined({ slug, school });
  };

  return (
    <div className="min-h-screen grid place-items-center px-6 py-10 bg-background text-foreground">
      <Card className="w-full max-w-3xl shadow-sm">
        <CardContent className="p-6 md:p-8">
          {/* Header — Access Denied */}
          <div className="max-w-xl mx-auto text-center">
            <div className="mx-auto mb-4 h-14 w-14 grid place-items-center rounded-2xl bg-destructive/15 text-destructive">
              <ShieldAlert size={28} />
            </div>

            <h1 className="text-2xl font-bold mb-2">Akses Ditolak</h1>
            <p className="text-sm text-muted-foreground">
              Anda sudah masuk, tetapi tidak memiliki izin untuk mengakses
              halaman ini.
              {state.need?.length ? (
                <>
                  {" "}
                  (dibutuhkan: <b>{state.need.join(", ")}</b>)
                </>
              ) : null}
            </p>

            <div className="mt-6 flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() =>
                  state.from ? nav(state.from, { replace: true }) : nav(-1)
                }
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
              <Button onClick={() => nav("/")}>
                <Home className="mr-2 h-4 w-4" />
                Beranda
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="my-8 flex items-center gap-3">
            <Separator className="flex-1" />
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              Belum gabung kemanapun?
            </Badge>
            <Separator className="flex-1" />
          </div>

          {/* Pilihan Aksi */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Card: Jadi DKM */}
            <button
              onClick={() => setMode("create-school")}
              className={cn(
                "text-left rounded-2xl border p-4 transition hover:shadow-sm",
                mode === "create-school" && "ring-2 ring-primary"
              )}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="h-10 w-10 grid place-items-center rounded-xl bg-primary/15 text-primary">
                  <Landmark size={18} />
                </div>
                <div>
                  <div className="font-semibold">Saya Pengurus DKM</div>
                  <div className="text-xs text-muted-foreground">
                    Buat profil school (dummy)
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Cocok untuk takmir/pengurus: kelola profil, program, dan
                operasional.
              </p>
            </button>

            {/* Card: Masuk Guru/Murid */}
            <button
              onClick={() => setMode("join-school")}
              className={cn(
                "text-left rounded-2xl border p-4 transition hover:shadow-sm",
                mode === "join-school" && "ring-2 ring-primary"
              )}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="h-10 w-10 grid place-items-center rounded-xl bg-primary/15 text-primary">
                  <UsersRound size={18} />
                </div>
                <div>
                  <div className="font-semibold">Saya Guru / Murid</div>
                  <div className="text-xs text-muted-foreground">
                    Masuk dengan kode akses sekolah (dummy)
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Masukkan kode akses dari sekolah Anda untuk bergabung sebagai
                guru atau siswa.
              </p>
            </button>
          </div>

          {/* ===== Panel: Create school (DKM) ===== */}
          {mode === "create-school" && (
            <div className="mt-6 rounded-2xl border p-5">
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={18} />
                <h3 className="font-semibold">Buat school (Dummy)</h3>
              </div>

              {schoolCreatedSlug ? (
                <Alert className="mb-3 border-green-500/60 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle className="font-medium">
                    school berhasil dibuat!
                  </AlertTitle>
                  <AlertDescription>
                    Slug: <code>{schoolCreatedSlug}</code>
                  </AlertDescription>
                  <div className="mt-3 flex gap-2">
                    <Button
                      onClick={() => nav(`/${schoolCreatedSlug}/sekolah`)}
                    >
                      Masuk ke Dashboard DKM
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSchoolCreatedSlug(null);
                        setMode("none");
                      }}
                    >
                      Selesai
                    </Button>
                  </div>
                </Alert>
              ) : (
                <form
                  onSubmit={createSchool}
                  className="grid sm:grid-cols-2 gap-3"
                >
                  <div>
                    <Label htmlFor="mName">Nama school</Label>
                    <Input
                      id="mName"
                      value={mName}
                      onChange={(e) => setMName(e.target.value)}
                      placeholder="cth. school Al-Hikmah"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mCity">Kota/Kabupaten</Label>
                    <Input
                      id="mCity"
                      value={mCity}
                      onChange={(e) => setMCity(e.target.value)}
                      placeholder="cth. Bandung"
                      className="mt-2"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="mAddress">Alamat</Label>
                    <Input
                      id="mAddress"
                      value={mAddress}
                      onChange={(e) => setMAddress(e.target.value)}
                      placeholder="Jl. Contoh No. 123"
                      className="mt-2"
                    />
                  </div>

                  <div className="sm:col-span-2 flex justify-end">
                    <Button type="submit" className="gap-2">
                      Buat school (Dummy)
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ===== Panel: Join Sekolah (Guru/Murid) ===== */}
          {mode === "join-school" && (
            <div className="mt-6 rounded-2xl border p-5">
              <div className="flex items-center gap-2 mb-3">
                <KeyRound size={18} />
                <h3 className="font-semibold">
                  Masuk ke Sekolah dengan Kode (Dummy)
                </h3>
              </div>

              {joined ? (
                <Alert className="mb-3 border-green-500/60 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle className="font-medium">
                    Berhasil bergabung ke <b>{joined.school}</b>.
                  </AlertTitle>
                  <div className="mt-3 flex gap-2">
                    <Button
                      onClick={() =>
                        nav(
                          `/${joined.slug}/${
                            joinAs === "teacher" ? "guru" : "murid"
                          }`
                        )
                      }
                    >
                      Masuk Sekarang
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setJoined(null);
                        setMode("none");
                        setCode("");
                      }}
                    >
                      Selesai
                    </Button>
                  </div>
                </Alert>
              ) : (
                <form
                  onSubmit={submitJoin}
                  className="grid sm:grid-cols-2 gap-3"
                >
                  <div className="sm:col-span-2">
                    <Label htmlFor="code">Kode Akses Sekolah</Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <KeyRound className="h-4 w-4" />
                      </span>
                      <Input
                        id="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="cth. ALHIKMAH-2025"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Contoh kode: <code>ALHIKMAH-2025</code> (dummy).
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="joinAs">Masuk sebagai</Label>
                    <Select
                      value={joinAs}
                      onValueChange={(v) =>
                        setJoinAs(v as "teacher" | "student")
                      }
                    >
                      <SelectTrigger id="joinAs" className="mt-2">
                        <SelectValue placeholder="Pilih peran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher">Guru</SelectItem>
                        <SelectItem value="student">Murid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sm:col-span-2 flex justify-end">
                    <Button type="submit" disabled={!code.trim()}>
                      Gabung (Dummy)
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Jika merasa ini keliru, hubungi admin untuk meminta akses.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
