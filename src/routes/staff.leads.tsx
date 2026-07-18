import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AppLayouts";
import { StatusPill } from "./uk-control.index";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/leads")({
  head: () => ({ meta: [{ title: "Assigned Leads — Staff" }] }),
  component: StaffLeads,
});

function StaffLeads() {
  const queryClient = useQueryClient();
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: "", phone: "", email: "", source: "", status: "New" });

  const params = new URLSearchParams();
  if (dateFilter !== "all") params.set("date_filter", dateFilter);

  const { data, isLoading } = useQuery<{ data: any[] }>({
    queryKey: ["staff-leads", dateFilter],
    queryFn: () => api.get<{ data: any[] }>(`/staff/leads?${params.toString()}`),
    retry: false,
  });

  const createLeadMutation = useMutation({
    mutationFn: (data: any) => api.post("/staff/leads", data),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["staff-leads"] }); 
      setIsAddLeadModalOpen(false); 
      setNewLead({ name: "", phone: "", email: "", source: "", status: "New" }); 
      toast.success("Lead created"); 
    },
    onError: (err: any) => toast.error(err.message || "Failed to create lead"),
  });

  const leads = data?.data ?? [];

  const STYLE = {
    input: "h-8 w-full rounded-md border border-input bg-background px-2 text-xs outline-none focus:border-primary",
  };

  return (
    <AdminLayout role="Staff">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl font-bold">Assigned Leads</h1>
          <div className="flex gap-2">
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-xs outline-none focus:border-primary cursor-pointer">
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="this_month">This Month</option>
            </select>
            <Button size="sm" onClick={() => setIsAddLeadModalOpen(true)}>+ Add Lead</Button>
          </div>
        </div>
        
        <div className="rounded-2xl border bg-card shadow-soft overflow-x-auto">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : leads.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">No leads found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Created By</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/40">
                    <td className="p-4 text-muted-foreground">{l.display_id ?? l.id}</td>
                    <td className="p-4 font-medium">{l.name}</td>
                    <td className="p-4 text-muted-foreground">{l.phone}</td>
                    <td className="p-4">{l.source}</td>
                    <td className="p-4 text-muted-foreground text-xs">
                      {l.creator ? (
                        <span>{l.creator.role === 'admin' ? 'Admin' : l.creator.name}</span>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
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
          )}
        </div>

        {isAddLeadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border bg-card shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4">Add New Lead</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Name *</label>
                  <input className={STYLE.input} value={newLead.name} onChange={(e) => setNewLead({ ...newLead, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone *</label>
                  <input className={STYLE.input} value={newLead.phone} onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                  <input className={STYLE.input} type="email" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Source</label>
                  <input className={STYLE.input} placeholder="e.g. Walk-in, Referral" value={newLead.source} onChange={(e) => setNewLead({ ...newLead, source: e.target.value })} />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddLeadModalOpen(false)}>Cancel</Button>
                <Button onClick={() => createLeadMutation.mutate(newLead)} disabled={createLeadMutation.isPending || !newLead.name || !newLead.phone}>
                  {createLeadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Lead
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
