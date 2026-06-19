import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/AppLayouts";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/dashboard/payments")({
  head: () => ({ meta: [{ title: "Payments — Ungalkalyanam" }] }),
  component: Payments,
});

function Payments() {
  const { data, isLoading } = useQuery<any>({
    queryKey: ["my-payments"],
    queryFn: () => api.get("/payments"),
  });

  const payments = data?.data || [];

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
              <table className="w-full text-sm min-w-[600px]">
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
                  {payments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-muted/40">
                      <td className="p-3 sm:p-4 font-medium">#{p.id}</td>
                      <td className="p-3 sm:p-4 text-muted-foreground">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="p-3 sm:p-4">{p.plan_id || p.plan || "—"}</td>
                      <td className="p-3 sm:p-4 font-semibold">₹{Number(p.amount || 0).toLocaleString()}</td>
                      <td className="p-3 sm:p-4">
                        <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success capitalize">
                          {p.status || "paid"}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <Button variant="ghost" size="sm" disabled>
                          <Download className="mr-1 h-4 w-4" /> Invoice
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
