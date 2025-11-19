// src/lib/theme-prefs.ts
export type Mode = "light" | "dark" | "system";
export type ThemeName = "default" | "green" | "yellow";

export const THEME_KEY = "theme-name";
export const MODE_KEY = "theme-mode";
const FONT_SCALE_KEY = "app-font-scale";
export type FontId = "system" | "inter" | "poppins" | "nunito" | "jakarta";
const FONT_FAMILY_KEY = "app-font-family";
const FONT_LINK_ID = "app-font-link";
export type UiScale = "normal" | "large" | "xl";
const UI_SCALE_KEY = "app-ui-scale";

export const THEME_NAMES: ThemeName[] = ["default", "green", "yellow"];

export function applyThemeName(name: ThemeName) {
  const el = document.documentElement;
  if (name === "default") el.removeAttribute("data-theme");
  else el.setAttribute("data-theme", name);
  localStorage.setItem(THEME_KEY, name);
}

export function readThemeFromStorage(): ThemeName {
  const raw = (localStorage.getItem(THEME_KEY) || "default") as ThemeName;
  return THEME_NAMES.includes(raw) ? raw : "default";
}

export function applyMode(mode: Mode) {
  const el = document.documentElement;
  const mm = window.matchMedia("(prefers-color-scheme: dark)");
  const setFromSystem = () =>
    mm.matches ? el.classList.add("dark") : el.classList.remove("dark");

  // cleanup listener lama
  // @ts-expect-error
  if (window.__theme_mm_listener__) {
    // @ts-expect-error
    mm.removeEventListener("change", window.__theme_mm_listener__);
    // @ts-expect-error
    window.__theme_mm_listener__ = undefined;
  }

  if (mode === "dark") el.classList.add("dark");
  else if (mode === "light") el.classList.remove("dark");
  else {
    setFromSystem();
    const listener = () => setFromSystem();
    mm.addEventListener("change", listener);
    // @ts-expect-error
    window.__theme_mm_listener__ = listener;
  }
  localStorage.setItem(MODE_KEY, mode);
}

export function readMode(): Mode {
  return (localStorage.getItem(MODE_KEY) as Mode) || "system";
}

// ===== Font scale =====
export function readFontScale(): number {
  const raw = localStorage.getItem(FONT_SCALE_KEY);
  const n = raw ? Number(raw) : 1;
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function applyFontScale(scale: number) {
  document.documentElement.style.setProperty("--app-font-scale", String(scale));
  localStorage.setItem(FONT_SCALE_KEY, String(scale));
}

// ===== Font family =====
type FontOption = { id: FontId; stack: string; href?: string };

const FONT_OPTIONS: FontOption[] = [
  {
    id: "system",
    stack:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
  },
  {
    id: "inter",
    stack:
      "'Inter', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  },
  {
    id: "poppins",
    stack:
      "'Poppins', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
  },
  {
    id: "nunito",
    stack:
      "'Nunito', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    href: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap",
  },
  {
    id: "jakarta",
    stack:
      "'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap",
  },
];

function ensureFontLink(href?: string) {
  let link = document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null;
  if (!href) {
    if (link) link.remove();
    return;
  }
  if (!link) {
    link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;
}

export function readFontId(): FontId {
  const raw = (localStorage.getItem(FONT_FAMILY_KEY) as FontId) || "system";
  return FONT_OPTIONS.some((f) => f.id === raw) ? raw : "system";
}

export function applyFontFamily(fontId: FontId) {
  const option = FONT_OPTIONS.find((f) => f.id === fontId)!;
  ensureFontLink(option.href);
  document.documentElement.style.fontFamily = option.stack;
  localStorage.setItem(FONT_FAMILY_KEY, fontId);
}

// ===== UI scale =====
export function readUiScale(): UiScale {
  const raw = (localStorage.getItem(UI_SCALE_KEY) as UiScale) || "normal";
  return raw === "large" || raw === "xl" ? raw : "normal";
}

const UI_TOKENS = {
  normal: {
    sidebarWidth: "16rem",
    sidebarWidthMobile: "18rem",
    sidebarWidthIcon: "3.25rem",
    itemH: "2.5rem",
    subItemH: "2.125rem",
    icon: "1rem",
    text: "0.9rem",
    labelH: "2rem",
  },
  large: {
    sidebarWidth: "20rem",
    sidebarWidthMobile: "22rem",
    sidebarWidthIcon: "4rem",
    itemH: "3.25rem",
    subItemH: "2.375rem",
    icon: "1.25rem",
    text: "1rem",
    labelH: "2.5rem",
  },
  xl: {
    sidebarWidth: "22rem",
    sidebarWidthMobile: "24rem",
    sidebarWidthIcon: "4.5rem",
    itemH: "3.75rem",
    subItemH: "2.75rem",
    icon: "1.375rem",
    text: "1.06rem",
    labelH: "2.75rem",
  },
} as const;

export function applyUiScale(scale: UiScale) {
  const t = UI_TOKENS[scale];
  const root = document.documentElement;
  root.style.setProperty("--sidebar-width", t.sidebarWidth);
  root.style.setProperty("--sidebar-width-mobile", t.sidebarWidthMobile);
  root.style.setProperty("--sidebar-width-icon", t.sidebarWidthIcon);
  root.style.setProperty("--sidebar-item-h", t.itemH);
  root.style.setProperty("--sidebar-subitem-h", t.subItemH);
  root.style.setProperty("--sidebar-icon", t.icon);
  root.style.setProperty("--sidebar-text", t.text);
  root.style.setProperty("--sidebar-label-h", t.labelH);
  localStorage.setItem(UI_SCALE_KEY, scale);
}

// ===== Bootstrap sekali di root App =====
export function bootstrapThemeFromStorage() {
  try {
    const mode = readMode();
    const themeName = readThemeFromStorage();
    const fontScale = readFontScale();
    const fontId = readFontId();
    const uiScale = readUiScale();

    applyMode(mode);
    applyThemeName(themeName);
    applyFontScale(fontScale);
    applyFontFamily(fontId);
    applyUiScale(uiScale);
  } catch {
    // ignore
  }
}
