import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/AppLayouts";
import { Loader2, Send, Clock, CheckCircle, XCircle, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/contact-requests-sent")({
  head: () => ({ meta: [{ title: "Requested Profiles — Ungalkalyanam" }] }),
  component: ContactRequestsSent,
});

function ContactRequestsSent() {
  const { data: requests, isLoading } = useQuery({
    queryKey: ["contact-requests-sent"],
    queryFn: () => api.get("/contact-requests/sent"),
  });

  const statusIcon = (s: string) => {
    if (s === "pending") return <Clock className="h-4 w-4 text-amber-500" />;
    if (s === "accepted") return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    return <XCircle className="h-4 w-4 text-rose-500" />;
  };

  const statusLabel = (s: string) => {
    if (s === "pending") return "Pending";
    if (s === "accepted") return "Accepted";
    return "Rejected";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Requested Profiles</h1>
          <p className="text-sm text-muted-foreground mt-1">Profiles you have requested to view contact details</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : !requests?.length ? (
          <div className="text-center py-12 text-muted-foreground">
            <Send className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No contact requests sent yet</p>
            <p className="text-sm">Browse members and request to view their contact details</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r: any) => (
              <Link key={r.id} to={`/profile/${r.target.id}`} className="flex items-center gap-4 rounded-2xl border bg-card p-4 hover:bg-muted/30 transition-colors">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {r.target?.profile?.photo ? (
                    <img src={r.target.profile.photo} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{r.target?.name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{r.target?.profile?.age} yrs | {r.target?.profile?.city}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  {statusIcon(r.status)}
                  <span>{statusLabel(r.status)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
