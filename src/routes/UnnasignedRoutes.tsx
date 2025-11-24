import { Route } from "react-router-dom";

import UnnasignedInfo from "@/pages/dashboard/unnasigned/UnnasignedInfo";
import UnnasignedClassDetail from "@/pages/dashboard/unnasigned/details/UnnasignedClassDetail";
import UnnasignedFeesDetail from "@/pages/dashboard/unnasigned/details/UnnasignedFeesDetail";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import UnnasignedDashboard from "@/pages/dashboard/unnasigned/UnnasignedDashboard";
import UnnasignedPaymentResult from "@/pages/dashboard/unnasigned/payments/UnnasignedPaymentResult";
import UnnasignedProfiles from "@/pages/dashboard/unnasigned/profiles/UnnasignedProfiles";

// Cluster rute untuk PMB / Pendaftaran
// Base path: /:school_slug/user
export const UnnasignedRoutes = (
  <Route path="user" element={<DashboardLayout />}>
    {/* index: /:school_slug/user → langsung ke profil */}
    <Route index element={<UnnasignedProfiles />} />

    {/* /:school_slug/user/profil → tetap ke profil */}
    <Route path="profil" element={<UnnasignedProfiles />} />

    {/* /:school_slug/user/pendaftaran → halaman info PMB / daftar program */}
    <Route path="pendaftaran" element={<UnnasignedInfo />} />

    <Route path="dashboard" element={<UnnasignedDashboard />} />

    {/* /:school_slug/user/pendaftaran/:id */}
    <Route path="pendaftaran/:id" element={<UnnasignedClassDetail />} />

    {/* /:school_slug/user/pendaftaran/:id/biaya */}
    <Route path="pendaftaran/:id/biaya" element={<UnnasignedFeesDetail />} />

    {/* 🔽 HALAMAN HASIL PEMBAYARAN */}
    <Route path="pendaftaran/selesai" element={<UnnasignedPaymentResult />} />
  </Route>
);
