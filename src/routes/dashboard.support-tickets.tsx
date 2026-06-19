import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/AppLayouts";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2, TicketCheck, ChevronRight, MessageSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/dashboard/support-tickets")({
  head: () => ({ meta: [{ title: "My Tickets — Ungalkalyanam" }] }),
  component: SupportTickets,
});

const STATUS_BADGE: Record<string, string> = {
  open: "bg-amber-500/15 text-amber-600 border-amber-500/25",
  in_progress: "bg-blue-500/15 text-blue-600 border-blue-500/25",
  closed: "bg-emerald-500/15 text-emerald-600 border-emerald-500/25",
};

const STATUS_LABEL: Record<string, { en: string; ta: string }> = {
  open: { en: "Open", ta: "திறந்த" },
  in_progress: { en: "In Progress", ta: "செயல்பாட்டில்" },
  closed: { en: "Closed", ta: "மூடப்பட்டது" },
};

function SupportTickets() {
  const { language } = useLanguage();
  const isTamil = language === "ta";

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["my-support-tickets"],
    queryFn: () => api.get("/support-tickets"),
  });

  const list = Array.isArray(tickets) ? tickets : tickets?.data ?? [];

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-10 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold">{isTamil ? "எனது கோரிக்கைகள்" : "My Support Tickets"}</h1>
            <p className="text-xs text-muted-foreground">{isTamil ? "உங்கள் ஆதரவு கோரிக்கைகளை காண்க" : "View your support requests"}</p>
          </div>
          <Link to="/dashboard/support" className="rounded-xl gradient-rose px-4 py-2 text-xs font-semibold text-white">
            {isTamil ? "புதிய கோரிக்கை" : "New Ticket"}
          </Link>
        </div>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : list.length === 0 ? (
          <div className="rounded-2xl border bg-card p-8 text-center">
            <TicketCheck className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 font-semibold">{isTamil ? "எந்த கோரிக்கையும் இல்லை" : "No tickets yet"}</p>
            <p className="text-sm text-muted-foreground">{isTamil ? "முதல் ஆதரவு கோரிக்கையை சமர்ப்பிக்கவும்" : "Submit your first support request"}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((t: any) => (
              <Link
                key={t.id}
                to="/dashboard/support-tickets/$id"
                params={{ id: t.id.toString() }}
                className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-soft hover:bg-muted/40 transition-colors"
              >
                <div className="shrink-0">
                  {t.status === "closed" ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  ) : t.status === "in_progress" ? (
                    <Clock className="h-8 w-8 text-blue-500" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-amber-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGE[t.status] || STATUS_BADGE.open}`}>
                      {isTamil ? (STATUS_LABEL[t.status]?.ta || t.status) : (STATUS_LABEL[t.status]?.en || t.status)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{t.category}</span>
                  </div>
                  <p className="font-semibold text-sm truncate">{t.subject}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.message}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">{new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
