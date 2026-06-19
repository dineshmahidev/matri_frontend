import { useState, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AppLayouts";
import { StatusPill } from "./admin.index";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Loader2, Phone, Calendar, Clock, UserCheck, Mail,
  Briefcase, DollarSign, Download, Printer, Filter, X, Upload,
  FileSpreadsheet,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/staff/$id")({
  head: () => ({ meta: [{ title: "Staff Detail — Admin" }] }),
  component: AdminStaffDetail,
});

type PerformanceDay = {
  date: string;
  present: boolean;
  absent: boolean;
  login_at: string | null;
  logout_at: string | null;
  leads_handled: number;
  conversions: number;
  contacted: number;
};

type PerformanceData = {
  staff: any;
  from: string;
  to: string;
  summary: {
    total_days: number;
    present_days: number;
    absent_days: number;
    leads_handled: number;
    conversions: number;
    new_leads: number;
    contacted: number;
  };
  days: PerformanceDay[];
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function decodeStaffRouteId(routeId: string): string {
  if (routeId.startsWith("S")) {
    return String(parseInt(routeId.slice(1), 10) - 100);
  }
  return routeId;
}

function AdminStaffDetail() {
  const { id } = Route.useParams();
  const staffId = decodeStaffRouteId(id);
  const queryClient = useQueryClient();
  const printRef = useRef<HTMLDivElement>(null);

  const [fromDate, setFromDate] = useState(todayStr());
  const [toDate, setToDate] = useState(todayStr());
  const [leadTab, setLeadTab] = useState<"all" | "converted" | "rejected">("all");
  const [isUploading, setIsUploading] = useState(false);

  const { data: staff, isLoading } = useQuery<any>({
    queryKey: ["admin-staff-detail", staffId],
    queryFn: () => api.get(`/admin/staff/${staffId}`),
  });

  const { data: performance, isLoading: loadingPerf } = useQuery<PerformanceData>({
    queryKey: ["admin-staff-performance", staffId, fromDate, toDate],
    queryFn: () =>
      api.get<PerformanceData>(
        `/admin/staff/${staffId}/performance?from=${fromDate}&to=${toDate}`
      ),
    enabled: !!staffId,
  });

  const setToday = () => {
    const t = todayStr();
    setFromDate(t);
    setToDate(t);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !staff) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        let parsedLeads: any[] = [];

        if (file.name.endsWith(".json")) {
          parsedLeads = JSON.parse(text);
        } else if (file.name.endsWith(".csv")) {
          const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
          const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
          parsedLeads = lines.slice(1).map((line) => {
            const values = line.split(",").map((v) => v.trim());
            const leadObj: any = {};
            headers.forEach((header, index) => {
              leadObj[header] = values[index] || "";
            });
            return leadObj;
          });
        } else {
          toast.error("Please upload CSV or JSON");
          setIsUploading(false);
          return;
        }

        const validLeads = parsedLeads.filter((l) => l.name && l.phone);
        if (validLeads.length === 0) {
          toast.error("File must contain name and phone columns");
          setIsUploading(false);
          return;
        }

        await api.post(`/admin/staff/${staff.staffId}/upload-leads`, {
          leads: validLeads.map((l) => ({
            name: l.name,
            phone: l.phone,
            email: l.email || "",
            source: l.source || "CSV Import",
          })),
        });

        toast.success(`${validLeads.length} leads imported`);
        queryClient.invalidateQueries({ queryKey: ["admin-staff-detail", staffId] });
        queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
      } catch (err: any) {
        toast.error(err.message || "Upload failed");
      } finally {
        setIsUploading(false);
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const filteredLeads = (staff?.assignedLeadsList || []).filter((lead: any) => {
    if (leadTab === "converted" && !["Converted", "Paid"].includes(lead.status)) return false;
    if (leadTab === "rejected" && !["Lost", "Rejected", "Lost & Rejected"].includes(lead.status)) return false;
    return true;
  });

  if (isLoading || !staff) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const summary = performance?.summary;
  const isToday = fromDate === toDate && fromDate === todayStr();

  return (
    <AdminLayout>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #staff-print-report, #staff-print-report * { visibility: visible; }
          #staff-print-report { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="space-y-6 no-print">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/admin/staff" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to staff
          </Link>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-primary to-rose text-white font-display font-black text-lg shrink-0">
              {staff.name.split(" ").map((n: string) => n[0]).join("")}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl sm:text-3xl font-bold truncate">{staff.name}</h1>
              <p className="text-sm text-muted-foreground">{staff.email} · ID {staff.id}</p>
              <div className="mt-1"><StatusPill s={staff.status} /></div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-1.5 h-4 w-4" /> Print report
            </Button>
          </div>
        </div>

        <Tabs defaultValue="info">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="info">Profile</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoCard icon={Mail} label="Email" value={staff.email} />
              <InfoCard icon={Phone} label="Mobile" value={staff.mobile || "N/A"} />
              <InfoCard icon={Briefcase} label="Company mobile" value={staff.companyMobile || "N/A"} />
              <InfoCard icon={Calendar} label="Date of birth" value={staff.dob || "N/A"} />
              <InfoCard icon={DollarSign} label="Salary" value={staff.salary || "N/A"} highlight />
            </div>
            <div className="rounded-2xl border p-4 bg-card">
              <h3 className="text-sm font-semibold uppercase text-primary mb-3">Today&apos;s attendance</h3>
              <div className="grid gap-2 sm:grid-cols-3 text-sm">
                <div><span className="text-muted-foreground">Login</span><p className="font-mono font-semibold">{staff.loginTime || "—"}</p></div>
                <div><span className="text-muted-foreground">Logout</span><p className="font-mono font-semibold">{staff.logoutTime || "—"}</p></div>
                <div><span className="text-muted-foreground">Status</span><p><StatusPill s={staff.status} /></p></div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-4 space-y-5">
            <div className="rounded-2xl border p-4 bg-muted/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                  <Filter className="h-4 w-4 text-primary" /> Date range
                </h3>
                <div className="flex gap-2">
                  <Button size="sm" variant={isToday ? "default" : "outline"} onClick={setToday}>Today</Button>
                  {(fromDate !== todayStr() || toDate !== todayStr()) && (
                    <Button size="sm" variant="ghost" onClick={setToday}><X className="h-3 w-3" /></Button>
                  )}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-muted-foreground">From</label>
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">To</label>
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>
              </div>
            </div>

            {loadingPerf ? (
              <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : summary && (
              <>
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                  <StatCard label="Present days" value={summary.present_days} />
                  <StatCard label="Absent days" value={summary.absent_days} warn={summary.absent_days > 0} />
                  <StatCard label="Leads handled" value={summary.leads_handled} />
                  <StatCard label="Conversions" value={summary.conversions} accent />
                </div>

                <div className="rounded-2xl border overflow-hidden">
                  <div className="border-b p-3 bg-muted/30 text-sm font-semibold">Daily breakdown</div>
                  <div className="overflow-x-auto max-h-80">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/20 text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="p-3 text-left">Date</th>
                          <th className="p-3 text-left">Login</th>
                          <th className="p-3 text-left">Logout</th>
                          <th className="p-3 text-left">Leads</th>
                          <th className="p-3 text-left">Conv.</th>
                          <th className="p-3 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {(performance?.days || []).map((d) => (
                          <tr key={d.date} className={d.absent ? "bg-rose-50/50 dark:bg-rose-950/20" : ""}>
                            <td className="p-3 font-mono text-xs">{d.date}</td>
                            <td className="p-3">{d.login_at || "—"}</td>
                            <td className="p-3">{d.logout_at || "—"}</td>
                            <td className="p-3">{d.leads_handled}</td>
                            <td className="p-3">{d.conversions}</td>
                            <td className="p-3">
                              {d.absent ? (
                                <span className="text-xs font-semibold text-rose-600">Absent</span>
                              ) : d.present ? (
                                <span className="text-xs font-semibold text-emerald-600">Present</span>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            <div className="rounded-2xl border p-4 border-dashed bg-primary/5 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-1.5"><Upload className="h-4 w-4" /> Bulk upload leads</h3>
              <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-primary/20 p-6 hover:bg-muted/10">
                <input type="file" accept=".csv,.json" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileSpreadsheet className="h-6 w-6 text-muted-foreground" />}
              </label>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-sm">Assigned leads ({filteredLeads.length})</h3>
                <div className="flex bg-muted rounded-lg p-0.5 text-xs">
                  {(["all", "converted", "rejected"] as const).map((tab) => (
                    <button key={tab} onClick={() => setLeadTab(tab)}
                      className={`px-2.5 py-1 rounded-md capitalize ${leadTab === tab ? "bg-card shadow-sm" : ""}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredLeads.map((lead: any) => (
                  <div key={lead.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.phone}</p>
                    </div>
                    <StatusPill s={lead.status} />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Printable report */}
      <div id="staff-print-report" ref={printRef} className="hidden print:block">
        <h1 className="text-2xl font-bold mb-1">Staff Performance Report</h1>
        <p className="text-sm mb-4">{staff.name} ({staff.id}) · {fromDate} to {toDate}</p>
        {summary && (
          <table className="w-full text-sm border-collapse mb-6">
            <tbody>
              <tr><td className="border p-2">Present days</td><td className="border p-2">{summary.present_days}</td></tr>
              <tr><td className="border p-2">Absent days</td><td className="border p-2">{summary.absent_days}</td></tr>
              <tr><td className="border p-2">Leads handled</td><td className="border p-2">{summary.leads_handled}</td></tr>
              <tr><td className="border p-2">Conversions</td><td className="border p-2">{summary.conversions}</td></tr>
            </tbody>
          </table>
        )}
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="border p-2 text-left">Date</th>
              <th className="border p-2 text-left">Login</th>
              <th className="border p-2 text-left">Logout</th>
              <th className="border p-2 text-left">Leads</th>
              <th className="border p-2 text-left">Conversions</th>
            </tr>
          </thead>
          <tbody>
            {(performance?.days || []).map((d) => (
              <tr key={d.date}>
                <td className="border p-2">{d.date}</td>
                <td className="border p-2">{d.login_at || "—"}</td>
                <td className="border p-2">{d.logout_at || "—"}</td>
                <td className="border p-2">{d.leads_handled}</td>
                <td className="border p-2">{d.conversions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

function InfoCard({ icon: Icon, label, value, highlight }: { icon: any; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 min-w-0 ${highlight ? "border-primary/20 bg-primary/5" : "bg-muted/20"}`}>
      <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Icon className="h-3.5 w-3.5" /> {label}</p>
      <p className="text-sm font-semibold mt-1 truncate">{value}</p>
    </div>
  );
}

function StatCard({ label, value, warn, accent }: { label: string; value: number; warn?: boolean; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? "border-emerald-500/30 bg-emerald-50/5" : warn ? "border-rose-500/30" : "bg-card"}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-display text-2xl font-black mt-1 ${accent ? "text-emerald-600" : warn ? "text-rose-600" : ""}`}>{value}</p>
    </div>
  );
}
