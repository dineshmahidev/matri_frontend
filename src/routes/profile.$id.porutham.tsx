import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/language";
import { 
  ArrowLeft, Sparkles, AlertTriangle, CheckCircle, XCircle, 
  Calendar, Clock, Heart, HelpCircle 
} from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/profile/$id/porutham")({
  head: ({ params }) => ({ meta: [{ title: `Porutham Match ${params.id} — Ungalkalyanam` }] }),
  loader: async ({ params }) => {
    try {
      const res = await api.get<any>(`/members/${params.id}/match`);
      return res.data;
    } catch (e) {
      throw notFound();
    }
  },
  component: PoruthamMatch,
});

function PoruthamMatch() {
  const matchData = Route.useLoaderData();
  const { id } = Route.useParams();
  const { language } = useLanguage();

  const isTamil = language === "ta";

  const {
    female,
    male,
    poruthams,
    points,
    max_points,
    matched_count,
    compatibility_percentage,
    rajju_pass,
    vedha_pass,
    verdict,
  } = matchData;

  // Convert key/values of poruthams to array
  const poruthamList = Object.keys(poruthams).map((key) => {
    return {
      key,
      ...poruthams[key],
    };
  });

  const getStatusColor = (score: number) => {
    if (score === 1) return "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400";
    if (score === 0.5) return "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400";
    return "border-rose-500/30 bg-rose-500/5 text-rose-600 dark:text-rose-400";
  };

  const getStatusIcon = (score: number) => {
    if (score === 1) return <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />;
    if (score === 0.5) return <HelpCircle className="h-5 w-5 text-amber-500 shrink-0" />;
    return <XCircle className="h-5 w-5 text-rose-500 shrink-0" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="icon" className="rounded-full shadow-sm">
              <Link to="/profile/$id" params={{ id }}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent">
                {isTamil ? "திருமண பொருத்தம்" : "Horoscope Matching"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {isTamil 
                  ? "பத்து பொருத்தங்கள் மற்றும் ஜாதக பொருத்தம் விவரங்கள்" 
                  : "Vedic Dasama Porutham compatibility details"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">ID: {id}</span>
          </div>
        </div>

        {/* Verdict Banner & Percentage Check */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Compatibility score Circle gauge */}
          <div className="rounded-3xl border bg-card p-6 flex flex-col items-center justify-center text-center shadow-soft relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-amber-500/10 to-rose-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative flex items-center justify-center mb-4">
              {/* Simple Ring Progress */}
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  className="stroke-muted"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  className="stroke-amber-500 transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 * (1 - compatibility_percentage / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className="font-display text-3xl font-black text-foreground">
                  {compatibility_percentage}%
                </span>
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {isTamil ? "பொருத்தம்" : "Match Score"}
                </p>
              </div>
            </div>

            <div className="bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold px-4 py-1.5 rounded-full text-sm inline-flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> {matched_count} / {max_points} {isTamil ? "பொருத்தங்கள்" : "Matches"}
            </div>
          </div>

          {/* Verdict details */}
          <div className="md:col-span-2 rounded-3xl border bg-card p-6 flex flex-col justify-between shadow-soft">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1">
                {isTamil ? "பொருத்த முடிவு" : "Astrological Verdict"}
              </span>
              <h2 className="text-2xl font-display font-black text-foreground mb-3">
                {isTamil ? verdict.ta : verdict.en}
              </h2>
              
              {/* Warnings and alerts */}
              <div className="space-y-2 mt-4">
                {rajju_pass ? (
                  <div className="flex items-start gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20">
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">{isTamil ? "ரஜ்ஜு பொருத்தம் உண்டு ✓" : "Rajju Porutham Matched ✓"}</span>
                      <p className="text-[11px] opacity-90 mt-0.5">
                        {isTamil 
                          ? "மாங்கல்ய பலம் மற்றும் கணவருக்கு நீண்ட ஆயுள் சிறப்பாக உள்ளது." 
                          : "Ensures safety, longevity of the husband, and marital prosperity."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/5 p-3 rounded-xl border border-rose-500/20 animate-pulse">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">{isTamil ? "ரஜ்ஜு தோஷம் உள்ளது ⚠" : "Rajju Dosham / Same Rajju Warning ⚠"}</span>
                      <p className="text-[11px] opacity-90 mt-0.5">
                        {isTamil 
                          ? "இருவருக்கும் ஒரே ரஜ்ஜு உள்ளது. இது திருமணத்திற்கு உகந்ததாக கருதப்படுவதில்லை." 
                          : "Both share the same Rajju zone. According to traditional rules, this indicates a high risk to husband's longevity."}
                      </p>
                    </div>
                  </div>
                )}

                {vedha_pass ? (
                  <div className="flex items-start gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20">
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">{isTamil ? "வேதை பொருத்தம் உண்டு ✓" : "Vedha Porutham Matched ✓"}</span>
                      <p className="text-[11px] opacity-90 mt-0.5">
                        {isTamil 
                          ? "நட்சத்திர பகை இல்லை. இருவரிடையே கருத்து வேறுபாடுகள் குறைவாக இருக்கும்." 
                          : "No star affliction. Ensures peaceful, harmonious life without mutual clash."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/5 p-3 rounded-xl border border-rose-500/20">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">{isTamil ? "வேதை தோஷம் உள்ளது ⚠" : "Vedha Dosham / Star Conflict ⚠"}</span>
                      <p className="text-[11px] opacity-90 mt-0.5">
                        {isTamil 
                          ? "நட்சத்திர பகை உள்ளது. இது தம்பதியருக்குள் சச்சரவுகளை ஏற்படுத்தலாம்." 
                          : "The stars have mutual affliction. May cause frequent disagreements or disputes."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4 italic">
              {isTamil 
                ? "*ஜாதக பொருத்தம் என்பது திருமண பொருத்தங்களில் ஒரு பகுதியாகும். குடும்பப் பெரியவர்களின் ஆலோசனைக்கு உகந்தது."
                : "*Vedic matching (Porutham) is an indicator of compatibility based on moon signs. Final decisions should be made with elder family consulting."}
            </p>
          </div>
        </div>

        {/* Bride vs Groom comparative Profile Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8 relative">
          
          {/* Heart overlay connector in center on desktop */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full border bg-background text-rose-500 items-center justify-center shadow-elevated">
            <Heart className="h-6 w-6 fill-rose-500 animate-pulse" />
          </div>

          {/* Bride Card (Female) */}
          <div className="rounded-3xl border bg-card p-6 shadow-soft flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-bl-2xl">
              {isTamil ? "மணமகள்" : "Bride"}
            </div>
            
            <div className="flex gap-4 items-center mb-6">
              <div className="h-16 w-16 overflow-hidden rounded-2xl bg-muted border shrink-0">
                <img 
                  src={female.photo || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop"} 
                  alt={female.name} 
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">{female.name}</h3>
                <span className="text-xs text-muted-foreground block">{female.display_id}</span>
                <span className="text-xs text-rose-500 font-semibold">{isTamil ? "பெண் ஜாதகம்" : "Female Horoscope"}</span>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4 border-border/40">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground/60" /> {isTamil ? "பிறந்த தேதி" : "Birth Date"}
                </span>
                <span className="font-semibold">{female.dob}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground/60" /> {isTamil ? "பிறந்த நேரம்" : "Birth Time"}
                </span>
                <span className="font-semibold">{female.tob || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">{isTamil ? "ராசி" : "Rasi / Moon Sign"}</span>
                <span className="font-bold text-primary">{isTamil ? female.rasi.ta : female.rasi.en}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">{isTamil ? "நட்சத்திரம் / பாதம்" : "Nakshatra / Pada"}</span>
                <span className="font-bold text-primary">
                  {isTamil ? female.star.ta : female.star.en} ({female.pada} {isTamil ? "ஆம் பாதம்" : "Pada"})
                </span>
              </div>
            </div>
          </div>

          {/* Groom Card (Male) */}
          <div className="rounded-3xl border bg-card p-6 shadow-soft flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-bl-2xl">
              {isTamil ? "மணமகன்" : "Groom"}
            </div>

            <div className="flex gap-4 items-center mb-6">
              <div className="h-16 w-16 overflow-hidden rounded-2xl bg-muted border shrink-0">
                <img 
                  src={male.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop"} 
                  alt={male.name} 
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">{male.name}</h3>
                <span className="text-xs text-muted-foreground block">{male.display_id}</span>
                <span className="text-xs text-blue-500 font-semibold">{isTamil ? "ஆண் ஜாதகம்" : "Male Horoscope"}</span>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4 border-border/40">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground/60" /> {isTamil ? "பிறந்த தேதி" : "Birth Date"}
                </span>
                <span className="font-semibold">{male.dob}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground/60" /> {isTamil ? "பிறந்த நேரம்" : "Birth Time"}
                </span>
                <span className="font-semibold">{male.tob || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">{isTamil ? "ராசி" : "Rasi / Moon Sign"}</span>
                <span className="font-bold text-primary">{isTamil ? male.rasi.ta : male.rasi.en}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">{isTamil ? "நurezza / பாதம்" : "Nakshatra / Pada"}</span>
                <span className="font-bold text-primary">
                  {isTamil ? male.star.ta : male.star.en} ({male.pada} {isTamil ? "ஆம் பாதம்" : "Pada"})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown of 10 Poruthams */}
        <h3 className="font-display text-xl font-bold mb-4 px-1">
          {isTamil ? "பத்து பொருத்தம் விவரங்கள்" : "Detailed Compatibility Breakdown (Dasama Porutham)"}
        </h3>
        
        <div className="space-y-3">
          {poruthamList.map((por, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              key={por.key}
              className="rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/20 bg-muted/20">
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-base text-foreground leading-snug">
                      {isTamil ? por.name_ta : por.name_en}
                    </h4>
                  </div>
                </div>
                
                {/* Score & Status Badge */}
                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${getStatusColor(por.score)}`}>
                    {getStatusIcon(por.score)}
                    <span>{isTamil ? por.status_ta : por.status_en}</span>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1.5 rounded-lg border">
                    {por.score} / 1
                  </span>
                </div>
              </div>

              <div className="p-4 text-sm text-muted-foreground space-y-2 leading-relaxed">
                <p className="border-l-2 border-primary/20 pl-3 font-medium text-foreground">
                  {isTamil ? por.desc_ta : por.desc_en}
                </p>
                {/* Complementary language explanation */}
                <p className="pl-3 opacity-70 text-[13px]">
                  {isTamil ? por.desc_en : por.desc_ta}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
