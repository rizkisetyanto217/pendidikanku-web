// src/components/costum/CRichTextInput.tsx
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* =================================================
   Helpers
================================================= */
export function htmlToPlainText(html?: string) {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/* Palet warna pakai theme variable (shadcn)
   NOTE: value = string CSS yang pakai var(--xxx)
*/
const TEXT_COLOR_OPTIONS = [
  {
    id: "default",
    label: "Default",
    previewClass: "text-foreground",
    value: "hsl(var(--foreground))",
  },
  {
    id: "primary",
    label: "Hijau (Primary)",
    previewClass: "text-primary",
    value: "hsl(var(--primary))",
  },
  {
    id: "accent",
    label: "Accent",
    previewClass: "text-accent",
    value: "hsl(var(--accent))",
  },
  {
    id: "danger",
    label: "Merah (Penting)",
    previewClass: "text-destructive",
    value: "hsl(var(--destructive))",
  },
] as const;

const HIGHLIGHT_COLOR_OPTIONS = [
  {
    id: "none",
    label: "Tanpa highlight",
    previewClass: "bg-transparent",
    value: "transparent",
  },
  {
    id: "secondary",
    label: "Kuning (Secondary)",
    previewClass: "bg-secondary",
    value: "hsl(var(--secondary))",
  },
  {
    id: "accent",
    label: "Hijau lembut (Accent)",
    previewClass: "bg-accent",
    value: "hsl(var(--accent))",
  },
  {
    id: "muted",
    label: "Abu lembut",
    previewClass: "bg-muted",
    value: "hsl(var(--muted))",
  },
] as const;

type TextColorId = (typeof TEXT_COLOR_OPTIONS)[number]["id"];
type HighlightColorId = (typeof HIGHLIGHT_COLOR_OPTIONS)[number]["id"];

/* Resolve "hsl(var(--primary))" → warna nyata (rgb(...)) */
function resolveCssColor(
  cssColor: string,
  mode: "color" | "background"
): string {
  const el = document.createElement("span");

  if (mode === "color") {
    el.style.color = cssColor;
  } else {
    el.style.backgroundColor = cssColor;
  }

  el.className = "hidden";
  document.body.appendChild(el);

  const styles = getComputedStyle(el);
  const resolved =
    mode === "color"
      ? styles.color || cssColor
      : styles.backgroundColor || cssColor;

  document.body.removeChild(el);
  return resolved;
}

/* =================================================
   Props
================================================= */
export type RichTextInputProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

export function RichTextInput(props: RichTextInputProps) {
  const { value, onChange, placeholder, className } = props;

  const editorRef = useRef<HTMLDivElement | null>(null);
  const linkRangeRef = useRef<Range | null>(null);

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [blockType, setBlockType] = useState<
    "p" | "h1" | "h2" | "h3" | "blockquote"
  >("p");
  const [isBulleted, setIsBulleted] = useState(false);
  const [isNumbered, setIsNumbered] = useState(false);
  const [isRtl, setIsRtl] = useState(false);

  // Link state
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  // Indikator warna aktif
  const [activeTextColor, setActiveTextColor] =
    useState<TextColorId>("default");
  const [activeHighlight, setActiveHighlight] =
    useState<HighlightColorId>("none");

  /* ========== Init content (sekali saja) ========== */
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ========== Toolbar state ========== */
  const refreshToolbarState = () => {
    try {
      setIsBold(document.queryCommandState("bold"));
      setIsItalic(document.queryCommandState("italic"));
      setIsUnderline(document.queryCommandState("underline"));
      setIsBulleted(document.queryCommandState("insertUnorderedList"));
      setIsNumbered(document.queryCommandState("insertOrderedList"));

      const raw = (document.queryCommandValue("formatBlock") as string) || "";
      const cleaned = raw.toLowerCase().replace(/[<>]/g, "");
      let bt: "p" | "h1" | "h2" | "h3" | "blockquote" = "p";
      switch (cleaned) {
        case "h1":
          bt = "h1";
          break;
        case "h2":
          bt = "h2";
          break;
        case "h3":
          bt = "h3";
          break;
        case "blockquote":
          bt = "blockquote";
          break;
        default:
          bt = "p";
      }
      setBlockType(bt);
    } catch {
      // ignore
    }
  };

  const exec = (cmd: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false);
    refreshToolbarState();
  };

  const execBlock = (block: "p" | "h1" | "h2" | "h3" | "blockquote") => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    // Map ke tag yang disukai browser
    const tag =
      block === "p"
        ? "P"
        : block === "blockquote"
          ? "BLOCKQUOTE"
          : block.toUpperCase(); // H1 / H2 / H3

    try {
      // Coba tanpa < > dulu
      document.execCommand("formatBlock", false, tag);

      // Khusus blockquote (dan kadang heading), Chrome suka format <TAG>
      if (block === "blockquote") {
        document.execCommand("formatBlock", false, `<${tag}>`);
      }
    } catch {
      // ignore
    }

    refreshToolbarState();
  };

  const toggleList = (type: "ul" | "ol") => {
    editorRef.current?.focus();
    document.execCommand(
      type === "ul" ? "insertUnorderedList" : "insertOrderedList",
      false
    );
    refreshToolbarState();
  };

  /* ========== Warna umum ========== */
  const applyColorRaw = (
    cmd: "foreColor" | "hiliteColor",
    cssColor: string
  ) => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    try {
      document.execCommand("styleWithCSS", false, "true");
    } catch {
      // ignore
    }

    let command: "foreColor" | "hiliteColor" | "backColor" = cmd;
    if (cmd === "hiliteColor") {
      try {
        if (!document.queryCommandSupported("hiliteColor")) {
          command = "backColor";
        }
      } catch {
        command = "backColor";
      }
    }

    const resolved = resolveCssColor(
      cssColor,
      command === "foreColor" ? "color" : "background"
    );

    document.execCommand(command, false, resolved);
    refreshToolbarState();
  };

  const applyTextColor = (id: TextColorId) => {
    const opt = TEXT_COLOR_OPTIONS.find((o) => o.id === id);
    if (!opt) return;
    applyColorRaw("foreColor", opt.value);
    setActiveTextColor(id);
  };

  const applyHighlightColor = (id: HighlightColorId) => {
    const opt = HIGHLIGHT_COLOR_OPTIONS.find((o) => o.id === id);
    if (!opt) return;

    if (id === "none") {
      // Mode hapus highlight: keluar dari span background-color lama
      if (editorRef.current) {
        editorRef.current.focus();

        try {
          document.execCommand("styleWithCSS", false, "true");
        } catch {
          // ignore
        }

        try {
          document.execCommand("hiliteColor", false, "transparent");
          document.execCommand("backColor", false, "transparent");
        } catch {
          // ignore
        }

        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const startNode = sel.getRangeAt(0).startContainer;
          let el: HTMLElement | null =
            startNode instanceof HTMLElement
              ? startNode
              : startNode.parentElement;

          while (el && el !== editorRef.current) {
            if (el.style && el.style.backgroundColor) {
              el.style.backgroundColor = "";
            }
            el = el.parentElement;
          }
        }
      }
    } else {
      applyColorRaw("hiliteColor", opt.value);
    }

    setActiveHighlight(id);
  };

  /* ========== Link helpers ========== */
  const openLinkModal = () => {
    if (!editorRef.current) return;

    editorRef.current.focus();
    const sel = window.getSelection();
    let initialHref = "";

    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      linkRangeRef.current = range.cloneRange();

      let node: Node | null = range.startContainer;
      while (node && node !== editorRef.current) {
        if (node instanceof HTMLAnchorElement) {
          initialHref = node.getAttribute("href") || "";
          break;
        }
        node = node.parentNode;
      }
    } else {
      linkRangeRef.current = null;
    }

    setLinkUrl(initialHref);
    setLinkOpen(true);
  };

  const applyLink = () => {
    setLinkOpen(false);
    if (!editorRef.current) return;

    setTimeout(() => {
      const urlRaw = linkUrl.trim();
      editorRef.current?.focus();

      const sel = window.getSelection();
      if (!sel) return;

      sel.removeAllRanges();
      if (linkRangeRef.current) {
        sel.addRange(linkRangeRef.current);
      }

      if (urlRaw) {
        let url = urlRaw;
        if (
          !/^https?:\/\//i.test(url) &&
          !url.startsWith("/") &&
          !url.startsWith("#")
        ) {
          url = "https://" + url;
        }
        document.execCommand("createLink", false, url);
      } else {
        document.execCommand("unlink");
      }

      refreshToolbarState();
    }, 0);
  };

  /* ========== Keyboard handler (list & blockquote) ========== */
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!editorRef.current) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    // ========== AUTO LIST: "- " & "1. " ==========
    if (e.key === " ") {
      // Ambil teks dari awal block sampai posisi caret
      let textBefore = "";

      try {
        const beforeRange = range.cloneRange();

        // Cari block terdekat (p/div/li/h1/h2/h3/blockquote)
        let node: Node | null = range.startContainer;
        let blockEl: HTMLElement | null = null;
        while (node && node !== editorRef.current) {
          if (
            node instanceof HTMLElement &&
            /^(p|div|li|h1|h2|h3|blockquote)$/i.test(node.tagName)
          ) {
            blockEl = node;
            break;
          }
          node = node.parentNode;
        }

        if (blockEl) {
          beforeRange.selectNodeContents(blockEl);
          beforeRange.setEnd(range.startContainer, range.startOffset);
          textBefore = beforeRange.toString();
        } else {
          // fallback: pakai container langsung
          beforeRange.setStart(range.startContainer, 0);
          textBefore = beforeRange.toString();
        }
      } catch {
        // ignore
      }

      const trimmed = textBefore.trim();
      const isBulletTrigger = trimmed === "-";
      const isNumberTrigger = trimmed === "1.";

      if (isBulletTrigger || isNumberTrigger) {
        e.preventDefault();

        // Biarkan browser bikin list dulu
        document.execCommand(
          isNumberTrigger ? "insertOrderedList" : "insertUnorderedList",
          false
        );

        refreshToolbarState();

        // Bersihkan marker "- " atau "1. " di dalam <li>
        const sel2 = window.getSelection();
        if (!sel2 || sel2.rangeCount === 0) return;
        const r2 = sel2.getRangeAt(0);

        let liNode: Node | null = r2.startContainer;
        while (liNode && !(liNode instanceof HTMLLIElement)) {
          liNode = liNode.parentNode;
        }

        if (liNode && liNode instanceof HTMLLIElement) {
          const text = liNode.textContent ?? "";
          const trimmedLi = text.trim();

          let cleaned = text;

          // Kalau isinya cuma "-" atau "1." (dengan / tanpa spasi) → kosongin
          if (trimmedLi === "-" || trimmedLi === "1.") {
            cleaned = "";
          } else {
            // Kalau di depan masih ada marker, bersihkan
            cleaned = text.replace(/^(\s*-\s*|\s*1\.\s*)/, "");
          }

          liNode.textContent = cleaned;

          // Pindahkan caret ke akhir <li>
          const newRange = document.createRange();
          newRange.selectNodeContents(liNode);
          newRange.collapse(false);
          sel2.removeAllRanges();
          sel2.addRange(newRange);
        }

        return;
      }
    }

    // ========== ENTER di dalam blockquote: keluar ke paragraf baru ==========
    if (e.key === "Enter" && !e.shiftKey) {
      let node: Node | null = range.startContainer;
      let blockquote: HTMLElement | null = null;

      while (node && node !== editorRef.current) {
        if (
          node instanceof HTMLElement &&
          node.tagName.toLowerCase() === "blockquote"
        ) {
          blockquote = node;
          break;
        }
        node = node.parentNode;
      }

      if (blockquote) {
        e.preventDefault();

        const p = document.createElement("p");
        p.innerHTML = "<br />";

        const parent = blockquote.parentNode;
        if (!parent) return;

        if (blockquote.nextSibling) {
          parent.insertBefore(p, blockquote.nextSibling);
        } else {
          parent.appendChild(p);
        }

        const newRange = document.createRange();
        newRange.setStart(p, 0);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);

        refreshToolbarState();
        return;
      }
    }
  };

  /* ========== Sync toolbar saat selection berubah ========== */
  useEffect(() => {
    const handler = () => {
      const sel = window.getSelection();
      const node = sel?.anchorNode;
      if (!node || !editorRef.current) return;
      if (!editorRef.current.contains(node)) return;
      refreshToolbarState();
    };

    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, []);

  /* ========== Helper untuk tombol warna aktif ========== */
  const activeTextOpt = TEXT_COLOR_OPTIONS.find(
    (o) => o.id === activeTextColor
  );
  const activeHighlightOpt = HIGHLIGHT_COLOR_OPTIONS.find(
    (o) => o.id === activeHighlight
  );

  /* =================================================
     RENDER
  ================================================= */
  return (
    <div className="space-y-1">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground mb-1">
        {/* Bold / Italic / Underline */}
        <Button
          type="button"
          size="icon"
          variant={isBold ? "default" : "ghost"}
          className="h-7 w-7"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("bold")}
        >
          <span className="font-bold">B</span>
        </Button>
        <Button
          type="button"
          size="icon"
          variant={isItalic ? "default" : "ghost"}
          className="h-7 w-7 italic"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("italic")}
        >
          I
        </Button>
        <Button
          type="button"
          size="icon"
          variant={isUnderline ? "default" : "ghost"}
          className="h-7 w-7 underline"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("underline")}
        >
          U
        </Button>

        <span className="mx-1 h-4 w-px bg-border" />

        {/* Block type */}
        <Button
          type="button"
          size="sm"
          variant={blockType === "p" ? "default" : "ghost"}
          className="h-7 px-2 text-[10px]"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execBlock("p")}
        >
          P
        </Button>
        <Button
          type="button"
          size="sm"
          variant={blockType === "h1" ? "default" : "ghost"}
          className="h-7 px-2 text-[10px]"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execBlock("h1")}
        >
          H1
        </Button>
        <Button
          type="button"
          size="sm"
          variant={blockType === "h2" ? "default" : "ghost"}
          className="h-7 px-2 text-[10px]"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execBlock("h2")}
        >
          H2
        </Button>
        <Button
          type="button"
          size="sm"
          variant={blockType === "h3" ? "default" : "ghost"}
          className="h-7 px-2 text-[10px]"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execBlock("h3")}
        >
          H3
        </Button>
        <Button
          type="button"
          size="icon"
          variant={blockType === "blockquote" ? "default" : "ghost"}
          className="h-7 w-7"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execBlock("blockquote")}
        >
          <span className="text-sm">“</span>
        </Button>

        <span className="mx-1 h-4 w-px bg-border" />

        {/* Bullets & Numbers */}
        <Button
          type="button"
          size="icon"
          variant={isBulleted ? "default" : "ghost"}
          className="h-7 w-7"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleList("ul")}
        >
          <span className="text-xs">•</span>
        </Button>
        <Button
          type="button"
          size="icon"
          variant={isNumbered ? "default" : "ghost"}
          className="h-7 w-7"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleList("ol")}
        >
          <span className="text-xs">1.</span>
        </Button>

        <span className="mx-1 h-4 w-px bg-border" />

        {/* Text color */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={cn(
                "h-7 px-2 text-[10px] border border-transparent",
                activeTextColor !== "default" && "bg-muted/40 border-border",
                activeTextOpt?.previewClass
              )}
              onMouseDown={(e) => e.preventDefault()}
            >
              A
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[180px]">
            {TEXT_COLOR_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.id}
                className="flex items-center gap-2 text-xs"
                onClick={() => applyTextColor(opt.id)}
              >
                <span
                  className={cn(
                    "h-4 w-4 rounded-full border border-border flex items-center justify-center text-[9px]",
                    opt.previewClass
                  )}
                >
                  A
                </span>
                <span>{opt.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Highlight color */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={cn(
                "h-7 px-2 text-[10px] border border-transparent",
                activeHighlight !== "none" && "bg-muted/40 border-border",
                activeHighlightOpt?.previewClass
              )}
              onMouseDown={(e) => e.preventDefault()}
            >
              Bg
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[200px]">
            {HIGHLIGHT_COLOR_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.id}
                className="flex items-center gap-2 text-xs"
                onClick={() => applyHighlightColor(opt.id)}
              >
                <span
                  className={cn(
                    "h-4 w-10 rounded border border-border",
                    opt.previewClass
                  )}
                />
                <span>{opt.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="mx-1 h-4 w-px bg-border" />

        {/* Link */}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-[10px]"
          onMouseDown={(e) => e.preventDefault()}
          onClick={openLinkModal}
        >
          Link
        </Button>

        <span className="mx-1 h-4 w-px bg-border" />

        {/* Clear format */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            exec("removeFormat");
            setActiveTextColor("default");
            setActiveHighlight("none");
          }}
          title="Bersihkan format"
        >
          <span className="text-xs">Clr</span>
        </Button>

        {/* RTL / Arabic */}
        <Button
          type="button"
          size="sm"
          variant={isRtl ? "default" : "ghost"}
          className="h-7 px-2 text-[10px]"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setIsRtl((v) => !v)}
          title="Teks Arab (kanan ke kiri)"
        >
          AR
        </Button>
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          dir={isRtl ? "rtl" : "ltr"}
          className={cn(
            "min-h-[60px] text-sm px-3 py-2 rounded-md border bg-background",
            isRtl ? "text-right" : "text-left",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "prose prose-sm max-w-none dark:prose-invert",
            className
          )}
          onInput={(e) =>
            onChange((e.currentTarget as HTMLDivElement).innerHTML)
          }
          onKeyDown={handleKeyDown}
        />

        {!htmlToPlainText(value) && placeholder && (
          <span className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground/70">
            {placeholder}
          </span>
        )}
      </div>

      {/* Link dialog */}
      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah / edit link</DialogTitle>
            <DialogDescription>
              Pilih teks dulu, lalu isi alamat link di bawah. Kosongkan untuk
              menghapus link.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="quiz-link-url">URL</Label>
            <Input
              id="quiz-link-url"
              placeholder="https://contoh.com atau /path-lokal"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setLinkUrl("");
                applyLink(); // hapus link
              }}
            >
              Hapus link
            </Button>
            <Button type="button" onClick={applyLink}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RichTextInput;