import { Card } from "@/components/ui/card";
import CButtonAllUnderline from "@/components/CButtonAllUnderline";
import { ReceiptText } from "lucide-react";
import { CMainTitleIcon } from "@/components/CMainTitleIcon";

type BillItem = {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: "unpaid" | "paid" | "overdue";
};

type BillsSectionCardProps = {
  /** daftar tagihan */
  bills: BillItem[];
  /** fungsi format tanggal */
  dateFmt: (iso: string) => string;
  /** fungsi format rupiah */
  formatIDR: (n: number) => string;
  /** path tombol lihat semua */
  seeAllPath?: string;
  /** link pembayaran per tagihan */
  getPayHref?: (b: BillItem) => string;
  /** judul section (opsional) */
  title?: string;
};

export default function BillsSectionCard({
  title = "Tagihan Belum Dibayar",
  bills,
  dateFmt,
  formatIDR,
  seeAllPath,
  getPayHref,
}: BillsSectionCardProps) {
  return (
    <Card className="p-4 border border-border bg-card text-card-foreground">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <CMainTitleIcon
          icon={<ReceiptText size={18} />}
          title={title}
          size="md"
        />
        {seeAllPath && <CButtonAllUnderline to={seeAllPath} />}
      </div>

      {/* Isi */}
      {bills.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Tidak ada tagihan aktif.
        </p>
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
