// src/pages/sekolahislamku/student/StudentMenuGrids.tsx
import { type ReactNode, useMemo } from "react";
import { Link } from "react-router-dom";

// shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Icons (tetap)
import { BookOpen, Wallet, CalendarDays, IdCard } from "lucide-react";

/* ================= Types ================= */
type MenuItem = {
  key: string;
  label: string;
  to?: string;
  icon: ReactNode;
};

/* ================= Components ================= */
export default function StudentMenuGrids() {
  const items: MenuItem[] = useMemo(
    () => [
      {
        key: "kelas-saya",
        label: "Kelas Saya",
        to: "kelas-saya",
        icon: <BookOpen />,
      },
      {
        key: "keuangan",
        label: "Pembayaran",
        to: "keuangan",
        icon: <Wallet />,
      },
      { key: "jadwal", label: "Jadwal", to: "jadwal", icon: <CalendarDays /> },
      {
        key: "profil",
        label: "Profil Murid",
        to: "profil-murid",
        icon: <IdCard />,
      },
    ],
    []
  );

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="mx-auto max-w-screen-2xl">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Akses Cepat Murid</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {items.map((it) => (
                  <MenuTile key={it.key} item={it} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function MenuTile({ item }: { item: MenuItem }) {
  return (
    <Link
      to={item.to || "#"}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      <Card className="h-full w-full rounded-2xl border bg-card text-card-foreground hover:bg-accent/50 transition-colors">
        <CardContent className="p-3 md:p-4 flex flex-col items-center justify-center text-center gap-2">
          <span className="h-12 w-12 md:h-14 md:w-14 grid place-items-center rounded-xl bg-primary/10 text-primary">
            {/* lucide icons otomatis ikut warna text */}
            <span className="size-6 md:size-7">{item.icon}</span>
          </span>
          <div className="text-xs md:text-sm font-medium leading-tight line-clamp-2">
            {item.label}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
