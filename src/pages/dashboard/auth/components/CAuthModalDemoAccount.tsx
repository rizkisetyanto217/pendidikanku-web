import * as React from "react";
import { Building2, GraduationCap, Users2, Sparkles } from "lucide-react";

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

// Demo roles
type DemoRole = "admin" | "teacher" | "student";

/* =============================================================================
   ModalDemoAccounts — shadcn/ui + design tokens only
   - Uses CSS variables (hsl(var(--...))) defined in your Tailwind base
   - No custom palette object, all colors follow shadcn tokens
============================================================================= */
export default function CModalDemoAccount({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (who: DemoRole) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-md p-8 rounded-2xl">
        <DialogHeader className="text-center items-center space-y-2">
          <div
            className={cn(
              "w-16 h-16 rounded-2xl grid place-items-center mb-2",
              "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))]",
              "shadow-lg"
            )}
          >
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Coba akun demo
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Pilih profil demo untuk auto-isi email & password.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <DemoBtn
            label="Admin Demo"
            icon={<Building2 className="w-5 h-5 text-primary-foreground" />}
            gradientClass="from-[hsl(var(--primary))] to-[hsl(var(--secondary))]"
            onClick={() => onPick("admin")}
          />
          <DemoBtn
            label="Guru Demo"
            icon={<Users2 className="w-5 h-5 text-primary-foreground" />}
            gradientClass="from-[hsl(var(--accent))] to-[hsl(var(--secondary))]"
            onClick={() => onPick("teacher")}
          />
          <DemoBtn
            label="Murid Demo"
            icon={<GraduationCap className="w-5 h-5 text-primary-foreground" />}
            gradientClass="from-[hsl(var(--chart-2))] to-[hsl(var(--secondary))]"
            onClick={() => onPick("student")}
          />
        </div>

        <Button
          variant="ghost"
          className="mx-auto mt-6 text-sm font-medium hover:bg-transparent text-muted-foreground"
          onClick={onClose}
        >
          Tutup
        </Button>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------------
   DemoBtn — gradient + card wrapper using tokens
---------------------------------------- */
function DemoBtn({
  label,
  icon,
  onClick,
  gradientClass,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  gradientClass: string;
}) {
  return (
    <Card
      className={cn(
        "w-full rounded-2xl border p-0 overflow-hidden",
        "transition-all duration-200 hover:shadow-md focus-within:shadow-md",
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
          "hover:bg-muted/50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-xl grid place-items-center shrink-0",
            "bg-gradient-to-br",
            gradientClass,
            "transition-transform group-hover:scale-[1.05] shadow"
          )}
        >
          {icon}
        </div>
        <span className="font-semibold text-foreground">{label}</span>
      </Button>
    </Card>
  );
}
