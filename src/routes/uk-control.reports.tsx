import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AppLayouts";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2, IndianRupee, Users, Inbox, Target } from "lucide-react";

type ReportsResponse = {
  totalRevenue: number;
  totalUsers: number;
  totalLeads: number;
  conversionRate: string;
  revenueTrend: { month: string; revenue: number; signups: number }[];
  planDistribution: { name: string; value: number; color: string }[];
};

const COLORS = ["oklch(0.7 0.02 240)", "oklch(0.78 0.14 75)", "oklch(0.62 0.21 18)", "oklch(0.55 0.15 160)", "oklch(0.65 0.12 290)"];

export const Route = createFileRoute("/uk-control/reports")({
  head: () => ({ meta: [{ title: "Reports — Admin" }] }),
  component: AdminReports,
});

function AdminReports() {
  const { data, isLoading } = useQuery<ReportsResponse>({
    queryKey: ["admin-reports"],
    queryFn: () => api.get<ReportsResponse>("/admin/reports"),
  });

  const revenueTrend = data?.revenueTrend ?? [];
  const planDist = data?.planDistribution ?? [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-bold">Reports</h1>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : data ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { l: "Total Revenue", v: `₹${Number(data.totalRevenue).toLocaleString()}`, i: IndianRupee },
              { l: "Total Users", v: data.totalUsers.toLocaleString(), i: Users },
              { l: "Total Leads", v: data.totalLeads.toLocaleString(), i: Inbox },
              { l: "Conversion", v: data.conversionRate, i: Target },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border bg-card p-5 shadow-soft">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><s.i className="h-4 w-4" /></span>
                <p className="mt-4 font-display text-2xl font-bold">{s.v}</p>
                <p className="text-xs text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <p className="font-semibold">Revenue trend</p>
            <div className="h-72">{revenueTrend.length > 0 ? <ResponsiveContainer><LineChart data={revenueTrend}><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} /><Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.75rem" }} /><Line dataKey="revenue" stroke="oklch(0.62 0.21 18)" strokeWidth={3} /></LineChart></ResponsiveContainer> : <p className="text-sm text-muted-foreground pt-20 text-center">No revenue data yet</p>}</div>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <p className="font-semibold">Signups</p>
            <div className="h-72">{revenueTrend.length > 0 ? <ResponsiveContainer><BarChart data={revenueTrend}><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} /><Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.75rem" }} /><Bar dataKey="signups" fill="oklch(0.78 0.14 75)" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer> : <p className="text-sm text-muted-foreground pt-20 text-center">No signup data yet</p>}</div>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-soft lg:col-span-2">
            <p className="font-semibold">Plan distribution</p>
            <div className="h-72">{planDist.length > 0 ? <ResponsiveContainer><PieChart><Pie data={planDist} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>{planDist.map((p: any, i: number) => <Cell key={i} fill={p.color || COLORS[i % COLORS.length]} />)}</Pie><Legend /><Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.75rem" }} /></PieChart></ResponsiveContainer> : <p className="text-sm text-muted-foreground pt-20 text-center">No plan data yet</p>}</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
