import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ThemeName = "default" | "sunrise" | "midnight"; // tambahkan nama baru kalau kamu bikin blok CSS-nya

type ThemeContextType = {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  isDark: boolean;
  setDark: (v: boolean) => void;
  toggleDark: () => void;
  availableThemes: ThemeName[];
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LS_THEME = "ui-theme";
const LS_DARK = "ui-dark";

function applyThemeAttr(theme: ThemeName) {
  document.documentElement.setAttribute("data-theme", theme);
}
function applyDarkClass(enabled: boolean) {
  document.documentElement.classList.toggle("dark", enabled);
}

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem(LS_THEME) as ThemeName | null;
    return saved ?? "default";
  });
  const [isDark, setDarkState] = useState<boolean>(() => {
    const saved = localStorage.getItem(LS_DARK);
    if (saved === "true" || saved === "false") return saved === "true";
    // fallback ke preferensi sistem
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  // Terapkan saat mount dan setiap berubah
  useEffect(() => {
    applyThemeAttr(theme);
    localStorage.setItem(LS_THEME, theme);
  }, [theme]);

  useEffect(() => {
    applyDarkClass(isDark);
    localStorage.setItem(LS_DARK, String(isDark));
  }, [isDark]);

  // pastikan terapkan sekali saat very first paint juga
  useEffect(() => {
    applyThemeAttr(theme);
    applyDarkClass(isDark);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<ThemeContextType>(
    () => ({
      theme,
      setTheme: (t) => setThemeState(t),
      isDark,
      setDark: (v) => setDarkState(v),
      toggleDark: () => setDarkState((x) => !x),
      availableThemes: ["default", "sunrise", "midnight"],
    }),
    [theme, isDark]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export function useThemeCtx() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeCtx must be used within ThemeProvider");
  return ctx;
}
