import { Route } from "react-router-dom";

import UnnasignedInfo from "@/pages/dashboard/unnasigned/UnnasignedInfo";
import UnnasignedClassDetail from "@/pages/dashboard/unnasigned/details/UnnasignedClassDetail";
import UnnasignedFeesDetail from "@/pages/dashboard/unnasigned/details/UnnasignedFeesDetail";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import UnnasignedDashboard from "@/pages/dashboard/unnasigned/UnnasignedDashboard";
import UnnasignedPaymentResult from "@/pages/dashboard/unnasigned/payments/UnnasignedPaymentResult";

// Cluster rute untuk PMB / Pendaftaran
// Base path: /:school_slug/pendaftaran
export const UnnasignedRoutes = (
  <Route path="user" element={<DashboardLayout />}>
    {/* /:school_slug/pendaftaran */}
    <Route path="pendaftaran" index element={<UnnasignedInfo />} />

    <Route path="dashboard" element={<UnnasignedDashboard />} />

    {/* /:school_slug/pendaftaran/:id */}
    <Route path="pendaftaran/:id" element={<UnnasignedClassDetail />} />

    {/* /:school_slug/pendaftaran/:id/biaya */}
    <Route path="pendaftaran/:id/biaya" element={<UnnasignedFeesDetail />} />

    {/* 🔽 HALAMAN HASIL PEMBAYARAN */}
    <Route path="pendaftaran/selesai" element={<UnnasignedPaymentResult />} />
  </Route>
);
