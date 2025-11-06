// src/pages/NotFound.tsx
import * as React from "react";
import { Home, Search, ArrowLeft, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function NotFound() {
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [glitchActive, setGlitchActive] = React.useState(false);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) =>
      setMousePos({ x: e.clientX, y: e.clientY });

    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 3000);

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(glitchInterval);
    };
  }, []);

  // helper warna dari CSS variables shadcn
  const h = (name: string) => `hsl(var(--${name}))`;

  const floating = Array.from({ length: 6 }, (_, i) => (
    <div
      key={i}
      className="absolute w-2 h-2 rounded-full animate-bounce opacity-70"
      style={{
        left: `${20 + i * 15}%`,
        top: `${30 + (i % 3) * 20}%`,
        animationDelay: `${i * 0.5}s`,
        animationDuration: "3s",
        background: `linear-gradient(90deg, ${h("accent")}, ${h("primary")})`,
        boxShadow: `0 0 10px ${h("primary")}55`,
      }}
    />
  ));

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background text-foreground">
      {/* radial spotlight mengikuti mouse */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}px ${
            mousePos.y
          }px, ${h("primary")}22, transparent 50%)`,
        }}
      />

      {/* dekorasi grid halus */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          mixBlendMode: "overlay",
          opacity: 0.15,
        }}
      />

      {/* dots melayang */}
      {floating}

      <Card className="z-10 w-full max-w-3xl border-border/60">
        <CardContent className="p-8 md:p-10 text-center">
          {/* angka 404 + glitch */}
          <div className="relative mb-8 select-none">
            <h1
              className={`text-9xl md:text-[12rem] font-black ${
                glitchActive ? "animate-pulse" : ""
              }`}
              style={{
                background: `linear-gradient(90deg, ${h("primary")}, ${h(
                  "accent"
                )})`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                textShadow: `0 6px 18px ${h("accent")}33`,
              }}
            >
              404
            </h1>

            {glitchActive && (
              <>
                <h1
                  className="absolute top-0 left-0 text-9xl md:text-[12rem] font-black opacity-70"
                  style={{ color: h("destructive") }}
                >
                  404
                </h1>
                <h1
                  className="absolute top-1 left-1 text-9xl md:text-[12rem] font-black opacity-60"
                  style={{ color: h("primary") }}
                >
                  404
                </h1>
              </>
            )}
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
            Sepertinya Anda tersesat di ruang digital. Jangan khawatir, mari
            kita bawa Anda kembali ke jalur yang benar!
          </p>

          {/* tombol aksi */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => window.history?.back()}
              className="group px-8 py-6 rounded-full text-primary-foreground bg-gradient-to-r from-primary to-accent hover:opacity-95"
            >
              <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
              Kembali
            </Button>

            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
              className="group px-8 py-6 rounded-full"
            >
              <Home className="mr-2 h-5 w-5 transition-transform group-hover:rotate-6" />
              Beranda
            </Button>

            <Button
              variant="outline"
              onClick={() => (window.location.href = "/search")}
              className="group px-8 py-6 rounded-full border-accent text-accent hover:bg-accent/10"
            >
              <Search className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              Cari
            </Button>
          </div>

          {/* garis + badge tip */}
          <div className="mt-10 flex items-center gap-3">
            <Separator className="flex-1" />
            <Badge variant="outline" className="gap-2">
              <Zap className="h-3.5 w-3.5 animate-pulse" />
              Tip: Gunakan navigasi untuk menjelajah
            </Badge>
            <Separator className="flex-1" />
          </div>

          {/* bintang dekoratif */}
          <div className="mt-8 flex justify-center gap-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 animate-pulse"
                style={{ opacity: 0.7, animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* fading bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: `linear-gradient(0deg, ${h("muted")}88, transparent)`,
        }}
      />
    </div>
  );
}
