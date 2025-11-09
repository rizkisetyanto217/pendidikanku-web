import { useThemeCtx } from "@/hooks/ThemeContext";

export default function ThemeSwitcher() {
  const { theme, setTheme, isDark, toggleDark, availableThemes } =
    useThemeCtx();

  return (
    <div className="fixed z-50 bottom-4 right-4 flex gap-2 items-center bg-card text-card-foreground border border-border rounded-lg shadow px-3 py-2">
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as any)}
        className="bg-background text-foreground border border-border rounded px-2 py-1"
      >
        {availableThemes.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <button
        onClick={toggleDark}
        className="bg-primary text-primary-foreground rounded px-3 py-1"
      >
        {isDark ? "Dark" : "Light"}
      </button>
    </div>
  );
}