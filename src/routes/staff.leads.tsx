import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AppLayouts";
import { StatusPill } from "./admin.index";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/staff/leads")({
  head: () => ({ meta: [{ title: "Assigned Leads — Staff" }] }),
  component: StaffLeads,
});

function StaffLeads() {
  const { data, isLoading } = useQuery<{ data: any[] }>({
    queryKey: ["staff-leads"],
    queryFn: () => api.get<{ data: any[] }>("/staff/leads"),
    retry: false,
  });

  const leads = data?.data ?? [];

  return (
    <AdminLayout role="Staff">
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-bold">Assigned Leads</h1>
        <div className="rounded-2xl border bg-card shadow-soft">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : leads.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">No leads assigned yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="p-4">ID</th><th className="p-4">Name</th><th className="p-4">Phone</th><th className="p-4">Source</th><th className="p-4">Status</th><th className="p-4">Date</th><th className="p-4"></th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leads.map((l) => (
                    <tr key={l.id} className="hover:bg-muted/40">
                      <td className="p-4 text-muted-foreground">{l.display_id ?? l.id}</td>
                      <td className="p-4 font-medium">{l.name}</td>
                      <td className="p-4 text-muted-foreground">{l.phone}</td>
                      <td className="p-4">{l.source}</td>
                      <td className="p-4"><StatusPill s={l.status} /></td>
                      <td className="p-4 text-muted-foreground">{l.created_at ? new Date(l.created_at).toLocaleDateString() : "—"}</td>
                      <td className="p-4">
                        <Link to="/staff/lead/$id" params={{ id: String(l.id) }} className="text-sm font-medium text-primary hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
