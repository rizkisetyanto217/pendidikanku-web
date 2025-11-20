import { Route } from "react-router-dom";

import PendWebPMBInfo from "@/pages/dashboard/registration/PendWebPMBInfo";
import PendWebPMBClassDetail from "@/pages/dashboard/registration/details/PendWebPMBClassDetail";
import PendWebPMBFeesDetail from "@/pages/dashboard/registration/details/PendWebPMBFeesDetail";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";

// Cluster rute untuk PMB / Pendaftaran
// Base path: /:school_slug/pendaftaran
export const RegistrationRoutes = (
  <Route path="pendaftaran" element={<DashboardLayout />}>
    {/* /:school_slug/pendaftaran */}
    <Route index element={<PendWebPMBInfo />} />

    {/* /:school_slug/pendaftaran/:id */}
    <Route path=":id" element={<PendWebPMBClassDetail />} />

    {/* /:school_slug/pendaftaran/:id/biaya */}
    <Route path=":id/biaya" element={<PendWebPMBFeesDetail />} />
  </Route>
);
