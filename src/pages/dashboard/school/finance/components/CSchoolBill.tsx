// External
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Calendar as CalendarIcon, PlusCircle } from "lucide-react";

// Internal UI
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/pendidikanku-dashboard/components/ui/CPrimitives";

/** ===================== Types ===================== */
export type FormValue = {
  title: string;
  amount: number | "";
  due_date: string; // yyyy-mm-dd
  class_name?: string;
  type?: string;
  student_id?: string;
  description?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  palette: Palette;

  /** optional daftar pilihan */
  classOptions?: string[];
  typeOptions?: string[];
  studentOptions?: Array<{ value: string; label: string }>;

  /** submit handler */
  onSubmit: (data: FormValue) => void | Promise<void>;
  loading?: boolean;
  error?: string | null;

  /** nilai awal opsional */
  defaultValues?: Partial<FormValue>;
};

/** ===================== Utils ===================== */
function usePortalNode(id = "portal-root") {
  const [node, setNode] = useState<Element | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      document.body.appendChild(el);
    }
    setNode(el);
  }, [id]);

  return node;
}

/** ===================== Component ===================== */
export default function CreateInvoiceModal({
  open,
  onClose,
  palette,
  classOptions = [],
  typeOptions = [],
  studentOptions = [],
  onSubmit,
  loading = false,
  error = null,
  defaultValues = {},
}: Props) {
  // ⬇️ penting: kalau tidak open, jangan render apa pun
  if (!open) return null;

  const portalNode = usePortalNode();

  const [form, setForm] = useState<FormValue>({
    title: defaultValues.title ?? "",
    amount: defaultValues.amount ?? ("" as number | ""),
    due_date: defaultValues.due_date ?? new Date().toISOString().slice(0, 10),
    class_name: defaultValues.class_name ?? "",
    type: defaultValues.type ?? "",
    student_id: defaultValues.student_id ?? "",
    description: defaultValues.description ?? "",
  });

  // lock scroll + ESC untuk menutup
  useEffect(() => {
    if (open) {
      document.body.classList.add("lock-scroll");
    } else {
      document.body.classList.remove("lock-scroll");
    }
    return () => {
      document.body.classList.remove("lock-scroll");
    };
  }, [open]);

  const set = <K extends keyof FormValue>(k: K, v: FormValue[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const canSubmit =
    !!form.title &&
    !!form.due_date &&
    form.amount !== "" &&
    Number(form.amount) > 0;

  const body = (
    <div
      className="fixed inset-0 grid place-items-center px-3"
      style={{ background: "rgba(0,0,0,.35)", zIndex: 999999 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-invoice-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[700px]">
        <SectionCard
          palette={palette}
          className="rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden"
          style={{ background: palette.white1, color: palette.black1 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="p-4 md:p-5 flex items-center justify-between border-b"
            style={{ borderColor: palette.silver1 }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <PlusCircle size={20} color={palette.quaternary} />
              <h3
                id="create-invoice-title"
                className="text-lg font-semibold truncate"
              >
                Buat Tagihan
              </h3>
            </div>
            <button
              aria-label="Tutup"
              onClick={onClose}
              className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full"
              style={{
                border: `1px solid ${palette.silver1}`,
                background: palette.white2,
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {!!error && (
              <div
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: palette.error2, color: palette.error1 }}
              >
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm">Judul</label>
                <input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  className="w-full rounded-xl px-3 py-2 border outline-none"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white2,
                  }}
                  placeholder="Contoh: SPP September"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm">Nominal</label>
                <input
                  type="number"
                  min={0}
                  value={form.amount}
                  onChange={(e) =>
                    set(
                      "amount",
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full rounded-xl px-3 py-2 border outline-none"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white2,
                  }}
                  placeholder="cth: 150000"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm">Jatuh Tempo</label>
                <div
                  className="flex items-center gap-2 rounded-xl px-3 py-2 border"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white2,
                  }}
                >
                  <CalendarIcon size={16} />
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => set("due_date", e.target.value)}
                    className="bg-transparent outline-none w-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm">Jenis</label>
                <select
                  value={form.type ?? ""}
                  onChange={(e) => set("type", e.target.value || "")}
                  className="w-full rounded-xl px-3 py-2 border outline-none"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white2,
                  }}
                >
                  <option value="">Pilih jenis…</option>
                  {typeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm">Kelas</label>
                <select
                  value={form.class_name ?? ""}
                  onChange={(e) => set("class_name", e.target.value || "")}
                  className="w-full rounded-xl px-3 py-2 border outline-none"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white2,
                  }}
                >
                  <option value="">Semua / umum</option>
                  {classOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm">Siswa (opsional)</label>
                <select
                  value={form.student_id ?? ""}
                  onChange={(e) => set("student_id", e.target.value || "")}
                  className="w-full rounded-xl px-3 py-2 border outline-none"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white2,
                  }}
                >
                  <option value="">—</option>
                  {studentOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm">Deskripsi (opsional)</label>
                <textarea
                  value={form.description ?? ""}
                  onChange={(e) => set("description", e.target.value)}
                  className="w-full rounded-xl px-3 py-2 border outline-none"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white2,
                  }}
                  rows={3}
                  placeholder="Keterangan tambahan…"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Btn variant="ghost" palette={palette} onClick={onClose}>
                Batal
              </Btn>
              <Btn
                palette={palette}
                disabled={!canSubmit || loading}
                loading={loading}
                onClick={() =>
                  onSubmit({
                    ...form,
                    amount: Number(form.amount || 0),
                  })
                }
              >
                Simpan Tagihan
              </Btn>
            </div>

            {!canSubmit && (
              <div className="text-xs" style={{ color: palette.secondary }}>
                * Wajib isi: Judul, Nominal & Jatuh Tempo
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );

  return portalNode ? createPortal(body, portalNode) : body;
}
