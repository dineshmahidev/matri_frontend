import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Crown, Loader2, Sparkles, MessageCircle, Eye, Heart, ArrowUpRight, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

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

interface UpgradeContextType {
  openUpgrade: () => void;
  openPremiumPrompt: (title?: string, description?: string) => void;
}

const UpgradeContext = createContext<UpgradeContextType | undefined>(undefined);

export function useUpgrade() {
  const context = useContext(UpgradeContext);
  if (!context) throw new Error('useUpgrade must be used within UpgradeProvider');
  return context;
}

function isPremiumError(err: any): boolean {
  const msg = err?.message || err?.error || "";
  return msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("upgrade") || msg.toLowerCase().includes("premium") || msg.toLowerCase().includes("credit") || msg.toLowerCase().includes("insufficient");
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

interface PremiumConfig {
  title: string;
  description: string;
  isTopup?: boolean;
}

export function UpgradeProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [premiumConfig, setPremiumConfig] = useState<PremiumConfig>({ title: "", description: "" });
  const openUpgrade = useCallback(() => setOpen(true), []);
  const openPremiumPrompt = useCallback((title?: string, description?: string, isTopup?: boolean) => {
    setPremiumConfig({
      title: title || "Upgrade to Unlock This Feature",
      description: description || "This is a premium feature. Upgrade your plan to get unlimited access to all features including messaging, contact views, and more.",
      isTopup,
    });
    setPremiumOpen(true);
  }, []);

  return (
    <UpgradeContext.Provider value={{ openUpgrade, openPremiumPrompt }}>
      {children}
      <UpgradeModal open={open} onClose={() => setOpen(false)} />
      <PremiumPromptModal
        open={premiumOpen}
        title={premiumConfig.title}
        description={premiumConfig.description}
        isTopup={premiumConfig.isTopup}
        onClose={() => setPremiumOpen(false)}
        onUpgrade={() => { setPremiumOpen(false); setOpen(true); }}
      />
    </UpgradeContext.Provider>
  );
}

function PremiumPromptModal({ open, title, description, isTopup, onClose, onUpgrade }: {
  open: boolean; title: string; description: string; isTopup?: boolean; onClose: () => void; onUpgrade: () => void;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full gradient-rose shadow-glow">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <DialogHeader className="pt-4">
            <DialogTitle className="text-xl">Premium Feature</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-1">
              Please log in or create an account to access premium features.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pb-4">
            <Button onClick={() => { onClose(); navigate({ to: '/login', search: { redirect: window.location.pathname } }); }} className="gradient-rose text-white shadow-glow w-full h-12 text-base font-bold">
              <LogIn className="mr-2 h-5 w-5" /> Login
            </Button>
            <Button variant="outline" onClick={() => { onClose(); navigate({ to: '/register' }); }}>
              <UserPlus className="mr-2 h-4 w-4" /> Create Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full gradient-rose shadow-glow">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <DialogHeader className="pt-4">
          <DialogTitle className="text-xl flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" /> {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-1">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pb-4">
          <Button onClick={onUpgrade} className="gradient-rose text-white shadow-glow w-full h-12 text-base font-bold">
            {isTopup ? (
              <><Crown className="mr-2 h-5 w-5" /> Top Up Credits <ArrowUpRight className="ml-1 h-4 w-4" /></>
            ) : (
              <><Crown className="mr-2 h-5 w-5" /> Unlock Premium <ArrowUpRight className="ml-1 h-4 w-4" /></>
            )}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: plans = [], isLoading } = useQuery<PlanType[]>({
    queryKey: ['plans'],
    queryFn: () => api.get<PlanType[]>('/plans'),
    enabled: open && !!user,
    staleTime: 5 * 60 * 1000,
  });

  const handlePayment = async (plan: PlanType) => {
    onClose();
    if (!user) {
      navigate({ to: '/login', search: { redirect: window.location.pathname } });
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded) { toast.error('Razorpay SDK failed to load'); return; }

    try {
      const order: any = await api.post('/payments/create-order', {
        amount: plan.price,
        plan_id: plan.id,
        notes: window.location.origin,
      });

      const rzp = new (window as any).Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'Ungalkalyanam',
        description: `Payment for ${plan.name} Plan`,
        order_id: order.order_id,
        handler: async (res: any) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature,
              plan_id: plan.id,
              notes: window.location.origin,
            });
            toast.success('Payment successful! Your plan has been upgraded.');
            navigate({ to: '/dashboard' });
          } catch {
            toast.error('Payment verification failed.');
          }
        },
        prefill: {
          name: (user as any).full_name || '',
          email: user.email || '',
          contact: (user as any).mobile || '',
        },
        theme: { color: '#e11d48' },
      });
      rzp.open();
    } catch (error: any) {
      const msg = error?.message || error?.error || 'Failed to initiate payment.';
      console.error('[upgrade]', error);
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            {user ? 'Choose Your Plan' : 'Upgrade Required'}
          </DialogTitle>
          <DialogDescription>
            {user
              ? 'Pick the plan that fits your journey.'
              : 'Please login or create an account to upgrade.'}
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="flex flex-col gap-3 py-4">
            <Button onClick={() => { onClose(); navigate({ to: '/login', search: { redirect: window.location.pathname } }); }}>
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Button>
            <Button variant="outline" onClick={() => { onClose(); navigate({ to: '/register' }); }}>
              <UserPlus className="mr-2 h-4 w-4" /> Create Account
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 max-h-[60vh] overflow-y-auto py-2">
            {plans.map((plan) => {
              const isCurrentPlan = user?.profile && Number(user.profile.plan_id) === Number(plan.id);
              return (
                <div 
                  key={plan.id} 
                  className={`relative rounded-2xl border bg-card p-5 transition-all hover:shadow-md ${
                    isCurrentPlan 
                      ? 'border-emerald-500 bg-emerald-500/[0.02] ring-2 ring-emerald-500/20' 
                      : plan.popular 
                        ? 'border-rose-500 ring-2 ring-rose-500/10' 
                        : 'border-slate-200'
                  }`}
                >
                  {isCurrentPlan ? (
                    <span className="absolute -top-2.5 left-4 rounded-full bg-emerald-500 px-3 py-0.5 text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
                      <BadgeCheck className="h-3.5 w-3.5" /> Current Plan
                    </span>
                  ) : plan.popular ? (
                    <span className="absolute -top-2.5 left-4 rounded-full gradient-rose px-3 py-0.5 text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Most Popular
                    </span>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className={`h-5 w-5 ${
                        isCurrentPlan 
                          ? 'text-emerald-500' 
                          : plan.slug === 'platinum' 
                            ? 'text-rose-500' 
                            : plan.slug === 'gold' 
                              ? 'text-amber-500' 
                              : 'text-slate-400'
                      }`} />
                      <div>
                        <p className="font-display font-bold text-slate-800">{plan.name}</p>
                        <p className="text-xs text-muted-foreground font-semibold">₹{plan.price} / {plan.period}</p>
                      </div>
                    </div>
                    {isCurrentPlan ? (
                      <div className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-600">
                        Active
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => handlePayment(plan)} className="shrink-0 bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                        Select <ArrowUpRight className="ml-1 h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] sm:text-xs">
                    <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-muted/65">
                      <Eye className="h-3.5 w-3.5 text-slate-500" />
                      <span className="font-bold text-slate-700">{plan.contact_quota === -1 ? '∞' : (plan.contact_quota ?? 0)}</span>
                      <span className="text-muted-foreground scale-90">Contacts</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-muted/65">
                      <Heart className="h-3.5 w-3.5 text-slate-500" />
                      <span className="font-bold text-slate-700">{plan.credits === -1 ? '∞' : (plan.credits ?? 0)}</span>
                      <span className="text-muted-foreground scale-90">Interests</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-muted/65">
                      <MessageCircle className="h-3.5 w-3.5 text-slate-500" />
                      <span className="font-bold text-slate-700">{plan.message_quota === -1 ? '∞' : (plan.message_quota ?? 0)}</span>
                      <span className="text-muted-foreground scale-90">Chats</span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
