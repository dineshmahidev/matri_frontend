import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles, Loader2, MessageCircle, Eye, Heart, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "Pricing — Ungalkalyanam" }, { name: "description", content: "Simple plans for every stage of your journey." }] }),
  component: Pricing,
});

type PlanType = {
  id: string | number;
  slug: string;
  name: string;
  price: number;
  period: string;
  color?: string;
  popular: boolean | number;
  features: string[];
  contact_quota: number;
  message_quota: number;
  credits?: number;
};

function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: plans = [], isLoading } = useQuery<PlanType[]>({
    queryKey: ["plans"],
    queryFn: () => api.get<PlanType[]>("/plans"),
  });

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
      navigate({ to: "/login", search: { redirect: "/pricing" } });
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
      const msg = typeof error === "string" ? error : error?.message || error?.error || "Failed to initiate payment. Please check Razorpay configuration in admin.";
      console.error("[payment] create-order error:", error);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-medium text-primary">Membership plans</p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Pick the plan that fits your journey.</h1>
          <p className="mt-4 text-muted-foreground">No hidden fees. Cancel anytime.</p>
        </div>
        
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-14 grid gap-6 lg:grid-cols-4">
            {/* Free Plan */}
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="relative flex flex-col rounded-3xl border border-dashed bg-card/50 p-8 shadow-soft">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-display text-2xl font-bold">Free</h3>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold">₹0</span>
                <span className="text-sm text-muted-foreground">/ forever</span>
              </div>
              <div className="mt-6 flex-1 space-y-4">
                <ul className="space-y-2 text-sm text-left">
                  <li className="flex items-start gap-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Free tier includes:</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"><Check className="h-3 w-3" /></span>Create your profile</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"><Check className="h-3 w-3" /></span>Upload up to 3 photos</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"><Check className="h-3 w-3" /></span>Browse matches</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"><Check className="h-3 w-3" /></span>Receive interests</li>
                </ul>
                <div className="border-t pt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><Eye className="h-4 w-4" /> Contact views</span>
                    <span className="font-bold">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><MessageCircle className="h-4 w-4" /> Chat sends</span>
                    <span className="font-bold">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><Heart className="h-4 w-4" /> Interest sends</span>
                    <span className="font-bold">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><Brain className="h-4 w-4" /> AI Porutham</span>
                    <span className="font-bold">—</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground">Photos</span>
                    <span className="font-bold">3</span>
                  </div>
                </div>
              </div>
              <Button disabled className="mt-8" variant="outline">Current Plan</Button>
            </motion.div>
            {plans.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className={`relative flex flex-col rounded-3xl border bg-card p-8 shadow-soft ${p.popular ? "ring-2 ring-primary shadow-elevated" : ""}`}>
                {p.popular ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-rose px-3 py-1 text-xs font-semibold text-white shadow-glow">
                    <Sparkles className="mr-1 inline h-3 w-3" /> Most popular
                  </span>
                ) : null}
                <div className="flex items-center gap-2">
                  <Crown className={`h-5 w-5 ${p.slug === "platinum" ? "text-rose-500" : p.slug === "gold" ? "text-amber-500" : "text-muted-foreground"}`} />
                  <h3 className="font-display text-2xl font-bold">{p.name}</h3>
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-bold">₹{p.price}</span>
                  <span className="text-sm text-muted-foreground">/ {p.period}</span>
                </div>
                <div className="mt-6 flex-1 space-y-4">
                  {p.features && p.features.length > 0 && (
                    <ul className="space-y-2 text-sm text-left">
                      <li className="flex items-start gap-2 font-semibold text-primary text-xs uppercase tracking-wide">All plans include:</li>
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Check className="h-3 w-3" /></span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="border-t pt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-muted-foreground"><Eye className="h-4 w-4" /> Contact views</span>
                      <span className="font-bold">{p.contact_quota ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-muted-foreground"><MessageCircle className="h-4 w-4" /> Chat sends</span>
                      <span className="font-bold">{p.message_quota ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-muted-foreground"><Heart className="h-4 w-4" /> Interest sends</span>
                      <span className="font-bold">{p.credits ?? "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-muted-foreground"><Brain className="h-4 w-4" /> AI Porutham</span>
                      <span className="font-bold">{p.features?.includes("AI Porutham matching") ? "Unlimited" : "—"}</span>
                    </div>
                  </div>
                </div>
                <Button onClick={() => handlePayment(p)} className={`mt-8 ${p.popular ? "gradient-rose text-white shadow-glow" : ""}`} variant={p.popular ? "default" : "outline"}>
                  Choose {p.name}
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
