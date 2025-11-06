// src/pages/sekolahislamku/assignment/AllAssignment.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  ArrowLeft,
  Plus,
} from "lucide-react";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import ModalAddAssignment, {
  type AddAssignmentPayload,
} from "./components/CTeacherModalAddAssignment";
import ModalEditAssignment from "./components/CTeacherModalEditAssignment";

/* =========================
   Types
========================= */
type AssignmentStatus = "terbuka" | "selesai" | "terlambat";

type IncomingAssignment = {
  id: string;
  title: string;
  dueDate: string; // ISO
  submitted: number;
  total: number;
  graded?: number;
  kelas?: string;
};

type AssignmentItem = {
  id: string;
  title: string;
  kelas?: string;
  dueDateISO: string;
  createdISO?: string;
  submitted: number;
  total: number;
  status: AssignmentStatus;
};

type LocationState = {
  assignments?: IncomingAssignment[];
  heading?: string;
};

/* =========================
   Helpers
========================= */
const dateShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      })
    : "-";

const computeStatus = (a: {
  dueDateISO: string;
  submitted: number;
  total: number;
}): AssignmentStatus => {
  const now = new Date();
  const due = new Date(a.dueDateISO);
  if (a.submitted >= a.total) return "selesai";
  if (due < now) return "terlambat";
  return "terbuka";
};

export default function CTeacherAllAssignment() {
  const navigate = useNavigate();

  // Ambil data dari route state
  const { state } = useLocation();
  const { assignments = [], heading } = (state ?? {}) as LocationState;

  // Normalisasi awal
  const initialItems = useMemo<AssignmentItem[]>(
    () =>
      (assignments ?? []).map((x) => {
        const base: AssignmentItem = {
          id: x.id,
          title: x.title,
          kelas: x.kelas,
          dueDateISO: x.dueDate,
          createdISO: undefined,
          submitted: x.submitted,
          total: x.total,
          status: "terbuka",
        };
        return { ...base, status: computeStatus(base) };
      }),
    [assignments]
  );

  // State lokal
  const [items, setItems] = useState<AssignmentItem[]>(initialItems);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<AssignmentStatus | "semua">("semua");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((a) => {
      const byStatus = status === "semua" ? true : a.status === status;
      const bySearch =
        a.title.toLowerCase().includes(s) ||
        (a.kelas ?? "").toLowerCase().includes(s);
      return byStatus && bySearch;
    });
  }, [q, status, items]);

  const statusBadgeClass = (st: AssignmentStatus) => {
    if (st === "terbuka") return "bg-primary/10 text-primary";
    if (st === "selesai") return "bg-green-500/10 text-green-600";
    return "bg-red-500/10 text-red-600";
  };

  // Modal tambah
  const [showTambah, setShowTambah] = useState(false);

  // Modal edit
  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingItem = useMemo(
    () => items.find((it) => it.id === editingId) || null,
    [items, editingId]
  );

  const handleEdit = (a: AssignmentItem) => {
    setEditingId(a.id);
    setShowEdit(true);
  };

  const handleEditSubmit = (p: {
    title: string;
    kelas?: string;
    dueDate: string; // ISO
    total: number;
    submitted?: number;
  }) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === editingId
          ? {
              ...it,
              title: p.title,
              kelas: p.kelas,
              dueDateISO: p.dueDate,
              total: p.total,
              submitted: p.submitted ?? it.submitted,
              status:
                (p.submitted ?? it.submitted) >= p.total
                  ? "selesai"
                  : new Date(p.dueDate) < new Date()
                  ? "terlambat"
                  : "terbuka",
            }
          : it
      )
    );
    setShowEdit(false);
    setEditingId(null);
  };

  const handleEditDelete = () => {
    if (!editingItem) return;
    if (!confirm(`Hapus tugas "${editingItem.title}"?`)) return;
    setItems((prev) => prev.filter((x) => x.id !== editingItem.id));
    setShowEdit(false);
    setEditingId(null);
  };

  const handleAddSubmit = (payload: AddAssignmentPayload) => {
    const newItem: AssignmentItem = {
      id: `local-${Date.now()}`,
      title: payload.title,
      kelas: payload.kelas,
      dueDateISO: payload.dueDate,
      createdISO: new Date().toISOString(),
      submitted: 0,
      total: payload.total,
      status: "terbuka",
    };
    setItems((prev) => [newItem, ...prev]);
    setShowTambah(false);
  };

  const handleDelete = (a: AssignmentItem) => {
    if (!confirm(`Hapus tugas "${a.title}"?`)) return;
    setItems((prev) => prev.filter((x) => x.id !== a.id));
  };

  const fmtDateLong = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "-";

  return (
    <div className="w-full bg-background text-foreground">
      {/* Modals */}
      <ModalAddAssignment
        open={showTambah}
        onClose={() => setShowTambah(false)}
        onSubmit={handleAddSubmit}
      />
      <ModalEditAssignment
        open={showEdit}
        onClose={() => {
          setShowEdit(false);
          setEditingId(null);
        }}
        defaultValues={
          editingItem
            ? {
                title: editingItem.title,
                kelas: editingItem.kelas,
                dueDate: editingItem.dueDateISO,
                total: editingItem.total,
                submitted: editingItem.submitted,
              }
            : undefined
        }
        onSubmit={handleEditSubmit}
        onDelete={editingItem ? handleEditDelete : undefined}
      />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9"
              aria-label="Kembali"
              title="Kembali"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span>{heading || "Semua Tugas"}</span>
          </div>
          <Button onClick={() => setShowTambah(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Tugas
          </Button>
        </div>

        {/* Search & Filter */}
        <Card className="mb-4">
          <CardContent className="p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1 flex items-center gap-2 rounded-xl border h-10 px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari tugas atau kelas…"
                className="border-0 shadow-none focus-visible:ring-0"
                aria-label="Cari tugas"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as AssignmentStatus | "semua")
                }
                className="h-10 rounded-xl px-3 text-sm bg-background border"
                aria-label="Filter status"
              >
                {["semua", "terbuka", "selesai", "terlambat"].map((s) => (
                  <option key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* List Tugas */}
        <div className="grid gap-3">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Tidak ada tugas ditemukan.
              </CardContent>
            </Card>
          ) : (
            filtered.map((a) => (
              <Card key={a.id} className="bg-card">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold truncate">{a.title}</h2>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${statusBadgeClass(
                            a.status
                          )}`}
                        >
                          {a.status[0].toUpperCase() + a.status.slice(1)}
                        </span>
                      </div>

                      <div className="mt-1 text-sm flex flex-wrap gap-3 text-muted-foreground">
                        {a.createdISO && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" /> Dibuat{" "}
                            {dateShort(a.createdISO)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" /> Batas{" "}
                          {dateShort(a.dueDateISO)}
                        </span>
                        <span className="flex items-center gap-1">
                          {a.submitted}/{a.total} terkumpul
                          {a.status === "selesai" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : a.status === "terlambat" ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : null}
                        </span>
                        {a.kelas && <Badge variant="outline">{a.kelas}</Badge>}
                      </div>
                    </div>

                    {/* Aksi */}
                    <div className="shrink-0 flex items-center gap-2">
                      <Link
                        to={`./${a.id}`}
                        state={{
                          assignment: {
                            id: a.id,
                            title: a.title,
                            dueDate: a.dueDateISO,
                            submitted: a.submitted,
                            total: a.total,
                          },
                        }}
                      >
                        <Button variant="secondary" size="sm">
                          Detail
                        </Button>
                      </Link>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(a)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(a)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Tooltip kecil untuk contoh pemakaian tanggal panjang (opsional) */}
        <div className="sr-only">{fmtDateLong(new Date().toISOString())}</div>
      </main>
    </div>
  );
}
