import { useState } from "react";
import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AppLayouts";
import { StatusPill } from "./uk-control.index";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Clock, ArrowRight, X, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/uk-control/staff")({
  head: () => ({ meta: [{ title: "Staff — Admin" }] }),
  component: AdminStaff,
});

function AdminStaff() {
  const queryClient = useQueryClient();
  const matchRoute = useMatchRoute();
  const isDetail = matchRoute({ to: "/uk-control/staff/$id" });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createPassword, setCreatePassword] = useState("");

  const { data: staffData, isLoading } = useQuery<any[]>({
    queryKey: ["admin-staff"],
    queryFn: () => api.get<any[]>("/admin/staff"),
  });

  const createStaffMutation = useMutation({
    mutationFn: (data: any) => api.post("/admin/staff", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
      toast.success("Staff member created successfully");
      setShowCreateModal(false);
      setCreateName("");
      setCreateEmail("");
      setCreatePhone("");
      setCreatePassword("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create staff");
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/staff/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
      toast.success("Staff member deleted");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete staff");
    },
  });

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName || !createEmail || !createPassword) {
      toast.error("Name, email, and password are required");
      return;
    }
    if (createPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    createStaffMutation.mutate({
      name: createName,
      email: createEmail,
      phone: createPhone || undefined,
      password: createPassword,
    });
  };

  const staff = staffData || [];

  return isDetail ? <Outlet /> : (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Staff Management</h1>
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading staff..." : `${staff.length} staff members`}
            </p>
          </div>
          <Button className="gradient-rose text-white shadow-soft" onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add staff
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : staff.length === 0 ? (
          <p className="text-center text-muted-foreground py-16 rounded-2xl border border-dashed">No staff members found.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((s: any) => (
              <Link
                key={s.id}
                to="/uk-control/staff/$id"
                params={{ id: String(s.id) }}
                className="rounded-2xl border bg-card p-5 shadow-soft hover:shadow-md transition-all flex flex-col justify-between text-left"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-primary/80 to-rose-500 text-white font-display font-bold text-sm shrink-0">
                      {s.name.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.email}</p>
                    </div>
                    <StatusPill s={s.status} />
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-muted/50 p-3 border">
                      <p className="text-[10px] uppercase text-muted-foreground font-semibold">Leads</p>
                      <p className="font-display text-xl font-black mt-0.5">{s.leads}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3 border">
                      <p className="text-[10px] uppercase text-muted-foreground font-semibold">Conversions</p>
                      <p className="font-display text-xl font-black text-emerald-600 mt-0.5">{s.conversions}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {s.logoutTime === "Still Logged In" ? "Active" : "Offline"}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-primary font-bold flex items-center gap-0.5">
                      View report <ArrowRight className="h-3 w-3" />
                    </span>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (confirm(`Delete staff "${s.name}"?`)) deleteStaffMutation.mutate(s.staffId || s.id); }}
                      className="ml-2 rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="Delete staff"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Staff Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-card border rounded-3xl p-6 shadow-elevated">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="font-display text-xl font-bold mb-2">Add Staff Member</h2>
            <p className="text-sm text-muted-foreground mb-6">Create a new staff account with login credentials.</p>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="staff-name">Full Name *</Label>
                <Input id="staff-name" value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="e.g. Priya Sharma" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="staff-email">Email Address *</Label>
                <Input id="staff-email" type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} placeholder="priya@example.com" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="staff-phone">Phone Number</Label>
                <Input id="staff-phone" value={createPhone} onChange={(e) => setCreatePhone(e.target.value)} placeholder="9876543210" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="staff-password">Password *</Label>
                <Input id="staff-password" type="password" value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} placeholder="Min 8 characters" required minLength={8} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 gradient-rose text-white" disabled={createStaffMutation.isPending}>
                  {createStaffMutation.isPending ? (
                    <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Creating...</>
                  ) : "Create Staff"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
