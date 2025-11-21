// src/pages/profile/website/website/pmb/PendWebPMBFeesDetail.tsx
import { useParams, Link, useNavigate } from "react-router-dom";
import { Receipt, GraduationCap, Info, ArrowRight } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { dummyClasses } from "../UnnasignedInfo";
import type { PMBClassRow } from "../UnnasignedInfo";

function formatRupiah(amount: number): string {
  return amount.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
}

export default function PendWebPMBFeesDetail() {
  const { school_slug, id } = useParams<{ school_slug: string; id: string }>();
  const navigate = useNavigate();

  const slug = school_slug ?? "sekolah";

  const cls: PMBClassRow | undefined = dummyClasses.find(
    (c) => c.class_id === id
  );

  // 👉 angka dummy dulu, nanti bisa diganti hasil fetch backend
  const biayaPendaftaran = 150_000;
  const sppBulanPertama = 350_000;
  const totalBayar = biayaPendaftaran + sppBulanPertama;

  if (!cls) {
    return (
      <div className="mx-auto py-10 px-4 md:py-14 md:px-6 space-y-6">
        <div>
          <Link
            to={`/${slug}/pmb`}
            className="text-xs text-muted-foreground hover:underline"
          >
            ← Kembali ke daftar program
          </Link>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              Program tidak ditemukan
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Maaf, program / kelas PMB yang kamu buka tidak ditemukan atau
              sudah tidak aktif.
            </p>
            <p>
              Kamu bisa kembali ke daftar program untuk melihat pilihan lain.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  function handlePayNow() {
    // TODO: ganti dengan call backend + redirect ke Midtrans Snap
    // misalnya: window.location.href = snapUrl;
    // console.log("Bayar sekarang untuk class_id:", cls.class_id);
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 md:py-14 md:px-6 space-y-8">
      {/* breadcrumb */}
      <div className="flex items-center justify-between gap-2">
        <Link
          to={`/${slug}/pmb/${cls.class_id}`}
          className="text-xs text-muted-foreground hover:underline"
        >
          ← Kembali ke detail program
        </Link>
      </div>

      {/* header */}
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs bg-background/60 backdrop-blur">
          <Badge variant="outline" className="gap-1 px-2 py-0.5">
            <GraduationCap className="w-3 h-3" />
            PMB {slug}
          </Badge>
          <span className="text-muted-foreground">
            Rincian biaya awal pendaftaran
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {cls.class_name}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {cls.class_class_parent_name_snapshot} •{" "}
          {cls.class_academic_term_name_snapshot}
        </p>
      </header>

      {/* table biaya */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="w-9 h-9 rounded-full grid place-items-center bg-primary/10">
            <Receipt className="w-4 h-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base md:text-lg">
              Ringkasan yang perlu dibayarkan sekarang
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Biaya pendaftaran + SPP bulan pertama.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-sm md:text-base">
          <div className="overflow-x-auto rounded-lg border bg-card/40">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/60">
                <tr className="text-xs md:text-sm">
                  <th className="px-4 py-3 text-left font-medium">Komponen</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Keterangan
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Nominal</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border/60">
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium">Biaya Pendaftaran</div>
                    <div className="mt-1 inline-flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        PENDAFTARAN
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-emerald-600/15 text-emerald-500"
                      >
                        SEKALI BAYAR
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground align-top">
                    Dibayarkan sekali saat mendaftar untuk memproses pendaftaran
                    siswa baru.
                  </td>
                  <td className="px-4 py-3 text-right align-top font-medium">
                    {formatRupiah(biayaPendaftaran)}
                  </td>
                </tr>

                <tr className="border-t border-border/60">
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium">SPP Bulan Pertama</div>
                    <div className="mt-1 inline-flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        SPP
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-blue-600/15 text-blue-500"
                      >
                        BULANAN
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground align-top">
                    SPP untuk bulan pertama sejak siswa resmi diterima dan mulai
                    aktif belajar.
                  </td>
                  <td className="px-4 py-3 text-right align-top font-medium">
                    {formatRupiah(sppBulanPertama)}
                  </td>
                </tr>

                <tr className="border-t border-border/80 bg-muted/40">
                  <td className="px-4 py-3 font-semibold" colSpan={2}>
                    Total dibayarkan sekarang
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-500">
                    {formatRupiah(totalBayar)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="flex items-start gap-2 text-[11px] text-muted-foreground">
            <Info className="w-3 h-3 mt-[2px]" />
            <span>
              Nominal di atas hanya contoh. Admin sekolah nantinya bisa mengatur
              komponen dan besaran biaya langsung dari dashboard Madinah Salam.
            </span>
          </p>

          {/* Tombol ke Midtrans */}
          <div className="pt-2 flex flex-col gap-2">
            <Button
              className="w-full md:w-auto"
              size="lg"
              onClick={handlePayNow}
            >
              Lanjut ke Pembayaran
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <button
              type="button"
              className="text-xs text-muted-foreground hover:underline self-start"
              onClick={() => navigate(`/${slug}/pmb/${cls.class_id}`)}
            >
              Kembali tanpa membayar
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
