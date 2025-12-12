import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type BillStatus = "paid" | "unpaid" | "overdue";

type Props = {
  status: BillStatus;
  className?: string;
};

export default function CBadgeBillStatus({ status, className }: Props) {
  switch (status) {
    case "paid":
      return (
        <Badge
          className={cn(
            "!text-[12px] bg-emerald-600/10 text-emerald-600 ring-1 ring-emerald-600/30",
            className
          )}>
          Lunas
        </Badge>
      );

    case "overdue":
      return (
        <Badge
          className={cn(
            "!text-[12px] bg-red-600/10 text-red-600 ring-1 ring-red-600/30",
            className
          )}>
          Terlambat
        </Badge>
      );

    case "unpaid":
    default:
      return (
        <Badge
          className={cn(
            "!text-[12px] bg-yellow-500/10 text-yellow-600 ring-1 ring-yellow-500/30",
            className
          )}>
          Belum Bayar
        </Badge>
      )
  }
}
