import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function SchoolMainDashboard() {
  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Sekolah", href: "/sekolah" },
        { label: "Dashboard" },
      ]}
      actions={
        <>
          <Button variant="outline" size="sm">
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Tambah
          </Button>
        </>
      }
      // showUserMenu={false} // ← kalau mau sembunyikan dropdown user di halaman tertentu
    >
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>

      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
    </DashboardLayout>
  );
}
