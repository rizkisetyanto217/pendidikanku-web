// src/components/schools/CSchoolAddClass.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";

/* shadcn/ui */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

/* ================= Types (samakan dengan SchoolClasses) ================ */
export type ClassStatus = "active" | "inactive";
export type ClassRow = {
  id: string;
  code: string;
  name: string;
  grade: string;
  homeroom: string;
  studentCount: number;
  schedule: "Pagi" | "Sore";
  status: ClassStatus;
};

/* ================= Helpers ================ */
export function generateClassId(code: string) {
  const slug = code.toLowerCase().replace(/\s+/g, "-");
  return `c-${slug}-${Date.now()}`;
}

function saveNewClassToLocalStorage(row: ClassRow) {
  const key = "sis_extras_classes";
  const prev = JSON.parse(localStorage.getItem(key) || "[]");
  prev.push(row);
  localStorage.setItem(key, JSON.stringify(prev));
}

/* ================= Component ================ */
export default function CSchoolAddClass({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (row: ClassRow) => void;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("1");
  const [homeroom, setHomeroom] = useState("");
  const [studentCount, setStudentCount] = useState<number | "">("");
  const [schedule, setSchedule] = useState<"Pagi" | "Sore">("Pagi");
  const [status, setStatus] = useState<ClassStatus>("active");

  // Autofill nama dari code jika kosong
  useEffect(() => {
    if (!name && code) setName(`Kelas ${code}`);
  }, [code, name]);

  const isValid = useMemo(() => {
    return (
      code.trim().length > 0 &&
      name.trim().length > 0 &&
      grade.trim().length > 0 &&
      homeroom.trim().length > 0 &&
      typeof studentCount === "number" &&
      studentCount > 0
    );
  }, [code, name, grade, homeroom, studentCount]);

  const resetForm = () => {
    setCode("");
    setName("");
    setGrade("1");
    setHomeroom("");
    setStudentCount("");
    setSchedule("Pagi");
    setStatus("active");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const row: ClassRow = {
      id: generateClassId(code),
      code: code.trim(),
      name: name.trim(),
      grade: grade.trim(),
      homeroom: homeroom.trim(),
      studentCount: Number(studentCount),
      schedule,
      status,
    };

    // Persist sementara ke localStorage supaya muncul di daftar
    saveNewClassToLocalStorage(row);

    onCreated?.(row);
    onClose();
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Tambah Kelas</DialogTitle>
          <DialogDescription>
            Lengkapi informasi kelas di bawah ini.
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="code">Kode</Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Mis. 3A"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="name">Nama Kelas</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mis. Kelas 3A"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="grade">Tingkat</Label>
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger id="grade">
                      <SelectValue placeholder="Pilih tingkat" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }).map((_, i) => {
                        const g = String(i + 1);
                        return (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="homeroom">Wali Kelas</Label>
                  <Input
                    id="homeroom"
                    value={homeroom}
                    onChange={(e) => setHomeroom(e.target.value)}
                    placeholder="Mis. Ust. Ahmad"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="studentCount">Jumlah Siswa</Label>
                  <Input
                    id="studentCount"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={String(studentCount)}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") return setStudentCount("");
                      const n = Number(v);
                      if (!Number.isNaN(n)) setStudentCount(n);
                    }}
                    placeholder="Mis. 30"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="schedule">Shift</Label>
                  <Select
                    value={schedule}
                    onValueChange={(v) => setSchedule(v as "Pagi" | "Sore")}
                  >
                    <SelectTrigger id="schedule">
                      <SelectValue placeholder="Pilih shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pagi">Pagi</SelectItem>
                      <SelectItem value="Sore">Sore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as ClassStatus)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Nonaktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    onClose();
                    // optional: reset saat ditutup manual
                    resetForm();
                  }}
                >
                  Batalkan
                </Button>
                <Button type="submit" disabled={!isValid} className="gap-2">
                  <Save size={16} />
                  Simpan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
