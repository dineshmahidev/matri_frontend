import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/AppLayouts";
import { Button } from "@/components/ui/button";
import { Ban, Loader2, MapPin } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getImageUrl } from "@/lib/api";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/dashboard/blocked-users")({
  head: () => ({ meta: [{ title: "Blocked Users — Ungalkalyanam" }] }),
  component: BlockedUsers,
});

function BlockedUsers() {
  const { language } = useLanguage();
  const isTamil = language === "ta";
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<any>({
    queryKey: ["blocked-users"],
    queryFn: () => api.get("/blocks"),
  });

  const blockedUsers = data?.data || [];

  const handleUnblock = async (id: number) => {
    try {
      await api.delete(`/blocks/${id}`);
      toast.success("User unblocked successfully");
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to unblock user");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-3xl border bg-card shadow-soft">
          <div className="border-b p-4 sm:p-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <Ban className="h-5 w-5 text-rose-500" />
              {isTamil ? "தடுக்கப்பட்டவர்கள்" : "Blocked Users"}
            </h2>
          </div>
          
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Ban className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p>{isTamil ? "நீங்கள் யாரையும் தடுக்கவில்லை." : "You haven't blocked any users."}</p>
            </div>
          ) : (
            <div className="divide-y">
              {blockedUsers.map((user: any) => (
                <div key={user.id} className="flex items-center gap-4 p-4 sm:p-6 hover:bg-muted/30 transition-colors">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-full border bg-muted">
                    <img
                      src={getImageUrl(user.photo) || (user.gender?.toLowerCase() === "female" ? "/avatar-female.png" : "/avatar-male.png")}
                      alt={user.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src = user.gender?.toLowerCase() === "female" ? "/avatar-female.png" : "/avatar-male.png";
                      }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <Link
                      to="/profile/$id"
                      params={{ id: user.id }}
                      className="font-display font-bold text-foreground hover:text-primary hover:underline truncate block"
                    >
                      {user.name} <span className="text-muted-foreground font-medium text-xs ml-1">({user.display_id || 'UK00'+(10000+user.id)})</span>
                    </Link>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground truncate">
                      <MapPin className="h-3.5 w-3.5" />
                      {user.city || "N/A"}
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="shrink-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-200"
                    onClick={() => handleUnblock(user.id)}
                  >
                    {isTamil ? "தடையை நீக்கு" : "Unblock"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
