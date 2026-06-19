import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/AppLayouts";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2, ChevronLeft, MessageSquare, Clock, CheckCircle2, AlertCircle, User, Shield } from "lucide-react";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/dashboard/support-tickets/$id")({
  head: () => ({ meta: [{ title: "Ticket — Ungalkalyanam" }] }),
  component: TicketDetail,
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

function TicketDetail() {
  const { id } = Route.useParams();
  const { language } = useLanguage();
  const isTamil = language === "ta";

  const { data: ticket, isLoading } = useQuery({
    queryKey: ["support-ticket", id],
    queryFn: () => api.get(`/support-tickets/${id}`),
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-48 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  if (!ticket) {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-muted-foreground">{isTamil ? "கோரிக்கை கிடைக்கவில்லை" : "Ticket not found"}</div>
      </DashboardLayout>
    );
  }

  const sb = STATUS_BADGE[ticket.status] || STATUS_BADGE.open;
  const sl = isTamil ? (STATUS_LABEL[ticket.status]?.ta || ticket.status) : (STATUS_LABEL[ticket.status]?.en || ticket.status);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 pb-10 animate-fade-in">
        <Link to="/dashboard/support-tickets" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" /> {isTamil ? "எனது கோரிக்கைகளுக்கு திரும்ப" : "Back to my tickets"}
        </Link>

        <div className="rounded-2xl border bg-card p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${sb}`}>{sl}</span>
            <span className="text-xs text-muted-foreground">{new Date(ticket.created_at).toLocaleDateString()}</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{isTamil ? "பிரிவு" : "Category"}: {ticket.category}</p>
            <h1 className="font-display text-lg font-bold">{ticket.subject}</h1>
          </div>
          <div className="rounded-xl bg-muted/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">{isTamil ? "உங்கள் செய்தி" : "Your Message"}</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
          </div>

          {ticket.admin_reply && (
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">{isTamil ? "நிர்வாகி பதில்" : "Admin Reply"}</span>
                {ticket.replied_at && <span className="text-[11px] text-muted-foreground ml-auto">{new Date(ticket.replied_at).toLocaleDateString()}</span>}
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{ticket.admin_reply}</p>
            </div>
          )}

          {!ticket.admin_reply && ticket.status !== "closed" && (
            <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-4 text-center">
              <Clock className="mx-auto h-5 w-5 text-amber-500 mb-1" />
              <p className="text-sm font-medium">{isTamil ? "பதில் எதிர்பார்க்கப்படுகிறது" : "Awaiting response"}</p>
              <p className="text-xs text-muted-foreground">{isTamil ? "எங்கள் குழு விரைவில் பதிலளிக்கும்" : "Our team will respond shortly"}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
