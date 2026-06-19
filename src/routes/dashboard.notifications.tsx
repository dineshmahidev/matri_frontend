import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/AppLayouts";
import { Heart, MessageCircle, Eye, Users, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/dashboard/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Ungalkalyanam" }] }),
  component: Notif,
});

const ICONS = { interest: Heart, match: Users, message: MessageCircle, view: Eye, info: Users } as const;

type NotificationType = {
  id: number;
  title: string;
  description: string | null;
  type: keyof typeof ICONS;
  read: boolean | number;
  created_at: string;
};

function Notif() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ data: NotificationType[] }>({
    queryKey: ["notifications"],
    queryFn: () => api.get<{ data: NotificationType[] }>("/notifications"),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => api.post(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
    },
  });

  const notifications = data?.data || [];

  return (
    <DashboardLayout>
      <div className="rounded-3xl border bg-card shadow-soft text-left animate-fade-in">
        <div className="border-b p-6">
          <h1 className="font-display text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">Stay on top of every connection.</p>
        </div>
        
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((n) => {
              const Icon = ICONS[n.type] || Heart;
              const isUnread = !n.read;
              return (
                <div 
                  key={n.id} 
                  onClick={() => isUnread && markReadMutation.mutate(n.id)}
                  className={`flex items-start gap-4 p-5 cursor-pointer transition-all ${
                    isUnread ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"
                  }`}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
                  <div className="flex-1">
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
