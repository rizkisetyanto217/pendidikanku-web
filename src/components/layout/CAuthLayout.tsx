// src/components/layout/CAuthLayout.tsx
import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type AuthLayoutProps = {
  children: React.ReactNode;
  mode?: "login" | "register";
  fullWidth?: boolean;
  contentClassName?: string;
};

export default function AuthLayout({
  children,
  fullWidth = false,
  contentClassName = "",
}: AuthLayoutProps) {
  // reserved kalau nanti mau dipakai

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
        {/* Accent top bar */}
        <Separator className="absolute left-6 right-6 top-0 -translate-y-[1.5px] h-[3px] rounded-b-full bg-gradient-to-r from-primary/60 to-secondary/60" />

        {/* Header kosong untuk mode non-fullWidth */}
        {!fullWidth && <CardHeader className="pb-0" />}

        {/* Konten bebas (login/register) */}
        <CardContent className={fullWidth ? "p-0" : "px-8 pt-6 pb-2"}>
          {children}
        </CardContent>

        {/* Footer dibiarkan kosong supaya isi diatur dari page */}
        {fullWidth ? null : <CardFooter />}
      </Card>
    </div>
  );
}