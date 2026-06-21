import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AppLayouts";
import { StatusPill } from "./uk-control.index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, CreditCard, Eye, EyeOff, Lock, Unlock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/uk-control/payments")({
  head: () => ({ meta: [{ title: "Payments — Admin" }] }),
  component: AdminPayments,
});

function AdminPayments() {
  const queryClient = useQueryClient();
  const [razorpayKey, setRazorpayKey] = useState("");
  const [razorpaySecret, setRazorpaySecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [showUnlockInput, setShowUnlockInput] = useState(false);

  const { data, isLoading } = useQuery<{ data: any[] }>({
    queryKey: ["admin-payments"],
    queryFn: () => api.get<{ data: any[] }>("/admin/payments"),
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<any>({
    queryKey: ["admin-settings"],
    queryFn: () => api.get<any>("/admin/settings"),
    enabled: unlocked,
  });

  if (settings && !loaded && unlocked) {
    setRazorpayKey(settings.razorpay_key_id || "");
    setRazorpaySecret(settings.razorpay_key_secret || "");
    setLoaded(true);
    setShowUnlockInput(false);
    setUnlockPassword("");
  }

  const verifyMutation = useMutation({
    mutationFn: (password: string) => api.post("/admin/verify-password", { password }),
    onSuccess: (res: any) => {
      if (res.verified) {
        setUnlocked(true);
        toast.success("Unlocked");
      } else {
        toast.error(res.message || "Incorrect password");
      }
    },
    onError: (err: any) => toast.error(err.message || "Incorrect password"),
  });

  const saveMutation = useMutation({
    mutationFn: (data: { settings: Record<string, string> }) => api.post("/admin/settings", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-settings"] }); toast.success("Razorpay settings saved"); },
    onError: (err: any) => toast.error(err.message || "Failed to save settings"),
  });

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockPassword) return;
    verifyMutation.mutate(unlockPassword);
  };

  const handleSaveRazorpay = () => {
    saveMutation.mutate({ settings: { razorpay_key_id: razorpayKey, razorpay_key_secret: razorpaySecret } });
  };

  const payments = data?.data ?? [];
  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { l: "Listed", v: payments.length.toString() },
            { l: "Paid total", v: `₹${totalPaid.toLocaleString()}` },
            { l: "This page", v: payments.length.toString() },
            { l: "Status", v: "Live" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border bg-card p-5 shadow-soft">
              <p className="text-xs uppercase text-muted-foreground">{s.l}</p>
              <p className="mt-2 font-display text-2xl font-bold">{s.v}</p>
            </div>
          ))}
        </div>

        {/* Razorpay Configuration — Locked by default */}
        <div className="rounded-2xl border bg-card p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold">Razorpay Configuration</h2>
            </div>
            {!unlocked && !showUnlockInput && (
              <Button variant="outline" size="sm" onClick={() => setShowUnlockInput(true)}>
                <Lock className="mr-1.5 h-4 w-4" /> Unlock
              </Button>
            )}
          </div>

          {/* Unlock prompt */}
          {showUnlockInput && !unlocked && (
            <form onSubmit={handleUnlock} className="flex items-end gap-3 rounded-xl border bg-muted/30 p-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="unlock-pwd">Enter your password to unlock payment settings</Label>
                <Input id="unlock-pwd" type="password" value={unlockPassword} onChange={(e) => setUnlockPassword(e.target.value)} placeholder="Your admin password" autoFocus />
              </div>
              <Button type="submit" disabled={!unlockPassword || verifyMutation.isPending}>
                {verifyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
                Unlock
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => { setShowUnlockInput(false); setUnlockPassword(""); }}>Cancel</Button>
            </form>
          )}

          {/* Razorpay form — only visible when unlocked */}
          {unlocked && (
            <>
              {settingsLoading ? (
                <div className="flex h-20 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="razorpay-key">Razorpay Key ID</Label>
                    <Input id="razorpay-key" value={razorpayKey} onChange={(e) => setRazorpayKey(e.target.value)} placeholder="rzp_live_..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="razorpay-secret">Razorpay Key Secret</Label>
                    <div className="relative">
                      <Input id="razorpay-secret" type={showSecret ? "text" : "password"} value={razorpaySecret} onChange={(e) => setRazorpaySecret(e.target.value)} placeholder="Enter secret key" />
                      <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={() => { setUnlocked(false); setLoaded(false); setShowUnlockInput(false); setUnlockPassword(""); }} className="text-muted-foreground">
                  <Lock className="mr-1.5 h-4 w-4" /> Lock
                </Button>
                <Button onClick={handleSaveRazorpay} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                  Save Keys
                </Button>
              </div>
            </>
          )}

          {!unlocked && !showUnlockInput && (
            <p className="text-sm text-muted-foreground">Payment settings are locked. Click "Unlock" and enter your admin password to modify Razorpay keys.</p>
          )}
        </div>

        {/* Payments Table */}
        <div className="rounded-2xl border bg-card shadow-soft">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="p-4">ID</th><th className="p-4">Date</th><th className="p-4">Member</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4">Notes</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/40">
                      <td className="p-4 font-medium">{p.id}</td>
                      <td className="p-4 text-muted-foreground">{p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</td>
                      <td className="p-4">{p.user?.name ?? "—"}</td>
                      <td className="p-4 font-semibold">₹{Number(p.amount || 0).toLocaleString()}</td>
                      <td className="p-4"><StatusPill s={p.status} /></td>
                      <td className="p-4 text-xs text-muted-foreground max-w-[200px] truncate" title={p.notes || ""}>{p.notes || "—"}</td>
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
