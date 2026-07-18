import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/AppLayouts";
import {
  HelpCircle, ChevronLeft, Phone, Mail, TicketCheck,
  ChevronDown, ChevronUp, Send, Loader2
} from "lucide-react";
import { useLanguage } from "@/lib/language";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard/support")({
  head: () => ({ meta: [{ title: "Help & Support — Ungalkalyanam" }] }),
  component: HelpSupport,
});

function FaqItem({ faq, isTamil }: { faq: { question: string; question_ta: string; answer: string; answer_ta: string }; isTamil: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/40 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-4 text-left gap-3 cursor-pointer"
      >
        <span className="text-sm font-semibold text-foreground leading-snug">{isTamil ? faq.question_ta : faq.question}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground pb-4 leading-relaxed">{isTamil ? faq.answer_ta : faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HelpSupport() {
  const { language } = useLanguage();
  const isTamil = language === "ta";
  const navigate = useNavigate();

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => api.get("/settings"),
  });

  const { data: faqsData } = useQuery({
    queryKey: ["faqs"],
    queryFn: () => api.get("/faqs"),
  });
  const faqs = Array.isArray(faqsData) ? faqsData : faqsData?.data ?? [];

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error(isTamil ? "தலைப்பு மற்றும் செய்தி தேவை" : "Subject and message are required");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/support-tickets", { category, subject, message });
      toast.success(isTamil ? "கோரிக்கை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!" : "Support ticket submitted successfully!");
      navigate({ to: "/dashboard/support-tickets" });
    } catch {
      toast.error(isTamil ? "சமர்ப்பிக்க தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்." : "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 pb-10 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-display text-xl font-bold">{isTamil ? "உதவி & ஆதரவு" : "Help & Support"}</h1>
              <p className="text-xs text-muted-foreground">{isTamil ? "எங்களுக்கு உங்கள் கவலைகளை தெரிவிக்கவும்" : "We're here to help you"}</p>
            </div>
          </div>
          <Link to="/dashboard/support-tickets" className="rounded-xl border px-3 py-1.5 text-xs font-semibold text-primary hover:bg-muted/40">
            {isTamil ? "எனது கோரிக்கைகள்" : "My Tickets"}
          </Link>
        </div>

        {/* Contact Quick Links */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 gap-3">
          <a href={`tel:${settings?.phone || '+919999999999'}`} className="flex flex-col items-center gap-2 p-4 rounded-2xl border bg-card shadow-soft hover:bg-muted/40 transition-colors text-center overflow-hidden">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-green-500/10 text-green-600 shrink-0">
              <Phone className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold">{isTamil ? "அழைக்கவும்" : "Call Us"}</p>
            <p className="text-xs text-muted-foreground truncate w-full text-center">{settings?.phone || '+91 9597558432'}</p>
          </a>
          <a href={`mailto:${settings?.email || 'ungalkalyanam.in@gmail.com'}`} className="flex flex-col items-center gap-2 p-4 rounded-2xl border bg-card shadow-soft hover:bg-muted/40 transition-colors text-center overflow-hidden">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold">{isTamil ? "மின்னஞ்சல்" : "Email Us"}</p>
            <p className="text-xs text-muted-foreground truncate w-full text-center">{settings?.email || 'ungalkalyanam.in@gmail.com'}</p>
          </a>
        </motion.div>

        {/* FAQ Section */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="h-5 w-5 text-amber-500" />
            <h2 className="font-display text-base font-bold">{isTamil ? "அடிக்கடி கேட்கப்படும் கேள்விகள்" : "Frequently Asked Questions"}</h2>
          </div>
          <div>
            {faqs.length > 0 ? faqs.map((faq: any, i: number) => (
              <FaqItem key={faq.id || i} faq={faq} isTamil={isTamil} />
            )) : <p className="text-sm text-muted-foreground py-4 text-center">{isTamil ? "கேள்விகள் எதுவும் இல்லை" : "No FAQs available"}</p>}
          </div>
        </motion.div>

        {/* Support Ticket Form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-3xl border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-5">
            <TicketCheck className="h-5 w-5 text-purple-500" />
            <div>
              <h2 className="font-display text-base font-bold">{isTamil ? "ஆதரவு கோரிக்கை" : "Raise a Support Ticket"}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{isTamil ? "24 மணி நேரத்தில் பதில் பெறுவீர்கள்" : "We'll respond within 24 hours"}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  {isTamil ? "வகை" : "Category"}
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-muted/40 px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="general">{isTamil ? "பொதுவான விசாரணை" : "General Inquiry"}</option>
                  <option value="payment">{isTamil ? "கட்டணம் / பரிமாற்றம்" : "Payment / Transaction"}</option>
                  <option value="account">{isTamil ? "கணக்கு சிக்கல்" : "Account Issue"}</option>
                  <option value="profile">{isTamil ? "சுயவிவர சிக்கல்" : "Profile Issue"}</option>
                  <option value="abuse">{isTamil ? "துஷ்பிரயோகம் / தொல்லை" : "Abuse / Harassment"}</option>
                  <option value="delete">{isTamil ? "கணக்கு நீக்கம்" : "Account Deletion"}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  {isTamil ? "தலைப்பு" : "Subject"}
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder={isTamil ? "உங்கள் சிக்கலை சுருக்கமாக விவரிக்கவும்" : "Briefly describe your issue"}
                  className="w-full rounded-xl border border-border/60 bg-muted/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  {isTamil ? "விவரமான செய்தி" : "Detailed Message"}
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  placeholder={isTamil ? "உங்கள் சிக்கலை விரிவாக விவரிக்கவும்..." : "Describe your issue in detail..."}
                  className="w-full rounded-xl border border-border/60 bg-muted/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl gradient-rose text-white font-bold text-sm shadow-soft transition-all hover:opacity-90 active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> {isTamil ? "சமர்ப்பிக்கிறது..." : "Submitting..."}</>
                ) : (
                  <><Send className="h-4 w-4" /> {isTamil ? "கோரிக்கை அனுப்பவும்" : "Submit Ticket"}</>
                )}
              </button>
            </form>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
