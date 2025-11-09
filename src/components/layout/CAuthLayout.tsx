// src/layout/CAuthLayout.tsx
import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, User2 } from "lucide-react";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter as DialogFoot,
} from "@/components/ui/dialog";

type AuthLayoutProps = {
  children: React.ReactNode;
  mode?: "login" | "register";
  fullWidth?: boolean;
  contentClassName?: string;
};

export default function AuthLayout({
  children,
  mode = "login",
  fullWidth = false,
  contentClassName = "",
}: AuthLayoutProps) {
  const isLogin = mode === "login";
  const navigate = useNavigate();

  const [openChoice, setOpenChoice] = useState(false);

  const handleOpenChoice = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setOpenChoice(true);
  }, []);

  const handleSelectChoice = useCallback(
    (choice: "school" | "user") => {
      setOpenChoice(false);
      navigate(choice === "school" ? "/register-sekolah" : "/register-user");
    },
    [navigate]
  );

  return (
    <div className="min-h-[100svh] w-full bg-background text-foreground flex items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* dekorasi halus */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full blur-[90px] bg-primary/25"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full blur-[90px] bg-secondary/25"
      />

      <Card
        className={[
          "relative w-full bg-card text-card-foreground shadow-xl border",
          fullWidth ? "max-w-none px-4 sm:px-6 lg:px-8 py-8" : "max-w-md p-0",
          contentClassName,
        ].join(" ")}
        style={{ borderRadius: 16 }}
      >
        {/* Accent top bar pakai shadcn Separator */}
        <Separator className="absolute left-6 right-6 top-0 -translate-y-[1.5px] h-[3px] rounded-b-full bg-gradient-to-r from-primary/60 to-secondary/60" />

        {/* Header opsional (biarkan kosong untuk fleksibilitas) */}
        {!fullWidth && <CardHeader className="pb-0" />}

        {/* Konten bebas (form/login/register yang kamu kirim) */}
        <CardContent className={fullWidth ? "p-0" : "px-8 pt-6 pb-2"}>
          {children}
        </CardContent>

        {/* Footer link login/register */}
        <CardFooter className={fullWidth ? "px-0 pt-4" : "px-8 pt-2"}>
          <div className="w-full text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>
                Belum punya akun?{" "}
                <Link
                  to="/register"
                  onClick={handleOpenChoice}
                  className="font-semibold text-primary hover:underline"
                >
                  Daftar sekarang
                </Link>
              </>
            ) : (
              <>
                Sudah punya?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-primary hover:underline"
                >
                  Masuk
                </Link>
              </>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Modal pilihan pendaftaran pakai shadcn Dialog */}
      <Dialog open={openChoice} onOpenChange={setOpenChoice}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pilih tipe pendaftaran</DialogTitle>
            <DialogDescription>
              Daftarkan sekolah untuk dashboard organisasi, atau daftar sebagai
              pengguna lalu bergabung ke sekolah.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <Button
              variant="default"
              className="justify-start gap-3"
              onClick={() => handleSelectChoice("school")}
            >
              <span className="inline-flex size-9 items-center justify-center rounded-md bg-primary-foreground/10">
                <Building2 className="size-5" />
              </span>
              <div className="flex flex-col items-start">
                <span className="font-medium">Daftarkan Sekolah</span>
                <span className="text-xs text-muted-foreground">
                  Buat organisasi & undang admin/guru/murid.
                </span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start gap-3"
              onClick={() => handleSelectChoice("user")}
            >
              <span className="inline-flex size-9 items-center justify-center rounded-md bg-muted">
                <User2 className="size-5" />
              </span>
              <div className="flex flex-col items-start">
                <span className="font-medium">Daftar sebagai Pengguna</span>
                <span className="text-xs text-muted-foreground">
                  Buat akun pribadi, nanti bisa gabung sekolah.
                </span>
              </div>
            </Button>
          </div>

          <DialogFoot className="sm:justify-start">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpenChoice(false)}
            >
              Batal
            </Button>
          </DialogFoot>
        </DialogContent>
      </Dialog>
    </div>
  );
}