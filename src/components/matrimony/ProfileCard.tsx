import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Briefcase, GraduationCap, Crown, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

type MemberCard = {
  id: number;
  name: string;
  age?: number;
  photo?: string;
  religion?: string;
  community?: string;
  city?: string;
  state?: string;
  profession?: string;
  education?: string;
  income?: string;
  display_id?: string;
  isSaved?: boolean;
  interestSent?: boolean;
  userId?: number;
  premium?: boolean;
  verified?: boolean;
  activeSubscription?: { plan?: { name?: string } };
};

export function ProfileCard({ m, index = 0 }: { m: MemberCard; index?: number }) {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(m.isSaved || false);
  const [interestSent, setInterestSent] = useState(m.interestSent || false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => { setSaved(m.isSaved || false); }, [m.isSaved]);
  useEffect(() => { setInterestSent(m.interestSent || false); }, [m.interestSent]);
  const [imgError, setImgError] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (saved) {
        await api.delete(`/saved/${m.userId || m.id}`);
        setSaved(false);
        toast.success("Profile removed from saved list");
      } else {
        await api.post("/saved", { saved_user_id: m.userId || m.id });
        setSaved(true);
        toast.success("Profile saved successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["members"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to update saved list.");
    }
  };

  const handleInterest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (interestSent) {
        toast("You have already sent an interest");
      } else {
        await api.post("/interests", { receiver_id: m.userId || m.id });
        setInterestSent(true);
        toast.success("Interest sent successfully to " + m.name);
      }
      queryClient.invalidateQueries({ queryKey: ["members"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to send interest.");
    }
  };

  const handleImageLoad = useCallback(() => setImgLoaded(true), []);
  const handleImageError = useCallback(() => setImgError(true), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.2) }}
      className="group hover-lift overflow-hidden rounded-2xl border bg-card shadow-soft"
    >
      <Link to="/profile/$id" params={{ id: m.id.toString() }} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          {/* Gradient placeholder — visible until image loads or on error */}
          {(!imgLoaded || imgError) && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-muted to-accent/20 flex items-center justify-center">
              <span className="text-4xl font-display font-bold text-primary/20 select-none">
                {m.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
          )}
          {!imgError && (
            <img 
              src={m.photo} 
              alt={m.name} 
              className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
                imgLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
              }`}
              loading="lazy" 
              decoding="async"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            {m.premium && (
              <span className="flex items-center gap-1 rounded-full gradient-gold px-2.5 py-1 text-[11px] font-semibold text-gold-foreground shadow-soft">
                <Crown className="h-3 w-3" /> Premium
              </span>
            )}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/65 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3 text-white">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-display text-lg font-semibold">{m.name}</h3>
              {m.verified && <BadgeCheck className="h-4 w-4 fill-primary text-white" />}
            </div>
            <p className="text-xs text-white/80">{m.age} yrs · {m.height} · {m.community}</p>
          </div>
        </div>
        <div className="space-y-1.5 p-3.5 pb-0 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {m.city}, {m.state}</p>
          <p className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {m.profession}</p>
          <p className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> {m.education}</p>
        </div>
      </Link>
      <div className="p-3.5">
        <div className="flex gap-2 pt-2 relative z-10 border-t border-border/40 mt-1">
          <Button 
            size="sm" 
            variant={saved ? "default" : "outline"} 
            className="flex-1 text-xs"
            onClick={handleSave}
          >
            {saved ? "Saved" : "Save"}
          </Button>
          <Button 
            size="sm" 
            className={`flex-1 text-xs text-white ${interestSent ? "bg-muted-foreground hover:bg-muted-foreground" : "gradient-rose"}`}
            onClick={handleInterest}
            disabled={interestSent}
          >
            <Heart className={`mr-1 h-3 w-3 ${interestSent ? "fill-white" : ""}`} /> 
            {interestSent ? "Sent" : "Interest"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
