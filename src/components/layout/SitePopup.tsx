import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { X } from "lucide-react";

export function SitePopup() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings-popup"],
    queryFn: () => api.get("/settings"),
    staleTime: 60000,
  });

  const [show, setShow] = useState(false);

  const enabled = settings?.popup_enabled === "1" || settings?.popup_enabled === true;
  const image = settings?.popup_image || "";
  const content = settings?.popup_content || "";
  const link = settings?.popup_link || "";
  const linkText = settings?.popup_link_text || "Learn More";

  useEffect(() => {
    if (enabled) {
      const dismissed = sessionStorage.getItem("popup_dismissed");
      if (!dismissed) {
        const timer = setTimeout(() => setShow(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [enabled]);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem("popup_dismissed", "1");
  };

  if (!show || !enabled) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative max-w-md w-full rounded-3xl border border-[rgba(212,175,55,0.25)] bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <button onClick={dismiss} className="absolute top-3 right-3 z-10 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60 transition-colors cursor-pointer">
          <X className="h-4 w-4" />
        </button>
        {image && (
          <img src={image} alt="" className="w-full h-48 object-cover" />
        )}
        <div className="p-6 space-y-4">
          {content && <p className="text-sm text-foreground leading-relaxed">{content}</p>}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full text-center py-2.5 rounded-xl gradient-rose text-white font-semibold text-sm hover:opacity-90 transition-all"
            >
              {linkText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
