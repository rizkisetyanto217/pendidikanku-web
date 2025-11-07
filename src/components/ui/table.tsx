import * as React from "react"
import { cn } from "@/lib/utils"

/* ======================================================
   🧱 Komponen Tabel Theme-Aware + Zebra Row
====================================================== */

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto rounded-lg border border-border">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

/* ======================================================
   HEADER: Warna mengikuti CSS variable tema aktif
====================================================== */
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      // Style umum
      "text-left font-semibold text-primary-foreground",
      // Gunakan var(--primary) agar menyesuaikan dengan tema aktif
      "bg-primary/10 border-b border-border",
      "[&_th]:text-primary [&_th]:font-medium [&_th]:px-3 [&_th]:py-2",
      className
    )}
    {...props}
  />
))
TableHeader.displayName = "TableHeader"

/* ======================================================
   BODY: Zebra stripe + hover
====================================================== */
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      // Zebra pattern otomatis
      "[&_tr:nth-child(odd)]:bg-card [&_tr:nth-child(even)]:bg-muted/40",
      // Hover lembut
      "[&_tr:hover]:bg-accent/30",
      "[&_tr:last-child]:border-0",
      className
    )}
    {...props}
  />
))
TableBody.displayName = "TableBody"

/* ======================================================
   FOOTER
====================================================== */
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

/* ======================================================
   ROW
====================================================== */
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors data-[state=selected]:bg-accent",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

/* ======================================================
   HEAD CELL
====================================================== */
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-3 text-left align-middle text-sm font-semibold text-primary",
      "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

/* ======================================================
   BODY CELL
====================================================== */
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-3 align-middle text-sm text-foreground",
      "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

/* ======================================================
   CAPTION
====================================================== */
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

/* ======================================================
   EXPORT ALL
====================================================== */
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
