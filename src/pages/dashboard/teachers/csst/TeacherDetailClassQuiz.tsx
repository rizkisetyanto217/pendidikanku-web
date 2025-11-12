import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash,
  CheckCircle,
  XCircle,
} from "lucide-react";

/* Tambahan untuk breadcrumb sistem dashboard */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

/* ===== Dummy types & data ===== */
type Question = { id: string; text: string; options: string[]; answer: number };
type Quiz = {
  id: string;
  title: string;
  published: boolean;
  createdAt: string;
  questions: Question[];
};

const DUMMY: Record<string, Quiz> = {
  "qz-1": {
    id: "qz-1",
    title: "Quiz Aljabar Dasar",
    published: true,
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: "q1",
        text: "Hasil dari 2x + 3 = 7 adalah?",
        options: ["x = 1", "x = 2", "x = 3", "x = 4"],
        answer: 1,
      },
    ],
  },
  "qz-2": {
    id: "qz-2",
    title: "Kuis Tajwid Dasar",
    published: false,
    createdAt: new Date().toISOString(),
    questions: [],
  },
};

/* ===== Page ===== */
const TeacherDetailClassQuiz: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // /:slug/guru/quizClass/:id
  const navigate = useNavigate();

  /* Atur breadcrumb dan title seperti SchoolAcademic */
  const { setHeader } = useDashboardHeader();

  useEffect(() => {
    setHeader({
      title: "qiuzClass",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "qiuzClass" },
      ],
      actions: null,
    });
  }, [setHeader]);

  const [quiz, setQuiz] = useState<Quiz>(
    () => DUMMY[id ?? "qz-1"] ?? DUMMY["qz-1"]
  );
  const [editingQid, setEditingQid] = useState<string | null>(null);
  const [form, setForm] = useState<{
    text: string;
    options: string[];
    answer: number;
  }>({
    text: "",
    options: ["", "", "", ""],
    answer: 0,
  });

  const resetForm = () =>
    setForm({ text: "", options: ["", "", "", ""], answer: 0 });

  /* ===== Actions ===== */
  const togglePublish = (v: boolean) =>
    setQuiz((q) => ({ ...q, published: v }));

  const addQuestion = () => {
    setQuiz((q) => ({
      ...q,
      questions: [
        ...q.questions,
        {
          id: "q" + (q.questions.length + 1),
          text: form.text || "Soal baru...",
          options: form.options.map(
            (o, i) => o || `Pilihan ${String.fromCharCode(65 + i)}`
          ),
          answer: Number.isInteger(form.answer) ? form.answer : 0,
        },
      ],
    }));
    resetForm();
  };

  const startEdit = (qid: string) => {
    const target = quiz.questions.find((x) => x.id === qid);
    if (!target) return;
    setEditingQid(qid);
    setForm({
      text: target.text,
      options: [...target.options],
      answer: target.answer,
    });
  };

  const saveEdit = () => {
    if (!editingQid) return;
    setQuiz((q) => ({
      ...q,
      questions: q.questions.map((it) =>
        it.id === editingQid
          ? {
            ...it,
            text: form.text || "Soal (tanpa judul)",
            options: form.options.map(
              (o, i) => o || `Pilihan ${String.fromCharCode(65 + i)}`
            ),
            answer: form.answer,
          }
          : it
      ),
    }));
    setEditingQid(null);
    resetForm();
  };

  const deleteQuestion = (qid: string) =>
    setQuiz((q) => ({
      ...q,
      questions: q.questions.filter((x) => x.id !== qid),
    }));

  return (
    <div className="w-full">
      <main className="md:py-8">
        <div className="mx-auto grid grid-cols-1 gap-6">
          {/* Header */}
          <Card>
            <CardContent className="p-4 md:p-5 flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                aria-label="Kembali"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <h1 className="font-semibold text-lg">{quiz.title}</h1>

              <div className="ml-auto flex items-center gap-3">
                {quiz.published ? (
                  <div className="inline-flex items-center gap-1.5 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Terpublikasi</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm">Draft</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pl-3 border-l">
                  <Label
                    htmlFor="pub"
                    className="text-sm text-muted-foreground"
                  >
                    Publikasikan
                  </Label>
                  <Switch
                    id="pub"
                    checked={quiz.published}
                    onCheckedChange={togglePublish}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form tambah / edit */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {editingQid ? "Edit Soal" : "Tambah Soal"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="q-text">Teks Soal</Label>
                <Textarea
                  id="q-text"
                  placeholder="Tulis teks soal di sini"
                  value={form.text}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, text: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {form.options.map((opt, i) => (
                  <div key={i} className="space-y-2">
                    <Label htmlFor={`opt-${i}`}>
                      Opsi {String.fromCharCode(65 + i)}
                    </Label>
                    <Input
                      id={`opt-${i}`}
                      placeholder={`Opsi ${String.fromCharCode(65 + i)}`}
                      value={opt}
                      onChange={(e) => {
                        const copy = [...form.options];
                        copy[i] = e.target.value;
                        setForm((p) => ({ ...p, options: copy }));
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Jawaban Benar</Label>
                <Select
                  value={String(form.answer)}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, answer: Number(v) }))
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Pilih jawaban" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">A</SelectItem>
                    <SelectItem value="1">B</SelectItem>
                    <SelectItem value="2">C</SelectItem>
                    <SelectItem value="3">D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              {editingQid ? (
                <Button onClick={saveEdit}>Simpan Perubahan</Button>
              ) : (
                <Button onClick={addQuestion}>
                  <Plus className="h-4 w-4 mr-2" /> Tambah
                </Button>
              )}
              <Button variant="outline" onClick={resetForm}>
                Reset
              </Button>
            </CardFooter>
          </Card>

          {/* Daftar soal */}
          <div className="space-y-4">
            {quiz.questions.length === 0 ? (
              <Alert>
                <AlertDescription>Belum ada soal.</AlertDescription>
              </Alert>
            ) : (
              quiz.questions.map((q, idx) => (
                <Card key={q.id} className="overflow-hidden">
                  <CardContent className="p-4 md:p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="font-medium">
                          {idx + 1}. {q.text}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => startEdit(q.id)}
                          aria-label="Edit soal"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteQuestion(q.id)}
                          aria-label="Hapus soal"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="ml-1 md:ml-4 space-y-1 text-sm">
                      {q.options.map((opt, i) => {
                        const correct = i === q.answer;
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-2 leading-relaxed"
                          >
                            <Badge
                              variant={correct ? "default" : "outline"}
                              className="h-5 px-2"
                            >
                              {String.fromCharCode(65 + i)}
                            </Badge>
                            {correct ? (
                              <span className="font-medium text-green-600">
                                {opt} (benar)
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                {opt}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDetailClassQuiz;
