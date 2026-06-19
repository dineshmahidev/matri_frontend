import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function ScrollingTicker() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings-ticker"],
    queryFn: () => api.get("/settings"),
    staleTime: 60000,
  });

  const enabled = settings?.ticker_enabled === "1" || settings?.ticker_enabled === true;
  const text = settings?.ticker_text || "";

  if (!enabled || !text) return null;

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-rose-900/80 via-amber-800/80 to-rose-900/80 py-1.5">
      <div className="animate-marquee whitespace-nowrap text-xs font-medium text-white tracking-wide">
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
      </div>
    </div>
  );
}
