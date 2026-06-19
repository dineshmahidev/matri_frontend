import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AppLayouts";
import { StatusPill } from "./admin.index";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Clock, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/staff")({
  head: () => ({ meta: [{ title: "Staff — Admin" }] }),
  component: AdminStaff,
});

function AdminStaff() {
  const { data: staffData, isLoading } = useQuery<any[]>({
    queryKey: ["admin-staff"],
    queryFn: () => api.get<any[]>("/admin/staff"),
  });

  const staff = staffData || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Staff Management</h1>
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading staff..." : `${staff.length} staff members`}
            </p>
          </div>
          <Button className="gradient-rose text-white shadow-soft" disabled>
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
                to="/admin/staff/$id"
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
                  <span className="text-primary font-bold flex items-center gap-0.5">
                    View report <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
