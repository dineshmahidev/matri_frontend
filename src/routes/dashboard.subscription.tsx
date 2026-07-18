import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/AppLayouts";
import {
  Crown, Check, Sparkles, ChevronLeft, CreditCard,
  Calendar, Zap, MessageCircle, Eye, Heart, Download, Loader2, ArrowUpRight
} from "lucide-react";
import { useLanguage } from "@/lib/language";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/subscription")({
  head: () => ({ meta: [{ title: "Manage Subscription — Ungalkalyanam" }] }),
  component: ManageSubscription,
});

type PlanType = {
  id: string | number;
  slug: string;
  name: string;
  price: number;
  period: string;
  popular: boolean | number;
  features: string[];
  contact_quota: number;
  message_quota: number;
  credits?: number;
};

function ManageSubscription() {
  const { language } = useLanguage();
  const isTamil = language === "ta";
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: profileRes, isLoading: profileLoading } = useQuery<any>({
    queryKey: ["my-profile"],
    queryFn: () => api.get<any>("/profile"),
  });
  const profile = profileRes?.data;

  const { data: plans = [], isLoading: plansLoading } = useQuery<PlanType[]>({
    queryKey: ["plans"],
    queryFn: () => api.get<PlanType[]>("/plans"),
  });

  const isLoading = profileLoading || plansLoading;

  const planColor = (slug: string) => {
    if (slug === "platinum") return "from-rose-500 to-pink-600";
    if (slug === "gold") return "from-amber-400 to-orange-500";
    return "from-slate-400 to-slate-600";
  };

  const planIcon = (slug: string) => {
    if (slug === "platinum") return "text-rose-500";
    if (slug === "gold") return "text-amber-500";
    return "text-slate-400";
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (plan: PlanType) => {
    if (!user) {
      toast.error("Please login to purchase a plan.");
      navigate({ to: "/login", search: { redirect: "/dashboard/subscription" } });
      return;
    }

    const res = await loadRazorpayScript();
    if (!res) {
      toast.error("Razorpay SDK failed to load. Are you offline?");
      return;
    }

    try {
      // 1. Create Order on Backend
      const order = await api.post("/payments/create-order", {
        amount: plan.price,
        plan_id: plan.id,
        notes: window.location.origin,
      });

      // 2. Initialize Razorpay Checkout
      const options = {
        key: order.key, // Enter the Key ID generated from the Dashboard
        amount: order.amount,
        currency: order.currency,
        name: "Ungalkalyanam",
        description: `Payment for ${plan.name} Plan`,
        order_id: order.order_id,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment on Backend
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan_id: plan.id,
              notes: window.location.origin,
            });
            toast.success("Payment successful! Your plan has been upgraded.");
            navigate({ to: "/dashboard" });
          } catch (err) {
            toast.error("Payment verification failed.");
          }
        },
        prefill: {
          name: user.full_name || "",
          email: user.email || "",
          contact: user.mobile || "",
        },
        theme: {
          color: "#e11d48", // rose-600
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      const msg = error?.message || error?.error || "Failed to initiate payment. Please try again.";
      console.error("[subscription] create-order error:", error);
      toast.error(msg);
    }
  };

  const creditsChat = profile?.message_quota ?? 0;
  const creditsContact = profile?.contact_quota ?? 0;
  const creditsInterest = profile?.planCredits || profile?.credits || 0;
  const currentPlanName = profile?.planName || (profile?.premium ? "Premium" : "Free Plan");
  const isPremium = profile?.premium;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 pb-10 animate-fade-in">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold">{isTamil ? "சந்தா மேலாண்மை" : "Manage Subscription"}</h1>
            <p className="text-xs text-muted-foreground">{isTamil ? "உங்கள் திட்டம் மற்றும் கிரெடிட்களை நிர்வகிக்கவும்" : "Manage your plan and credits"}</p>
          </div>
        </div>

        {/* Current Plan Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${isPremium ? "from-amber-400 to-rose-500" : "from-slate-500 to-slate-700"} p-6 text-white shadow-elevated`}
        >
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -right-4 h-24 w-24 rounded-full bg-white/5" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">{isTamil ? "தற்போதைய திட்டம்" : "Current Plan"}</span>
            </div>
            <h2 className="font-display text-3xl font-black mt-1">{currentPlanName}</h2>
            {isPremium ? (
              <p className="text-sm mt-2 opacity-80">{isTamil ? "அனைத்து பிரீமியம் அம்சங்களும் செயல்படுகின்றன" : "All premium features are active"}</p>
            ) : (
              <div className="text-sm mt-2 opacity-80 space-y-0.5">
                <p>{isTamil ? "மேம்படுத்தி அதிக பொருத்தங்களை பெறுங்கள்" : "Upgrade to unlock more matches"}</p>
                <p>{isTamil ? "3 புகைப்படங்களை மட்டுமே பதிவேற்ற முடியும்" : "Upload limit: 3 photos"}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Credits Overview */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-3xl border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="h-5 w-5 text-amber-500" />
            <h2 className="font-display text-base font-bold">{isTamil ? "மீதமுள்ள கிரெடிட்கள்" : "Remaining Credits"}</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-muted/50 border border-border/40">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <span className="font-display text-2xl font-black text-foreground">{creditsChat}</span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{isTamil ? "செய்திகள்" : "Chats"}</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-muted/50 border border-border/40">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <span className="font-display text-2xl font-black text-foreground">{creditsContact}</span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{isTamil ? "தொடர்புகள்" : "Contacts"}</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-muted/50 border border-border/40">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <Heart className="h-5 w-5 text-rose-500" />
              </div>
              <span className="font-display text-2xl font-black text-foreground">{creditsInterest}</span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{isTamil ? "ஆர்வங்கள்" : "Interests"}</span>
            </div>
          </div>
        </motion.div>

        {/* Available Plans */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="font-display text-base font-bold mb-3 px-1">{isTamil ? "கிடைக்கும் திட்டங்கள்" : "Available Plans"}</h2>
          <div className="space-y-3">
            {plans.map((plan, i) => {
              const isCurrent = currentPlanName.toLowerCase().includes(plan.name.toLowerCase());
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className={`relative rounded-3xl border bg-card p-5 shadow-soft transition-all ${plan.popular ? "ring-2 ring-primary" : ""} ${isCurrent ? "ring-2 ring-emerald-500" : ""}`}
                >
                  {plan.popular && !isCurrent && (
                    <span className="absolute -top-3 left-5 rounded-full gradient-rose px-3 py-1 text-[10px] font-bold text-white shadow-glow">
                      <Sparkles className="mr-1 inline h-2.5 w-2.5" />{isTamil ? "பிரபலமானது" : "Most Popular"}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="absolute -top-3 left-5 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold text-white shadow-sm">
                      ✓ {isTamil ? "தற்போதைய திட்டம்" : "Current Plan"}
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className={`h-5 w-5 ${planIcon(plan.slug)}`} />
                      <div>
                        <p className="font-display text-base font-bold">{plan.name}</p>
                        <p className="text-xs text-muted-foreground">₹{plan.price} / {plan.period}</p>
                      </div>
                    </div>
                    {isCurrent ? (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-full">{isTamil ? "செயலில்" : "Active"}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePayment(plan)}
                        className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                      >
                        {isTamil ? "தேர்ந்தெடு" : "Select"} <ArrowUpRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-muted/50">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-bold">{plan.contact_quota ?? 0}</span>
                      <span className="text-muted-foreground">{isTamil ? "தொடர்புகள்" : "Contacts"}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-muted/50">
                      <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-bold">{plan.credits ?? 0}</span>
                      <span className="text-muted-foreground">{isTamil ? "ஆர்வங்கள்" : "Interests"}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-muted/50">
                      <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-bold">{plan.message_quota ?? 0}</span>
                      <span className="text-muted-foreground">{isTamil ? "செய்திகள்" : "Chats"}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Payment History link */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl border bg-card shadow-soft overflow-hidden">
          <Link to="/dashboard/payments" className="flex items-center justify-between p-5 hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">{isTamil ? "கட்டண வரலாறு" : "Payment History"}</p>
                <p className="text-xs text-muted-foreground">{isTamil ? "கடந்த பரிவர்த்தனைகளை பார்க்கவும்" : "View past transactions & invoices"}</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
