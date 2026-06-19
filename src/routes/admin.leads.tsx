import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AppLayouts";
import { StatusPill } from "./admin.index";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Download, Check, X, Edit as EditIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

const TABS = ["All", "New", "Contacted", "Qualified", "Converted"];

export const Route = createFileRoute("/admin/leads")({
  head: () => ({ meta: [{ title: "Leads — Admin" }] }),
  component: AdminLeads,
});

function AdminLeads() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("All");
  const [staffFilter, setStaffFilter] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [bulkStaffId, setBulkStaffId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const params = new URLSearchParams({ status: tab });
  if (staffFilter) params.set("assigned_to", staffFilter);

  const { data, isLoading } = useQuery<any>({
    queryKey: ["admin-leads", tab, staffFilter],
    queryFn: () => api.get<any>(`/admin/leads?${params.toString()}`),
  });

  const { data: staffList } = useQuery<any>({
    queryKey: ["admin-staff-list"],
    queryFn: () => api.get<any>("/admin/staff"),
  });

  const leads: any[] = data?.data ?? [];
  const staff: any[] = Array.isArray(staffList) ? staffList : [];

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/admin/leads/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-leads"] }); toast.success("Lead updated"); setEditingId(null); },
    onError: (err: any) => toast.error(err.message || "Update failed"),
  });

  const bulkAssignMutation = useMutation({
    mutationFn: (data: { ids: number[]; assigned_to: number }) => api.post("/admin/leads/bulk-assign", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-leads"] }); setSelected(new Set()); setBulkStaffId(""); toast.success("Leads assigned"); },
    onError: (err: any) => toast.error(err.message || "Bulk assign failed"),
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return api.post("/admin/leads/import", fd);
    },
    onSuccess: (res: any) => { queryClient.invalidateQueries({ queryKey: ["admin-leads"] }); toast.success(res.message || "Imported"); },
    onError: (err: any) => toast.error(err.message || "Import failed"),
  });

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === leads.length) setSelected(new Set());
    else setSelected(new Set(leads.map((l: any) => l.id)));
  };

  const startEdit = (l: any) => {
    setEditingId(l.id);
    setEditValues({ name: l.name ?? "", phone: l.phone ?? "", email: l.email ?? "", source: l.source ?? "", status: l.status ?? "New", assigned_to: l.assigned_to ?? "" });
  };

  const saveEdit = (id: number) => {
    const payload: any = {};
    for (const key of Object.keys(editValues)) {
      if (editValues[key] !== undefined && editValues[key] !== "") payload[key] = editValues[key];
    }
    updateMutation.mutate({ id, data: payload });
  };

  const handleExport = () => {
    const url = `http://localhost:8000/api/admin/leads/export?status=${tab}`;
    const token = localStorage.getItem("ungalkalyanam_token");
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `leads-${tab.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
        toast.success("Leads exported");
      })
      .catch(() => toast.error("Export failed"));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { importMutation.mutate(file); e.target.value = ""; }
  };

  const bulkAssign = () => {
    if (!bulkStaffId || selected.size === 0) return;
    bulkAssignMutation.mutate({ ids: Array.from(selected), assigned_to: Number(bulkStaffId) });
  };

  const STYLE = {
    cell: "p-3 text-sm",
    input: "h-8 w-full rounded-md border border-input bg-background px-2 text-xs outline-none focus:border-primary",
    nativeSelect: "h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus:border-primary cursor-pointer",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="font-display text-3xl font-bold">Leads</h1><p className="text-sm text-muted-foreground">Manage, assign, import and export leads</p></div>
          <div className="flex flex-wrap gap-2">
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={importMutation.isPending}>
              <Upload className="mr-1.5 h-4 w-4" /> {importMutation.isPending ? "Importing..." : "Import CSV"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-1.5 h-4 w-4" /> Export CSV</Button>
          </div>
        </div>

        {/* Bulk actions bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border bg-muted/30 px-4 py-3 shadow-soft">
            <span className="text-sm font-medium">{selected.size} selected</span>
            <select value={bulkStaffId} onChange={(e) => setBulkStaffId(e.target.value)} className="h-9 w-48 rounded-md border border-input bg-background px-2 text-xs outline-none focus:border-primary cursor-pointer">
              <option value="">Assign to staff...</option>
              {staff.map((s: any) => (
                <option key={s.staffId} value={String(s.staffId)}>{s.name}</option>
              ))}
            </select>
            <Button size="sm" onClick={bulkAssign} disabled={!bulkStaffId || bulkAssignMutation.isPending}>
              {bulkAssignMutation.isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
              Assign
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setSelected(new Set()); setBulkStaffId(""); }}>Clear</Button>
          </div>
        )}

        {/* Tabs + Staff filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {TABS.map((s) => (
              <Button key={s} variant={tab === s ? "default" : "outline"} size="sm" onClick={() => { setTab(s); setSelected(new Set()); }}>{s}</Button>
            ))}
          </div>
          <select value={staffFilter} onChange={(e) => { setStaffFilter(e.target.value); setSelected(new Set()); }} className="h-9 rounded-md border border-input bg-background px-3 text-xs outline-none focus:border-primary cursor-pointer">
            <option value="">All staff</option>
            <option value="unassigned">Unassigned</option>
            {staff.map((s: any) => (
              <option key={s.staffId} value={String(s.staffId)}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-2xl border bg-card shadow-soft overflow-x-auto">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : leads.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-muted-foreground">
              <p className="font-semibold">No leads found</p>
              <p className="text-sm">Import a CSV or change the status filter.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3 w-10">
                    <input type="checkbox" checked={selected.size === leads.length && leads.length > 0} onChange={toggleAll} className="accent-primary" />
                  </th>
                  <th className="p-3">Lead</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Assigned</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((l: any) => {
                  const isEditing = editingId === l.id;
                  return (
                    <tr key={l.id} className={`hover:bg-muted/30 transition-colors ${selected.has(l.id) ? "bg-primary/5" : ""}`}>
                      <td className="p-3">
                        <input type="checkbox" checked={selected.has(l.id)} onChange={() => toggleSelect(l.id)} className="accent-primary" />
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <input className={STYLE.input} value={editValues.name || ""} onChange={(e) => setEditValues({ ...editValues, name: e.target.value })} />
                        ) : (
                          <><span className="font-medium">{l.name}</span><p className="text-[11px] text-muted-foreground">{l.display_id ?? `L${l.id}`}</p></>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <input className={STYLE.input} value={editValues.phone || ""} onChange={(e) => setEditValues({ ...editValues, phone: e.target.value })} />
                        ) : (
                          <span className="text-muted-foreground">{l.phone}</span>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <input className={STYLE.input} value={editValues.email || ""} onChange={(e) => setEditValues({ ...editValues, email: e.target.value })} />
                        ) : (
                          <span className="text-muted-foreground">{l.email ?? "—"}</span>
                        )}
                      </td>
                      <td className={`p-3 ${isEditing ? "" : "text-muted-foreground"}`}>
                        {isEditing ? (
                          <input className={STYLE.input} value={editValues.source || ""} onChange={(e) => setEditValues({ ...editValues, source: e.target.value })} />
                        ) : (
                          l.source
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <select value={editValues.assigned_to} onChange={(e) => setEditValues({ ...editValues, assigned_to: e.target.value })} className={STYLE.nativeSelect}>
                            <option value="">Unassigned</option>
                            {staff.map((s: any) => (
                              <option key={s.staffId} value={String(s.staffId)}>{s.name}</option>
                            ))}
                          </select>
                        ) : (
                          l.assigned_staff?.name ?? <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <select value={editValues.status} onChange={(e) => setEditValues({ ...editValues, status: e.target.value })} className={STYLE.nativeSelect}>
                            {["New", "Contacted", "Qualified", "Converted"].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <StatusPill s={l.status} />
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">{l.created_at ? new Date(l.created_at).toLocaleDateString() : "—"}</td>
                      <td className="p-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => saveEdit(l.id)} className="rounded-md p-1 text-emerald-600 hover:bg-emerald-50" title="Save"><Check className="h-4 w-4" /></button>
                            <button onClick={() => setEditingId(null)} className="rounded-md p-1 text-muted-foreground hover:bg-muted" title="Cancel"><X className="h-4 w-4" /></button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => startEdit(l)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Edit">
                            <EditIcon className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {data?.meta && data.meta.last_page > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Page {data.meta.current_page} of {data.meta.last_page} ({data.meta.total} leads)</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={data.meta.current_page <= 1} onClick={() => {/* pagination via queryKey update would need page state */}}>Previous</Button>
              <Button variant="outline" size="sm" disabled={data.meta.current_page >= data.meta.last_page} onClick={() => {/* pagination via queryKey update would need page state */}}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
