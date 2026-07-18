import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ReactNode, useEffect } from "react";
import { Loader2 } from "lucide-react";

export function MaintenanceGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["site-settings-maintenance"],
    queryFn: () => api.get("/settings"),
    staleTime: 60000,
  });

  const inMaintenance = settings?.maintenance_mode === "1" || settings?.maintenance_mode === true;
  const token = typeof window !== "undefined" ? localStorage.getItem("ungalkalyanam_token") : null;
  const userRaw = typeof window !== "undefined" ? localStorage.getItem("ungalkalyanam_user") : null;
  let isAdmin = false;
  try {
    const user = userRaw ? JSON.parse(userRaw) : null;
    isAdmin = user?.role === "admin";
  } catch {}
  const onAdminPath = pathname.startsWith("/uk-control");
  const onLoginPath = pathname === "/login";



  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (inMaintenance && !isAdmin && !onAdminPath) {
    if (onLoginPath) return <>{children}</>;
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="max-w-md text-center space-y-4 text-slate-900">
          <img src="/website-under-maintenance.gif" alt="Website Under Maintenance" className="mx-auto w-full max-w-[300px] h-auto object-contain" />
          <h1 className="font-display text-2xl font-bold">{settings?.maintenance_headline || "Under Maintenance"}</h1>
          <p className="text-slate-600">{settings?.maintenance_message || "We're working on something awesome. Please check back soon."}</p>
          {settings?.maintenance_timer && (
            <p className="text-sm text-primary font-medium">
              Expected completion: {new Date(settings.maintenance_timer).toLocaleString()}
            </p>
          )}
          <button
            onClick={() => navigate({ to: "/login", search: { maintenance: "1" }, replace: true })}
            className="px-6 py-2 rounded-xl gradient-rose text-white font-semibold text-sm cursor-pointer"
          >
            {token ? "Go to Login" : "Refresh"}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
