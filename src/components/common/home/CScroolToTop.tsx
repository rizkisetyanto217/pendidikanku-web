import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // ⬅️ Scroll ke atas setiap kali path berubah
  }, [pathname]);

  return null;
}
