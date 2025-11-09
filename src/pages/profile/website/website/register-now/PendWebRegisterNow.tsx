// src/pages/SekolahIslamkuRegister.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  BookOpen,
  Calendar,
  ArrowRight,
  PlayCircle,
  X,
} from "lucide-react";
import WebsiteNavbar from "@/components/common/public/CWebsiteNavbar";
import WebsiteFooter from "../components/CPendWebFooter";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/* Helpers layout */
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
    <div className="w-full">{children}</div>
  </section>
);

/* Intro Modal (shadcn Dialog) */
const IntroModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
}> = ({ open, onClose, onProceed }) => {
  const [agree, setAgree] = useState(false);

  // lock scroll + esc (shadcn sudah handle focus trap; ini tambahan lock body scroll)
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : undefined)}>
      <DialogContent className="w-[92%] max-w-2xl rounded-3xl p-0">
        <div className="relative">
          {/* Close button (optional, karena Dialog sudah punya close area) */}
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="absolute right-3 top-3 rounded-xl p-2 text-foreground/80 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>

          <DialogHeader className="px-5 pb-0 pt-5">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border bg-card">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl">
                  Selamat Datang di SekolahIslamku Suite
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                  Platform end-to-end untuk digitalisasi sekolah:{" "}
                  <strong>PPDB</strong>, <strong>Akademik</strong>,{" "}
                  <strong>Absensi</strong>, <strong>Keuangan</strong>, hingga{" "}
                  <strong>Komunikasi</strong> orang tua—terpusat dan aman.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-5 pt-4">
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { icon: Users, text: "PPDB Online" },
                { icon: BookOpen, text: "Rapor Digital" },
                { icon: Calendar, text: "Jadwal & Presensi" },
              ].map((x) => (
                <Badge
                  key={x.text}
                  variant="secondary"
                  className="justify-start gap-2 rounded-2xl px-3 py-2 text-foreground"
                >
                  <x.icon className="h-4 w-4" /> {x.text}
                </Badge>
              ))}
            </div>

            {/* consent */}
            <label className="mt-4 flex select-none items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span>
                Saya telah membaca & menyetujui{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Ketentuan Layanan
                </a>{" "}
                dan{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Kebijakan Privasi
                </a>
                .
              </span>
            </label>

            {/* actions */}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button
                disabled={!agree}
                onClick={onProceed}
                className="rounded-full"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Lanjut ke Login/Register
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <a href="/demo">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Lihat Demo
                </a>
              </Button>
            </div>
          </div>

          <div className="h-4" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* PAGE: Intro only → redirect to login/register */
export default function PendWebRegisterNow() {
  const navigate = useNavigate();

  const proceed = () => {
    // arahkan ke halaman login/register milikmu
    navigate("/login?register=1");
  };

  // modal selalu tampil saat halaman dibuka
  const [open, setOpen] = useState(true);

  return (
    <FullBleed>
      <div className="min-h-screen w-screen overflow-x-hidden bg-background text-foreground">
        <WebsiteNavbar />
        <div className="h-22" />

        {/* Background hero halus (tanpa form) */}
        <div className="relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=2400&auto=format&fit=crop"
            alt="Sekolah digital"
            className="absolute inset-0 h-full w-full object-cover opacity-20 dark:opacity-25"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--background))] via-[hsl(var(--background))] to-[hsl(var(--background))]" />
          <Section className="relative py-20 sm:py-24 lg:py-28">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold md:text-5xl">
                Mulai Digitalisasi Sekolah Anda
              </h1>
              <p className="mt-3 text-sm text-muted-foreground md:text-base">
                Halaman ini hanya pengantar. Klik <strong>Lanjut</strong> di
                modal untuk menuju halaman <em>login/register</em>, lalu
                selesaikan pendaftaran di sana.
              </p>
              <Button
                onClick={() => setOpen(true)}
                className="mt-6 rounded-full"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Buka Modal Perkenalan
              </Button>
            </div>
          </Section>
        </div>

        {/* Modal Intro */}
        <IntroModal
          open={open}
          onClose={() => setOpen(false)}
          onProceed={proceed}
        />

        {/* FOOTER */}
        <WebsiteFooter />
      </div>
    </FullBleed>
  );
}
