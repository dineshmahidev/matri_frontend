import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AppLayouts";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/uk-control/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance Mode — Admin" }] }),
  component: AdminMaintenance,
});

function AdminMaintenance() {
  const queryClient = useQueryClient();

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceHeadline, setMaintenanceHeadline] = useState("");
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [maintenanceTimer, setMaintenanceTimer] = useState("");

  const { data: settingsData, isLoading: loadingSettings } = useQuery<any>({
    queryKey: ["admin-settings"],
    queryFn: () => api.get<any>("/admin/settings"),
  });

  useEffect(() => {
    if (settingsData) {
      setMaintenanceMode(settingsData.maintenance_mode === "1" || settingsData.maintenance_mode === 1 || settingsData.maintenance_mode === true || settingsData.maintenance_mode === "true");
      setMaintenanceHeadline(settingsData.maintenance_headline || "");
      setMaintenanceMessage(settingsData.maintenance_message || "");
      setMaintenanceTimer(settingsData.maintenance_timer || "");
    }
  }, [settingsData]);

  const maintenanceMutation = useMutation({
    mutationFn: (data: any) => api.post("/admin/settings", { settings: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["site-settings-maintenance"] });
      toast.success("Maintenance settings updated");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update maintenance settings")
  });

  const handleSaveMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    maintenanceMutation.mutate({
      maintenance_mode: maintenanceMode,
      maintenance_headline: maintenanceHeadline,
      maintenance_message: maintenanceMessage,
      maintenance_timer: maintenanceTimer,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Maintenance Mode</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage site maintenance mode and messages.</p>
        </div>

        {loadingSettings ? (
          <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <form onSubmit={handleSaveMaintenance} className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border">
                <div>
                  <Label className="cursor-pointer" htmlFor="maintenance-mode">Enable Maintenance Mode</Label>
                  <p className="text-xs text-muted-foreground">When enabled, visitors will see a maintenance page instead of the site.</p>
                </div>
                <Switch id="maintenance-mode" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maintenance-headline">Headline</Label>
                <Input id="maintenance-headline" value={maintenanceHeadline} onChange={e => setMaintenanceHeadline(e.target.value)} placeholder="We'll be back soon!" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maintenance-message">Message</Label>
                <Textarea id="maintenance-message" rows={3} value={maintenanceMessage} onChange={e => setMaintenanceMessage(e.target.value)} placeholder="We are currently performing scheduled maintenance. Please check back shortly." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maintenance-timer">Expected End Time (optional)</Label>
                <Input id="maintenance-timer" type="datetime-local" value={maintenanceTimer} onChange={e => setMaintenanceTimer(e.target.value)} />
              </div>
            </div>
            <div className="pt-4 border-t flex justify-end">
              <Button type="submit" className="gradient-rose text-white" disabled={maintenanceMutation.isPending}>
                {maintenanceMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Maintenance
              </Button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
