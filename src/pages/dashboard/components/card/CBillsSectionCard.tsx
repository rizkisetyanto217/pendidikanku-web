import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type BillItem = {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: "unpaid" | "paid" | "overdue";
};

type BillsSectionCardProps = {
  bills: BillItem[];
  dateFmt: (iso: string) => string;
  formatIDR: (n: number) => string;
  seeAllPath?: string;
  getPayHref?: (b: BillItem) => string;
};

export default function BillsSectionCard({
  bills,
  dateFmt,
  formatIDR,
  seeAllPath,
  getPayHref,
}: BillsSectionCardProps) {
  return (
    <Card className="p-4 border border-border bg-card text-card-foreground">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold">Tagihan Belum Dibayar</h2>
        {seeAllPath && (
          <Button variant="ghost" size="sm" asChild>
            <a href={seeAllPath} className="inline-flex items-center gap-1">
              Lihat Semua <ArrowRight size={14} />
            </a>
          </Button>
        )}
      </div>

      {bills.length === 0 ? (
        <p className="text-sm text-muted-foreground">Tidak ada tagihan aktif.</p>
      ) : (
        <div className="space-y-3">
          {bills.map((b) => (
            <div
              key={b.id}
              className="flex justify-between items-start border-b pb-2 text-sm"
            >
              <div>
                <p className="font-medium">{b.title}</p>
                <p className="text-muted-foreground text-xs">
                  Jatuh tempo: {dateFmt(b.dueDate)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatIDR(b.amount)}</p>
                {getPayHref && (
                  <a
                    href={getPayHref(b)}
                    className="text-xs text-primary hover:underline"
                  >
                    Bayar
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
