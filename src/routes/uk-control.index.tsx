import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AppLayouts";
import { Box, Loader2, Power } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Crown, IndianRupee, UserPlus, Heart, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from "recharts";

export const Route = createFileRoute("/uk-control/")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Ungalkalyanam" }] }),
  component: AdminDash,
});

type DashboardData = {
  stats: {
    totalUsers: number;
    activeUsers: number;
    premiumUsers: number;
    revenue: number;
    newSignups: number;
    matches: number;
  };
  revenueChart: { month: string; revenue: number; signups: number }[];
  recentLeads: {
    id: number;
    name: string;
    phone: string;
    source: string;
    status: string;
    assigned_staff?: { name: string } | null;
  }[];
};

function AdminDash() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["admin-dashboard"],
    queryFn: () => api.get<DashboardData>("/admin/dashboard"),
  });

  const { data: refData, isLoading: refLoading } = useQuery({
    queryKey: ["admin-reference-data-dash"],
    queryFn: () => api.get("/admin/reference"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ type, id }: { type: string; id: number }) =>
      api.post(`/admin/reference/${type}/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reference-data-dash"] });
      toast.success("Toggled");
    },
    onError: () => toast.error("Toggle failed"),
  });

  if (isLoading || !data) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const { stats, revenueChart, recentLeads } = data;

  const STATS = [
    { l: "Total Users", v: stats.totalUsers.toLocaleString(), c: "+5.2%", i: Users },
    { l: "Active Users", v: stats.activeUsers.toLocaleString(), c: "+8.1%", i: UserCheck },
    { l: "Premium Users", v: stats.premiumUsers.toLocaleString(), c: "+12%", i: Crown },
    { l: "Revenue (₹)", v: `${(stats.revenue / 100000).toFixed(1)}L`, c: "+18%", i: IndianRupee },
    { l: "New Signups (today)", v: stats.newSignups.toString(), c: "+22", i: UserPlus },
    { l: "Matches (today)", v: stats.matches.toLocaleString(), c: "+9%", i: Heart },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back — here's what's happening today.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {STATS.map((s) => (
            <div key={s.l} className="rounded-2xl border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><s.i className="h-4 w-4" /></span>
                <span className="text-xs font-medium text-success">{s.c}</span>
              </div>
              <p className="mt-4 font-display text-2xl font-bold">{s.v}</p>
              <p className="text-xs text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6 shadow-soft lg:col-span-2">
            <div className="flex items-center justify-between">
              <div><p className="font-semibold">Revenue overview</p><p className="text-xs text-muted-foreground">Last 6 months</p></div>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div className="mt-4 h-72">
              <ResponsiveContainer>
                <AreaChart data={revenueChart}>
                  <defs>
                    <linearGradient id="r1" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.62 0.21 18)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.62 0.21 18)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" fontSize={12} className="text-muted-foreground" />
                  <YAxis fontSize={12} className="text-muted-foreground" />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.75rem" }} />
                  <Area dataKey="revenue" stroke="oklch(0.62 0.21 18)" strokeWidth={2.5} fill="url(#r1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <p className="font-semibold">Signups by month</p>
            <div className="mt-4 h-72">
              <ResponsiveContainer>
                <BarChart data={revenueChart}>
                  <XAxis dataKey="month" fontSize={12} className="text-muted-foreground" />
                  <YAxis fontSize={12} className="text-muted-foreground" />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.75rem" }} />
                  <Bar dataKey="signups" fill="oklch(0.78 0.14 75)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card shadow-soft">
          <div className="flex items-center justify-between border-b p-6">
            <div><p className="font-semibold">Recent leads</p><p className="text-xs text-muted-foreground">Latest signups & inquiries</p></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="p-4">Name</th><th className="p-4">Phone</th><th className="p-4">Source</th><th className="p-4">Status</th><th className="p-4">Assigned</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentLeads.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/40">
                    <td className="p-4 font-medium">{l.name}</td>
                    <td className="p-4 text-muted-foreground">{l.phone}</td>
                    <td className="p-4">{l.source}</td>
                    <td className="p-4"><StatusPill s={l.status} /></td>
                    <td className="p-4">{l.assigned_staff?.name ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border bg-card shadow-soft">
          <div className="flex items-center justify-between border-b p-6">
            <div className="flex items-center gap-2">
              <Box className="h-5 w-5 text-primary" />
              <div><p className="font-semibold">Reference Data</p><p className="text-xs text-muted-foreground">Manage dropdown options — deactivate without breaking existing user data</p></div>
            </div>
          </div>
            {refLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="divide-y divide-border">
              {[
                { key: "religions", label: "Religions", color: "bg-blue-500" },
                { key: "castes", label: "Castes", color: "bg-emerald-500" },
                { key: "states", label: "States", color: "bg-violet-500" },
                { key: "cities", label: "Cities", color: "bg-amber-500" },
                { key: "blood_groups", label: "Blood Groups", color: "bg-rose-500" },
              ].map(({ key, label, color }) => {
                const items = refData?.[key] || [];
                const active = items.filter((i: any) => i.is_active).length;
                const total = items.length;
                return (
                  <div key={key} className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs tabular-nums text-muted-foreground">
                        <span className="font-medium text-foreground">{active}</span> / {total} active
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={() => window.location.href = "/uk-control/reference-data"}
                      >
                        <Power className="h-3 w-3" /> Manage
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export function StatusPill({ s }: { s?: string }) {
  const m: Record<string, string> = {
    New: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    Contacted: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    Qualified: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    Converted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    Lost: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    Inactive: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    Paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    failed: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  };
  if (!s) return <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">Unknown</span>;
  const label = s.charAt(0).toUpperCase() + s.slice(1);
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${m[s] || m[label] || "bg-muted text-muted-foreground"}`}>{label}</span>;
}
