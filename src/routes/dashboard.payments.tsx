import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/AppLayouts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Loader2, Eye, X, CheckCircle, Clock, AlertCircle, Ban } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/dashboard/payments")({
  head: () => ({ meta: [{ title: "Payments — Ungalkalyanam" }] }),
  component: Payments,
});

const statusIcon: Record<string, any> = {
  paid: CheckCircle,
  pending: Clock,
  failed: AlertCircle,
  refunded: Ban,
};

const statusColor: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-600",
  pending: "bg-amber-500/10 text-amber-600",
  failed: "bg-red-500/10 text-red-600",
  refunded: "bg-slate-500/10 text-slate-600",
};

function ReceiptModal({ payment, open, onClose }: { payment: any; open: boolean; onClose: () => void }) {
  const { language } = useLanguage();

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-lg">Receipt — {payment.invoice_id}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-semibold text-foreground">Ungalkalyanam</span>
              <span className="text-xs text-muted-foreground">{payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : (payment.created_at ? new Date(payment.created_at).toLocaleDateString() : "—")}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Invoice No</p>
                <p className="font-medium">{payment.invoice_id || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Razorpay Payment ID</p>
                <p className="font-mono text-xs">{payment.razorpay_payment_id || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Razorpay Order ID</p>
                <p className="font-mono text-xs">{payment.razorpay_order_id || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColor[payment.status] || "bg-muted text-muted-foreground"}`}>
                  {payment.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Plan</p>
                <p className="font-medium">{payment.plan_label || payment.plan_id || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="font-bold text-lg">₹{Number(payment.amount || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
          {payment.notes && (
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold">Notes:</span> {payment.notes}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Payments() {
  const { language } = useLanguage();
  const { data, isLoading } = useQuery<any>({
    queryKey: ["my-payments"],
    queryFn: () => api.get("/payments"),
  });
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const payments = data?.data || [];

  const openReceipt = (p: any) => {
    setSelectedPayment(p);
    setReceiptOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-3xl border bg-card shadow-soft">
          <div className="border-b p-4 sm:p-6">
            <h2 className="font-display text-xl font-semibold">Payment history</h2>
          </div>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : payments.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">No payments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[650px]">
                <thead className="bg-muted/40 text-left">
                  <tr>
                    <th className="p-3 sm:p-4">Invoice</th>
                    <th className="p-3 sm:p-4">Date</th>
                    <th className="p-3 sm:p-4">Plan</th>
                    <th className="p-3 sm:p-4">Amount</th>
                    <th className="p-3 sm:p-4">Status</th>
                    <th className="p-3 sm:p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map((p: any) => {
                    const SIcon = statusIcon[p.status] || CheckCircle;
                    return (
                      <tr key={p.id} className="hover:bg-muted/40">
                        <td className="p-3 sm:p-4 font-medium">{p.invoice_id || `#${p.id}`}</td>
                        <td className="p-3 sm:p-4 text-muted-foreground">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="p-3 sm:p-4">{p.plan_label || p.plan_id || "—"}</td>
                        <td className="p-3 sm:p-4 font-semibold">₹{Number(p.amount || 0).toLocaleString()}</td>
                        <td className="p-3 sm:p-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColor[p.status] || "bg-muted text-muted-foreground"}`}>
                            <SIcon className="h-3 w-3" />
                            {p.status || "paid"}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4">
                          <Button variant="ghost" size="sm" onClick={() => openReceipt(p)}>
                            <Eye className="mr-1 h-4 w-4" /> Receipt
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ReceiptModal payment={selectedPayment} open={receiptOpen} onClose={() => { setReceiptOpen(false); setSelectedPayment(null); }} />
    </DashboardLayout>
  );
}
