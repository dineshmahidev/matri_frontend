import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AppLayouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, ToggleLeft, ToggleRight, Loader2, Eye, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/uk-control/reference-data")({
  component: ReferenceDataPage,
});

type Tab = "religions" | "castes" | "states" | "cities" | "blood-groups";

interface Religion { id: number; name: string; is_active: boolean }
interface Caste { id: number; name: string; religion_id: number; religion?: Religion; is_active: boolean }
interface State { id: number; name: string; is_active: boolean }
interface City { id: number; name: string; state_id: number; state?: State; is_active: boolean }
interface BloodGroup { id: number; name: string; name_ta?: string; is_active: boolean }

type AnyItem = Religion | Caste | State | City | BloodGroup;

const TABS: { key: Tab; label: string; dataKey: string }[] = [
  { key: "religions", label: "Religions", dataKey: "religions" },
  { key: "castes", label: "Castes", dataKey: "castes" },
  { key: "states", label: "States", dataKey: "states" },
  { key: "cities", label: "Cities", dataKey: "cities" },
  { key: "blood-groups", label: "Blood Groups", dataKey: "blood_groups" },
];

const ITEMS_PER_PAGE = 15;

function ReferenceDataPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("religions");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<{ item: AnyItem | null; tab: Tab | null }>({ item: null, tab: null });
  const [viewing, setViewing] = useState<AnyItem | null>(null);
  const [deleting, setDeleting] = useState<AnyItem | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: refData, isLoading, error } = useQuery({
    queryKey: ["admin-reference-data"],
    queryFn: () => api.get("/admin/reference"),
  });

  const currentTab = TABS.find(t => t.key === activeTab)!;
  const items: AnyItem[] = refData?.[currentTab.dataKey] || [];
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginated = items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const saveMutation = useMutation({
    mutationFn: ({ tab, id, payload }: { tab: Tab; id?: number | null; payload: Record<string, string> }) => {
      if (id) return api.put(`/admin/reference/${tab}/${id}`, payload);
      return api.post(`/admin/reference/${tab}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reference-data"] });
      toast.success("Saved");
      setEditing({ item: null, tab: null });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Save failed"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ tab, id }: { tab: Tab; id: number }) => api.post(`/admin/reference/${tab}/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reference-data"] });
      toast.success("Toggled");
    },
    onError: () => toast.error("Toggle failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ tab, id }: { tab: Tab; id: number }) => api.delete(`/admin/reference/${tab}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reference-data"] });
      toast.success("Deleted");
      setDeleting(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Delete failed"),
  });

  const openCreate = () => {
    const init: Record<string, string> = { name: "" };
    if (activeTab === "castes") init.religion_id = "";
    if (activeTab === "cities") init.state_id = "";
    if (activeTab === "blood-groups") init.name_ta = "";
    setForm(init);
    setEditing({ item: null, tab: activeTab });
  };

  const openEdit = (item: AnyItem) => {
    const f: Record<string, string> = { name: (item as any).name };
    if (activeTab === "castes") f.religion_id = String((item as Caste).religion_id);
    if (activeTab === "cities") f.state_id = String((item as City).state_id);
    if (activeTab === "blood-groups") f.name_ta = (item as BloodGroup).name_ta || "";
    setForm(f);
    setEditing({ item, tab: activeTab });
  };

  const save = () => {
    if (!editing.tab) return;
    const tab = editing.tab;
    const isEdit = !!editing.item;
    const id = isEdit ? (editing.item as any).id : null;
    const payload: Record<string, string> = {};

    if (tab === "blood-groups") {
      if (form.name?.trim()) payload.name = form.name.trim();
      payload.name_ta = form.name_ta || "";
    } else if (tab === "castes" || tab === "cities") {
      if (form.name?.trim()) payload.name = form.name.trim();
      if (tab === "castes" && form.religion_id) payload.religion_id = form.religion_id;
      if (tab === "cities" && form.state_id) payload.state_id = form.state_id;
    } else {
      if (form.name?.trim()) payload.name = form.name.trim();
    }
    if (!isEdit) payload.name = form.name?.trim() || "";

    saveMutation.mutate({ tab, id, payload });
  };

  const renderName = (item: AnyItem) => {
    const parts = [(item as any).name];
    if (activeTab === "castes" && (item as Caste).religion) parts.push(`(${(item as Caste).religion!.name})`);
    if (activeTab === "cities" && (item as City).state) parts.push(`(${(item as City).state!.name})`);
    if (activeTab === "blood-groups" && (item as BloodGroup).name_ta) parts.push(`- ${(item as BloodGroup).name_ta}`);
    return parts.join(" ");
  };

  const detailFields = (item: AnyItem) => {
    const fields: { label: string; value: string }[] = [{ label: "ID", value: String((item as any).id) }, { label: "Name", value: (item as any).name }];
    if (activeTab === "castes") {
      fields.push({ label: "Religion ID", value: String((item as Caste).religion_id) });
      if ((item as Caste).religion) fields.push({ label: "Religion", value: (item as Caste).religion!.name });
    }
    if (activeTab === "cities") {
      fields.push({ label: "State ID", value: String((item as City).state_id) });
      if ((item as City).state) fields.push({ label: "State", value: (item as City).state!.name });
    }
    if (activeTab === "blood-groups") {
      fields.push({ label: "Tamil Name", value: (item as BloodGroup).name_ta || "—" });
    }
    fields.push({ label: "Status", value: item.is_active ? "Active" : "Inactive" });
    return fields;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Reference Data</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage dropdown options. Deactivated items stay linked to existing users but are hidden from new selections.</p>
          </div>
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add</Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {TABS.map(t => (
            <Button key={t.key} variant={activeTab === t.key ? "default" : "outline"} onClick={() => { setActiveTab(t.key); setPage(1) }}>
              {t.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : error ? (
          <Card className="border-destructive">
            <CardContent className="py-8 text-center">
              <p className="text-destructive font-medium">Failed to load data</p>
              <p className="text-sm text-muted-foreground mt-1">{(error as any)?.message || "Check console for details"}</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader><CardTitle className="capitalize">{activeTab.replace("_", " ")}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-44">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((item: AnyItem, idx: number) => (
                    <TableRow key={(item as any).id}>
                      <TableCell className="text-muted-foreground text-xs">{(page - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                      <TableCell className="font-medium">{renderName(item)}</TableCell>
                      <TableCell>
                        <Badge variant={item.is_active ? "default" : "secondary"}>
                          {item.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="ghost" onClick={() => setViewing(item)} title="View">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openEdit(item)} title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => toggleMutation.mutate({ tab: activeTab, id: (item as any).id })} disabled={toggleMutation.isPending} title="Toggle active">
                            {item.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleting(item)} title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginated.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No items</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                  <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                  <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* View Dialog */}
        <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{activeTab.replace("_", " ").slice(0, -1)} Details</DialogTitle>
            </DialogHeader>
            {viewing && (
              <div className="space-y-3">
                {detailFields(viewing).map(f => (
                  <div key={f.label} className="flex justify-between border-b pb-2">
                    <span className="text-sm font-medium text-muted-foreground">{f.label}</span>
                    <span className="text-sm">{f.value}</span>
                  </div>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit/Create Dialog */}
        <Dialog open={!!editing.tab} onOpenChange={() => setEditing({ item: null, tab: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing.item ? "Edit" : "Add"} {activeTab.replace("_", " ").slice(0, -1)}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              {activeTab === "castes" && (
                <div>
                  <label className="text-sm font-medium">Religion</label>
                  <Select value={form.religion_id || ""} onValueChange={v => setForm(f => ({ ...f, religion_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select religion" /></SelectTrigger>
                    <SelectContent>
                      {refData?.religions?.filter((r: Religion) => r.is_active).map((r: Religion) => (
                        <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {activeTab === "cities" && (
                <div>
                  <label className="text-sm font-medium">State</label>
                  <Select value={form.state_id || ""} onValueChange={v => setForm(f => ({ ...f, state_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {refData?.states?.filter((s: State) => s.is_active).map((s: State) => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {activeTab === "blood_groups" && (
                <div>
                  <label className="text-sm font-medium">Name (Tamil)</label>
                  <Input value={form.name_ta || ""} onChange={e => setForm(f => ({ ...f, name_ta: e.target.value }))} />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing({ item: null, tab: null })}>Cancel</Button>
              <Button onClick={save} disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete {activeTab.replace("_", " ").slice(0, -1)}</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{deleting ? (deleting as any).name : ""}</strong>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => deleting && deleteMutation.mutate({ tab: activeTab, id: (deleting as any).id })}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
