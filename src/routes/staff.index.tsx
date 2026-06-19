import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AppLayouts";
import { StatusPill } from "./admin.index";
import { Inbox, Phone, CheckCircle2, Loader2, LogIn, LogOut, Clock, History, Calendar, ChevronLeft, ChevronRight, Sun } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/staff/")({
  head: () => ({ meta: [{ title: "Staff Dashboard — Ungalkalyanam" }] }),
  component: StaffDashboard,
});

type DashboardDataType = {
  name: string;
  stats: { assigned: number; contacted: number; converted: number };
  attendance: {
    checked_in: boolean;
    checked_out: boolean;
    login_at: string | null;
    logout_at: string | null;
  };
  leads: any[];
};

type AttendanceHistory = {
  today: { date: string; login_at: string | null; logout_at: string | null; checked_in: boolean; checked_out: boolean } | null;
  history: { date: string; login_at: string | null; logout_at: string | null }[];
};

type MonthlyReport = {
  month: string;
  days: {
    date: string;
    login_at: string | null;
    logout_at: string | null;
    checked_in: boolean;
    checked_out: boolean;
    new_leads: number;
    converted: number;
    contacted: number;
    completed: number;
    pending: number;
  }[];
  summary: {
    total_leads: number;
    total_converted: number;
    total_contacted: number;
    total_completed: number;
    total_pending: number;
    conversion_rate: number;
    days_worked: number;
  };
};

function StaffDashboard() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"today" | "month">("today");
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const { data, isLoading, isError, error } = useQuery<DashboardDataType>({
    queryKey: ["staff-dashboard-data"],
    queryFn: () => api.get<DashboardDataType>("/staff/dashboard"),
    retry: false,
    staleTime: 30_000,
  });

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery<AttendanceHistory>({
    queryKey: ["staff-attendance"],
    queryFn: () => api.get<AttendanceHistory>("/staff/attendance"),
    retry: false,
    staleTime: 60_000,
  });

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery<MonthlyReport>({
    queryKey: ["staff-monthly-report", month],
    queryFn: () => api.get<MonthlyReport>(`/staff/monthly-report?month=${month}`),
    retry: false,
    enabled: tab === "month",
  });

  if (error) console.error("[Staff Dashboard] Dashboard query error:", error);

  const checkInMutation = useMutation({
    mutationFn: () => api.post("/staff/attendance/check-in"),
    onSuccess: () => {
      toast.success("Checked in successfully");
      queryClient.invalidateQueries({ queryKey: ["staff-dashboard-data"] });
      queryClient.invalidateQueries({ queryKey: ["staff-attendance"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const checkOutMutation = useMutation({
    mutationFn: () => api.post("/staff/attendance/check-out"),
    onSuccess: () => {
      toast.success("Checked out successfully");
      queryClient.invalidateQueries({ queryKey: ["staff-dashboard-data"] });
      queryClient.invalidateQueries({ queryKey: ["staff-attendance"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isError) {
    return (
      <AdminLayout role="Staff">
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Failed to load dashboard data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </AdminLayout>
    );
  }

  if (isLoading || !data) {
    return (
      <AdminLayout role="Staff">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const { name, stats, attendance, leads } = data;
  const safeStats = { assigned: 0, contacted: 0, converted: 0, ...(stats || {}) };
  const safeAttendance = { checked_in: false, checked_out: false, login_at: null, logout_at: null, ...(attendance || {}) };
  const safeLeads = leads || [];
  const canCheckIn = !safeAttendance.checked_in;
  const canCheckOut = safeAttendance.checked_in && !safeAttendance.checked_out;

  return (
    <AdminLayout role="Staff">
      <div className="space-y-6 text-left animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Hi, {name}</h1>
            <p className="text-sm text-muted-foreground">You have {safeStats.assigned} leads assigned in total.</p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl border bg-card p-1 shadow-sm">
            <button onClick={() => setTab("today")} className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === "today" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <Sun className="h-4 w-4" /> Today
            </button>
            <button onClick={() => setTab("month")} className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === "month" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <Calendar className="h-4 w-4" /> Month
            </button>
          </div>
        </div>

        {tab === "today" ? (
          <>
            {/* Attendance */}
            <div className="rounded-2xl border bg-card p-5 shadow-soft space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Today&apos;s attendance</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {safeAttendance.login_at ? `Checked in at ${safeAttendance.login_at}` : "Not checked in yet"}
                    {safeAttendance.logout_at ? ` · Out at ${safeAttendance.logout_at}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="gradient-rose text-white min-h-10 min-w-[100px]" disabled={!canCheckIn || checkInMutation.isPending} onClick={() => checkInMutation.mutate()}>
                    {checkInMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><LogIn className="mr-1 h-4 w-4" /> Check in</>}
                  </Button>
                  <Button size="sm" variant="outline" className="min-h-10 min-w-[100px]" disabled={!canCheckOut || checkOutMutation.isPending} onClick={() => checkOutMutation.mutate()}>
                    {checkOutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><LogOut className="mr-1 h-4 w-4" /> Check out</>}
                  </Button>
                </div>
              </div>

              {attendanceData?.history && attendanceData.history.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1"><History className="h-3.5 w-3.5" /> Recent history</p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {attendanceData.history.slice(0, 7).map((h) => (
                      <div key={h.date} className="flex justify-between text-xs rounded-lg bg-muted/30 px-3 py-2">
                        <span className="font-mono">{h.date}</span>
                        <span className="text-muted-foreground">{h.login_at || "—"} → {h.logout_at || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
              {[
                { l: "Assigned", v: safeStats.assigned.toString(), i: Inbox },
                { l: "Contacted", v: safeStats.contacted.toString(), i: Phone },
                { l: "Converted", v: safeStats.converted.toString(), i: CheckCircle2 },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl border bg-card p-4 sm:p-5 shadow-soft">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><s.i className="h-4 w-4" /></span>
                  <p className="mt-3 font-display text-xl sm:text-2xl font-bold">{s.v}</p>
                  <p className="text-xs text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>

            {/* Recent leads */}
            <div className="rounded-2xl border bg-card shadow-soft overflow-hidden">
              <div className="border-b p-4 sm:p-6"><p className="font-semibold">Recent leads</p></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3 sm:p-4">Lead</th>
                      <th className="p-3 sm:p-4">Phone</th>
                      <th className="p-3 sm:p-4 hidden sm:table-cell">Source</th>
                      <th className="p-3 sm:p-4">Status</th>
                      <th className="p-3 sm:p-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {safeLeads.map((l: any) => (
                      <tr key={l.id} className="hover:bg-muted/40">
                        <td className="p-3 sm:p-4 font-medium">{l.name}</td>
                        <td className="p-3 sm:p-4 text-muted-foreground">{l.phone}</td>
                        <td className="p-3 sm:p-4 hidden sm:table-cell">{l.source}</td>
                        <td className="p-3 sm:p-4"><StatusPill s={l.status} /></td>
                        <td className="p-3 sm:p-4">
                          <Link to="/staff/lead/$id" params={{ id: String(l.id) }} className="text-sm font-medium text-primary hover:underline whitespace-nowrap">Open</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Month selector */}
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => {
                const d = new Date(month + "-01");
                d.setMonth(d.getMonth() - 1);
                setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
              }}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="h-11 rounded-xl border bg-background px-4 text-sm font-semibold"
              />
              <Button variant="outline" size="icon" onClick={() => {
                const d = new Date(month + "-01");
                d.setMonth(d.getMonth() + 1);
                setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
              }}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {monthlyLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : monthlyData ? (
              <>
                {/* Month summary cards */}
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
                  {[
                    { l: "Days Worked", v: monthlyData.summary.days_worked.toString(), i: Calendar },
                    { l: "New Leads", v: monthlyData.summary.total_leads.toString(), i: Inbox },
                    { l: "Contacted", v: monthlyData.summary.total_contacted.toString(), i: Phone },
                    { l: "Converted", v: monthlyData.summary.total_converted.toString(), i: CheckCircle2 },
                    { l: "Pending", v: monthlyData.summary.total_pending.toString(), i: Clock },
                    { l: "Conversion Rate", v: `${monthlyData.summary.conversion_rate}%`, i: Sun },
                  ].map((s) => (
                    <div key={s.l} className="rounded-2xl border bg-card p-3 sm:p-4 shadow-soft">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><s.i className="h-3.5 w-3.5" /></span>
                      <p className="mt-2 font-display text-lg sm:text-xl font-bold">{s.v}</p>
                      <p className="text-[11px] text-muted-foreground">{s.l}</p>
                    </div>
                  ))}
                </div>

                {/* Daily table */}
                <div className="rounded-2xl border bg-card shadow-soft overflow-hidden">
                  <div className="border-b p-4 sm:p-6"><p className="font-semibold">Daily Breakdown</p></div>
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full text-sm min-w-[700px]">
                      <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground sticky top-0">
                        <tr>
                          <th className="p-3 sm:p-4">Date</th>
                          <th className="p-3 sm:p-4">Login</th>
                          <th className="p-3 sm:p-4">Logout</th>
                          <th className="p-3 sm:p-4">New</th>
                          <th className="p-3 sm:p-4">Contacted</th>
                          <th className="p-3 sm:p-4">Converted</th>
                          <th className="p-3 sm:p-4">Pending</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {monthlyData.days.map((d) => {
                          const today = new Date();
                          const isToday = d.date === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                          return (
                            <tr key={d.date} className={`hover:bg-muted/40 ${isToday ? "bg-primary/5" : ""}`}>
                              <td className="p-3 sm:p-4 font-mono text-xs font-medium">{d.date}</td>
                              <td className="p-3 sm:p-4">
                                {d.checked_in ? <span className="text-emerald-600 dark:text-emerald-400">{d.login_at}</span> : <span className="text-muted-foreground">—</span>}
                              </td>
                              <td className="p-3 sm:p-4">
                                {d.checked_out ? <span className="text-rose-600 dark:text-rose-400">{d.logout_at}</span> : <span className="text-muted-foreground">—</span>}
                              </td>
                              <td className="p-3 sm:p-4">{d.new_leads}</td>
                              <td className="p-3 sm:p-4">{d.contacted}</td>
                              <td className="p-3 sm:p-4 text-emerald-600 dark:text-emerald-400 font-semibold">{d.converted}</td>
                              <td className="p-3 sm:p-4 text-amber-600 dark:text-amber-400">{d.pending}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">Failed to load monthly report</p>
                <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["staff-monthly-report", month] })}>Retry</Button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
