import * as React from "react";
import { Building2, GraduationCap, Sparkles, Users2 } from "lucide-react";

// shadcn/ui
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* =================================================================================
   ModalChooseRole — shadcn/ui + shadcn color tokens only
   - Follows your CSS variables (Tailwind @layer base) for light/dark & themes
   - No custom palette prop; uses hsl(var(--...)) via Tailwind utility classes
================================================================================= */

export default function CModalChooseRole({
  open,
  onClose,
  onPilih,
}: {
  open: boolean;
  onClose: () => void;
  onPilih: (tujuan: "dkm" | "teacher" | "student") => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-[420px] p-6 rounded-2xl">
        <DialogHeader className="items-center text-center">
          <div
            className={cn(
              "w-16 h-16 rounded-2xl grid place-items-center mb-4",
              "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))]",
              "shadow-lg"
            )}
          >
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>

          <DialogTitle className="text-2xl font-bold text-foreground">
            Apa peran Anda?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Pilih tujuan Anda bergabung di SekolahIslamKu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <RoleOption
            onClick={() => onPilih("dkm")}
            text="Jadi DKM / Admin school"
            icon={<Building2 className="w-5 h-5 text-primary-foreground" />}
            gradientClass="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))]"
          />

          <RoleOption
            onClick={() => onPilih("teacher")}
            text="Gabung Sebagai Guru"
            icon={<Users2 className="w-5 h-5 text-primary-foreground" />}
            gradientClass="bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--secondary))]"
          />

          <RoleOption
            onClick={() => onPilih("student")}
            text="Gabung Sebagai Murid"
            icon={<GraduationCap className="w-5 h-5 text-primary-foreground" />}
            gradientClass="bg-gradient-to-br from-[hsl(var(--chart-2))] to-[hsl(var(--secondary))]"
          />
        </div>

        <Button
          variant="ghost"
          className="mx-auto mt-4 text-sm font-medium hover:bg-transparent text-muted-foreground"
          onClick={onClose}
        >
          Nanti Saja
        </Button>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------------
   RoleOption — shadcn flavored button/card
   Uses shadcn tokens: border, background, foreground, muted, ring
---------------------------------------- */
function RoleOption({
  onClick,
  text,
  icon,
  gradientClass,
}: {
  onClick: () => void;
  text: string;
  icon: React.ReactNode;
  gradientClass: string;
}) {
  return (
    <Card
      className={cn(
        "w-full border rounded-2xl p-0 overflow-hidden",
        "transition-all duration-200",
        "hover:shadow-md focus-within:shadow-md",
        "group"
      )}
    >
      <Button
        type="button"
        variant="ghost"
        onClick={onClick}
        className={cn(
          "w-full py-4 h-auto rounded-2xl",
          "flex items-center justify-center gap-3",
          "bg-card text-card-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "hover:bg-muted/50"
        )}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-xl grid place-items-center shrink-0",
            "transition-transform group-hover:scale-[1.03]",
            gradientClass,
            "shadow"
          )}
        >
          {icon}
        </div>
        <span className="font-semibold text-foreground">{text}</span>
      </Button>
    </Card>
  );
}
