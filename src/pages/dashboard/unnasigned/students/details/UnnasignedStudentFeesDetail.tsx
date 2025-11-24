// src/pages/dashboard/unnasigned/details/UnnasignedFeesDetail.tsx

import { useMemo, useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Receipt, GraduationCap, ArrowRight, Loader2 } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import type { PMBClassRow } from "../UnnasignedStudentInfo";

function formatRupiah(amount: number): string {
  return amount.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
}

/* =========================
   API Types (disederhanakan)
========================= */

type FeeRuleAmountOption = {
  code: string;
  label: string;
  amount: number;
};

type ApiFeeRule = {
  fee_rule_id: string;
  fee_rule_school_id: string;
  fee_rule_scope: string;
  fee_rule_term_id: string | null;
  fee_rule_general_billing_kind_id: string | null;
  fee_rule_bill_code: string | null;
  fee_rule_option_code: string | null;
  fee_rule_is_default: boolean;

  fee_rule_amount_options: FeeRuleAmountOption[];

  fee_rule_gbk_code_snapshot: string | null;
  fee_rule_gbk_name_snapshot: string | null;
  fee_rule_gbk_category_snapshot: string | null; // "registration", "spp", dll
  fee_rule_gbk_is_global_snapshot: boolean;
  fee_rule_gbk_visibility_snapshot: string | null;
  fee_rule_gbk_is_recurring_snapshot: boolean;
  fee_rule_gbk_requires_month_year_snapshot: boolean;
  fee_rule_gbk_requires_option_code_snapshot: boolean;
  fee_rule_gbk_default_amount_idr_snapshot: number | null;

  fee_rule_created_at: string;
  fee_rule_updated_at: string;
};

type ApiClass = {
  class_id: string;
  class_school_id: string;
  class_name: string;
  class_slug: string;
  class_start_date: string;
  class_end_date: string;
  class_registration_opens_at: string | null;
  class_registration_closes_at: string | null;
  class_quota_total: number | null;
  class_quota_taken: number;
  class_delivery_mode: "online" | "offline" | "hybrid";
  class_status: "active" | "inactive" | string;
  class_class_parent_id: string;
  class_parent_code_snapshot: string | null;
  class_parent_name_snapshot: string;
  class_parent_slug_snapshot: string | null;
  class_parent_level_snapshot: number;
  class_academic_term_id: string;
  class_academic_term_academic_year_snapshot: string;
  class_academic_term_name_snapshot: string;
  class_academic_term_slug_snapshot: string;
  class_academic_term_angkatan_snapshot: string;
  class_notes?: string | null;
};

type ApiTerm = {
  academic_term_id: string;
  academic_term_school_id: string;
  academic_term_academic_year: string;
  academic_term_name: string;
  academic_term_start_date: string;
  academic_term_end_date: string;
  academic_term_is_active: boolean;
  academic_term_angkatan: number | null;
  academic_term_slug: string | null;
};

type ApiTermItem = {
  term: ApiTerm;
  classes?: ApiClass[];
  fee_rules?: ApiFeeRule[];
};

type RegistrationEnrollResponse = {
  success: boolean;
  message: string;
  data: {
    enrollments: any[];
    payment: {
      payment_checkout_url: string | null;
      [key: string]: any;
    };
  };
};

type ApiListResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
};

export default function UnnasignedStudentFeesDetail() {
  const { school_slug, id } = useParams<{ school_slug: string; id: string }>();
  const navigate = useNavigate();

  const slug = school_slug ?? "sekolah";

  // === Fetch term + classes + fee_rules ===
  const { data, isLoading, isError } = useQuery({
    queryKey: ["pmb-fees-detail"],
    queryFn: async () => {
      const res = await api.get<ApiListResponse<ApiTermItem>>(
        "/u/academic-terms/list",
        {
          params: {
            include: "classes,fee_rules",
            per_page: 50,
          },
        }
      );
      return res.data;
    },
    enabled: true,
  });

  // ===== Bentuk data yang dibutuhkan untuk halaman ini =====
  const view = useMemo(() => {
    if (!data || !id) return null;

    for (const item of data.data) {
      const term = item.term;
      const classes = item.classes ?? [];
      const feeRules = item.fee_rules ?? [];

      for (const c of classes) {
        if (c.class_id !== id) continue;

        const regOpen =
          c.class_registration_opens_at ?? term.academic_term_start_date;
        const regClose =
          c.class_registration_closes_at ?? term.academic_term_end_date;

        const now = new Date();
        const openAt = regOpen ? new Date(regOpen) : null;
        const closeAt = regClose ? new Date(regClose) : null;

        const isOpenForRegistration = (() => {
          if (c.class_status.toLowerCase() !== "active") return false;
          if (openAt && now < openAt) return false;
          if (closeAt && now > closeAt) return false;
          if (
            c.class_quota_total != null &&
            c.class_quota_taken >= c.class_quota_total
          ) {
            return false;
          }
          return true;
        })();

        const angkatan =
          c.class_academic_term_angkatan_snapshot ||
          (term.academic_term_angkatan != null
            ? String(term.academic_term_angkatan)
            : "");

        const cls: PMBClassRow = {
          class_id: c.class_id,
          class_slug: c.class_slug,
          class_name: c.class_name,
          class_class_parent_name_snapshot: c.class_parent_name_snapshot,
          class_class_parent_level_snapshot: c.class_parent_level_snapshot,
          class_academic_term_name_snapshot:
            c.class_academic_term_name_snapshot || term.academic_term_name,
          class_academic_term_angkatan_snapshot: angkatan,
          class_delivery_mode: c.class_delivery_mode,
          class_registration_opens_at: regOpen,
          class_registration_closes_at: regClose,
          class_quota_total: c.class_quota_total,
          class_quota_taken: c.class_quota_taken,
          class_notes: c.class_notes ?? null,
          is_open_for_registration: isOpenForRegistration,
        };

        // fee_rules relevan untuk term ini
        const termFeeRules = feeRules.filter(
          (fr) =>
            fr.fee_rule_term_id === term.academic_term_id ||
            fr.fee_rule_scope === "term"
        );

        return {
          cls,
          term,
          feeRules: termFeeRules,
        };
      }
    }

    return null;
  }, [data, id]);

  // derive agar hooks di bawah bisa jalan walau view masih null
  const feeRules = view?.feeRules ?? [];
  const cls = view?.cls ?? null;

  // ====== DATA UNTUK PEMBAYARAN (REGISTRATION ONLY) ======

  const registrationRule: ApiFeeRule | undefined = useMemo(
    () =>
      feeRules.find(
        (fr) =>
          (fr.fee_rule_gbk_category_snapshot || "").toLowerCase().trim() ===
          "registration"
      ),
    [feeRules]
  );

  const optionChoices: FeeRuleAmountOption[] =
    registrationRule?.fee_rule_amount_options ?? [];

  const minSelectableAmount: number | null = useMemo(() => {
    const optMin =
      optionChoices.length > 0
        ? optionChoices.reduce<number | null>((min, opt) => {
            if (min === null) return opt.amount;
            return opt.amount < min ? opt.amount : min;
          }, null)
        : null;

    if (optMin != null) return optMin;

    const base = registrationRule?.fee_rule_gbk_default_amount_idr_snapshot;
    return base ?? null;
  }, [optionChoices, registrationRule]);

  // ====== STATE: mode pembayaran & pilihan ======
  const [paymentMode, setPaymentMode] = useState<"option" | "custom">("option");
  const [selectedOptionCode, setSelectedOptionCode] = useState<string | null>(
    optionChoices.length > 0 ? optionChoices[0].code : null
  );
  const [customAmount, setCustomAmount] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // sync kalau optionChoices berubah
  useEffect(() => {
    if (optionChoices.length > 0) {
      setSelectedOptionCode(optionChoices[0].code);
    } else {
      setSelectedOptionCode(null);
    }
  }, [optionChoices]);

  const selectedOption =
    optionChoices.find((o) => o.code === selectedOptionCode) ??
    optionChoices[0] ??
    null;

  const optionAmount = selectedOption?.amount ?? null;
  const customAmountNumber = Number.parseInt(customAmount || "0", 10) || 0;

  const isCustomInvalid =
    paymentMode === "custom" &&
    (customAmountNumber <= 0 ||
      (minSelectableAmount != null &&
        customAmountNumber < minSelectableAmount));

  const totalToPay =
    paymentMode === "option"
      ? optionAmount ?? 0
      : isCustomInvalid
      ? 0
      : customAmountNumber;

  const canSubmit =
    feeRules.length > 0 &&
    ((paymentMode === "option" && !!optionAmount) ||
      (paymentMode === "custom" && !isCustomInvalid && customAmountNumber > 0));

  const handlePayNow = async () => {
    if (!registrationRule || !cls || !canSubmit || totalToPay <= 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload: any = {
        class_id: cls.class_id,
        fee_rule_id: registrationRule.fee_rule_id,
        payment_method: "gateway",
        payment_gateway_provider: "midtrans",
        customer: {
          customer_first_name: "Budi",
          customer_last_name: "Santoso",
          customer_email: "budi@example.com",
          customer_phone: "+628123456789",
          billing_address: "Jl. Mawar No. 1",
        },
        notes:
          paymentMode === "option"
            ? `Ambil paket ${
                selectedOption?.label ?? selectedOption?.code ?? ""
              }.`
            : "Isi nominal sendiri.",
      };

      if (paymentMode === "option" && selectedOption?.code) {
        payload.fee_rule_option_code = selectedOption.code;
      } else if (paymentMode === "custom") {
        // kalau backendmu support custom amount, kirim di sini
        payload.custom_amount_idr = totalToPay;
      }

      const res = await api.post<RegistrationEnrollResponse>(
        "/u/payments/registration-enroll",
        payload
      );

      const checkoutUrl = res.data?.data?.payment?.payment_checkout_url ?? null;

      if (checkoutUrl) {
        // langsung lempar ke Midtrans
        window.location.href = checkoutUrl;
        // atau kalau mau tab baru:
        // window.open(checkoutUrl, "_blank");
      } else {
        setSubmitError(
          "Pembayaran berhasil dibuat, tapi tautan pembayaran tidak ditemukan. Silakan hubungi admin."
        );
      }
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ??
        "Gagal membuat pembayaran. Silakan coba lagi.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ======================
  // 🔁 BARU SETELAH SEMUA HOOK DI ATAS
  // ======================

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 md:py-14 md:px-6 space-y-6">
        <div>
          <Link
            to={`/${slug}/user/pendaftaran`}
            className="text-xs text-muted-foreground hover:underline"
          >
            ← Kembali ke daftar program
          </Link>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              Memuat rincian biaya...
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Silakan tunggu sebentar.</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !view || !cls) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 md:py-14 md:px-6 space-y-6">
        <div>
          <Link
            to={`/${slug}/user/pendaftaran`}
            className="text-xs text-muted-foreground hover:underline"
          >
            ← Kembali ke daftar program
          </Link>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              Rincian biaya tidak dapat ditampilkan
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Maaf, tidak dapat menemukan informasi biaya untuk program yang
              kamu pilih.
            </p>
            <p>Silakan kembali ke detail program atau hubungi admin sekolah.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 md:py-14 md:px-6 space-y-8">
      {/* breadcrumb */}
      <div className="flex items-center justify-between gap-2">
        <Link
          to={`/${slug}/user/${cls.class_id}`}
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
            Rincian komponen biaya awal
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
              Komponen biaya yang diatur sekolah
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Data diambil langsung dari aturan biaya (fee rules) periode ini.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-sm md:text-base">
          {/* ====== PILIHAN PEMBAYARAN (OPTION VS CUSTOM) ====== */}
          {registrationRule && (
            <div className="pt-4 border-t border-border/60 space-y-3">
              <h2 className="text-sm md:text-base font-semibold">
                Pilihan pembayaran
              </h2>
              <p className="text-[11px] md:text-xs text-muted-foreground">
                Untuk komponen berikut, kalau ada lebih dari satu pilihan
                nominal, kamu cukup pilih satu atau isi nominal sendiri (minimal
                sesuai ketentuan). Tidak harus membayar semua opsi sekaligus.
              </p>

              <div className="rounded-lg border px-4 py-3 space-y-4 bg-card/60">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">
                      {registrationRule.fee_rule_gbk_name_snapshot ??
                        "Biaya Pendaftaran"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pilih satu nominal yang ingin kamu bayarkan.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    PENDAFTARAN
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Mode 1: pilih dari opsi */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="payment-mode"
                        value="option"
                        className="h-3 w-3"
                        checked={paymentMode === "option"}
                        onChange={() => setPaymentMode("option")}
                      />
                      <span>Pilih dari daftar opsi</span>
                    </label>

                    <Select
                      disabled={
                        paymentMode !== "option" || optionChoices.length === 0
                      }
                      value={selectedOption?.code ?? ""}
                      onValueChange={(val) => setSelectedOptionCode(val)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih nominal" />
                      </SelectTrigger>
                      <SelectContent>
                        {optionChoices.map((opt) => (
                          <SelectItem key={opt.code} value={opt.code}>
                            {opt.label
                              ? `${opt.label} — ${formatRupiah(opt.amount)}`
                              : formatRupiah(opt.amount)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedOption && paymentMode === "option" && (
                      <p className="text-[11px] text-muted-foreground">
                        Dipilih: {selectedOption.label || selectedOption.code} (
                        {formatRupiah(selectedOption.amount)})
                      </p>
                    )}
                  </div>

                  {/* Mode 2: custom nominal */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="payment-mode"
                        value="custom"
                        className="h-3 w-3"
                        checked={paymentMode === "custom"}
                        onChange={() => setPaymentMode("custom")}
                      />
                      <span>Isi nominal sendiri</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Rp</span>
                      <input
                        type="number"
                        min={minSelectableAmount ?? undefined}
                        className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        disabled={paymentMode !== "custom"}
                      />
                    </div>

                    {paymentMode === "custom" && minSelectableAmount && (
                      <p className="text-[11px] text-muted-foreground">
                        Minimal {formatRupiah(minSelectableAmount)}.
                      </p>
                    )}

                    {isCustomInvalid && paymentMode === "custom" && (
                      <p className="text-[11px] text-destructive">
                        Nominal minimal{" "}
                        {minSelectableAmount
                          ? formatRupiah(minSelectableAmount)
                          : "tidak valid"}
                        .
                      </p>
                    )}
                  </div>
                </div>

                {/* Total yang akan dibayar */}
                <div className="flex items-center justify-between pt-3 border-t border-border/60 text-sm">
                  <span className="text-muted-foreground">
                    Total yang akan dibayar
                  </span>
                  <span className="font-semibold">
                    {totalToPay > 0 ? formatRupiah(totalToPay) : "-"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tombol ke Midtrans */}
          <div className="pt-4 flex flex-col gap-2">
            <Button
              className="w-full md:w-auto"
              size="lg"
              onClick={handlePayNow}
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengarahkan ke pembayaran...
                </>
              ) : (
                <>
                  Lanjut ke Pembayaran
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            {submitError && (
              <p className="text-xs text-destructive">{submitError}</p>
            )}

            <button
              type="button"
              className="text-xs text-muted-foreground hover:underline self-start"
              onClick={() => navigate(`/${slug}/user/${cls.class_id}`)}
            >
              Kembali tanpa membayar
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
