// utils/theme.ts
export function setTheme(name: "default" | "sunrise" | "midnight") {
  document.documentElement.setAttribute("data-theme", name);
  localStorage.setItem("ui-theme", name);
}

export function setDark(enabled: boolean) {
  document.documentElement.classList.toggle("dark", enabled);
  localStorage.setItem("ui-dark", String(enabled));
}

export function bootTheme() {
  const savedTheme = (localStorage.getItem("ui-theme") as any) || "default";
  const savedDark = localStorage.getItem("ui-dark") === "true";
  setTheme(savedTheme);
  setDark(savedDark);
}
