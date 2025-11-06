import AppRoutes from "@/routes/IndexRoute";
import "./index.css";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ThemeProvider } from "@/hooks/ThemeContext";

function App() {
  useCurrentUser();

  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;
