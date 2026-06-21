import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AppLayouts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { Loader2, MessageSquare, ChevronRight, Clock, CheckCircle2, AlertCircle, Search, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/support-tickets")({
  head: () => ({ meta: [{ title: "Support Tickets — Admin" }] }),
  component: AdminSupportTickets,
});

const STATUS_OPTIONS = ["open", "in_progress", "closed"];
const STATUS_BADGE: Record<string, string> = {
  open: "bg-amber-500/15 text-amber-600 border-amber-500/25",
  in_progress: "bg-blue-500/15 text-blue-600 border-blue-500/25",
  closed: "bg-emerald-500/15 text-emerald-600 border-emerald-500/25",
};

function AdminSupportTickets() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState("in_progress");
  const [filter, setFilter] = useState("all");

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["admin-support-tickets"],
    queryFn: () => api.get("/admin/support-tickets"),
  });

  const list = Array.isArray(tickets) ? tickets : tickets?.data ?? [];

  const replyMutation = useMutation({
    mutationFn: (vars: { id: number; admin_reply: string; status: string }) =>
      api.put<any>(`/admin/support-tickets/${vars.id}`, { admin_reply: vars.admin_reply, status: vars.status }),
    onSuccess: (res: any, vars) => {
      toast.success("Reply sent");
      setReplyText("");
      if (selected) {
        setSelected({ ...selected, ...res?.ticket, admin_reply: vars.admin_reply, status: vars.status, replied_at: new Date().toISOString() });
      }
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to send reply"),
  });

  const filtered = filter === "all" ? list : list.filter((t: any) => t.status === filter);
  const openCount = list.filter((t: any) => t.status === "open").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Support Tickets</h1>
            <p className="text-sm text-muted-foreground">{openCount} open tickets</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", "open", "in_progress", "closed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                filter === s ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/30"
              }`}
            >
              {s === "all" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">No tickets found</div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
            <div className="space-y-3">
              {filtered.map((t: any) => (
                <button
                  key={t.id}
                  onClick={() => { setSelected(t); setReplyText(""); setReplyStatus(t.status); }}
                  className={`w-full text-left flex items-center gap-4 rounded-2xl border p-4 transition-colors cursor-pointer ${
                    selected?.id === t.id ? "border-primary bg-primary/5" : "bg-card hover:bg-muted/40 shadow-soft"
                  }`}
                >
                  <div className="shrink-0">
                    {t.status === "closed" ? <CheckCircle2 className="h-8 w-8 text-emerald-500" /> :
                     t.status === "in_progress" ? <Clock className="h-8 w-8 text-blue-500" /> :
                     <AlertCircle className="h-8 w-8 text-amber-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGE[t.status]}`}>{t.status.replace("_", " ")}</span>
                      <span className="text-[11px] text-muted-foreground">{t.category}</span>
                    </div>
                    <p className="font-semibold text-sm truncate">{t.subject}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.user?.name} ({t.user?.member_profile?.display_id || `UK00${10000 + (t.user?.member_profile?.id || t.user?.id)}`}) — {new Date(t.created_at).toLocaleDateString()}</p>
                  </div>
                </button>
              ))}
            </div>

            {selected && (
              <div className="rounded-2xl border bg-card p-5 shadow-soft space-y-4 lg:sticky lg:top-24 lg:self-start">
                <div>
                  <p className="text-xs text-muted-foreground">{selected.category} — {selected.user?.name} ({selected.user?.member_profile?.display_id || `UK00${10000 + (selected.user?.member_profile?.id || selected.user?.id)}`})</p>
                  <h3 className="font-display font-bold">{selected.subject}</h3>
                </div>

                <div className="rounded-xl bg-muted/40 p-3 text-sm whitespace-pre-wrap">{selected.message}</div>

                {selected.admin_reply && (
                  <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-sm whitespace-pre-wrap">
                    <p className="text-xs font-semibold text-primary mb-1">Admin reply:</p>
                    {selected.admin_reply}
                  </div>
                )}

                <div className="space-y-3">
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="w-full rounded-xl border border-border/60 bg-muted/40 px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none"
                  />
                  <select
                    value={replyStatus}
                    onChange={(e) => setReplyStatus(e.target.value)}
                    className="w-full rounded-xl border border-border/60 bg-muted/40 px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                  <Button
                    onClick={() => replyMutation.mutate({ id: selected.id, admin_reply: replyText, status: replyStatus })}
                    disabled={!replyText.trim() || replyMutation.isPending}
                    className="w-full gradient-rose text-white"
                  >
                    {replyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Send Reply
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
