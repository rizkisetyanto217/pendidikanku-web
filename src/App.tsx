// src/App.tsx
import AppRoutes from "@/routes/IndexRoute";
import "./index.css";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useEffect } from "react";
import { bootstrapThemeFromStorage } from "@/lib/theme-prefs";

function App() {
  useCurrentUser();

  useEffect(() => {
    bootstrapThemeFromStorage();
  }, []);

  return <AppRoutes />;
}

export default App;
