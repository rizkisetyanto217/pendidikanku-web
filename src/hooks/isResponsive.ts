// hooks/useResponsive.ts
import { useEffect, useState } from "react";

export function useResponsive() {
  const [responsive, setResponsive] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isXL: false,
    isXLPC: false, // ✅ Tambahan: untuk PC besar (≥1440px)
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      setResponsive({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isXL: width >= 1280,
        isXLPC: width >= 1440, // ✅ tambahkan logika ini
      });
    };

    handleResize(); // run once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return responsive;
}
