import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/AppLayouts";
import { Loader2, Inbox, Check, X, User, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact-requests-received")({
  head: () => ({ meta: [{ title: "Received Requests — Ungalkalyanam" }] }),
  component: ContactRequestsReceived,
});

function ContactRequestsReceived() {
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["contact-requests-received"],
    queryFn: () => api.get("/contact-requests/received"),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.put(`/contact-requests/${id}/respond`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-requests-received"] });
      toast.success("Request updated");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to respond"),
  });

  const pending = requests?.filter((r: any) => r.status === "pending") || [];
  const history = requests?.filter((r: any) => r.status !== "pending") || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Received Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">Members requesting to view your contact details</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : !requests?.length ? (
          <div className="text-center py-12 text-muted-foreground">
            <Inbox className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No contact requests received</p>
          </div>
        ) : (
          <>
            {pending.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Pending ({pending.length})</h2>
                {pending.map((r: any) => (
                  <div key={r.id} className="flex items-center gap-4 rounded-2xl border bg-card p-4">
                    <Link to={`/profile/${r.requester.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {r.requester?.profile?.photo ? (
                          <img src={r.requester.profile.photo} className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{r.requester?.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{r.requester?.profile?.age} yrs | {r.requester?.profile?.city}</p>
                      </div>
                    </Link>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => respondMutation.mutate({ id: r.id, status: "accepted" })} disabled={respondMutation.isPending}>
                        <Check className="w-4 h-4 mr-1" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => respondMutation.mutate({ id: r.id, status: "rejected" })} disabled={respondMutation.isPending}>
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {history.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider pt-4 border-t">History</h2>
                {history.map((r: any) => (
                  <Link key={r.id} to={`/profile/${r.requester.id}`} className="flex items-center gap-4 rounded-2xl border bg-card p-4 hover:bg-muted/30 transition-colors">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {r.requester?.profile?.photo ? (
                        <img src={r.requester.profile.photo} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{r.requester?.name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{r.requester?.profile?.age} yrs | {r.requester?.profile?.city}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${r.status === "accepted" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {r.status === "accepted" ? "Accepted" : "Rejected"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
