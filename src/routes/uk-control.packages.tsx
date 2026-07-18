import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AdminLayout } from "@/components/layout/AppLayouts";
import { Loader2, Plus, Edit2, EyeOff, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/uk-control/packages')({
  component: PackagesPage,
});

export function PackagesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [activePlan, setActivePlan] = useState<any>(null);
  
  // Form State
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState<number>(0);
  const [validityNumber, setValidityNumber] = useState<number>(1);
  const [validityUnit, setValidityUnit] = useState<string>("Months");
  const [popular, setPopular] = useState<boolean>(false);
  const [featuresText, setFeaturesText] = useState<string>("");
  const [interestExpressLimit, setInterestExpressLimit] = useState<number>(-1);
  const [profileShowLimit, setProfileShowLimit] = useState<number>(-1);
  const [imageUploadLimit, setImageUploadLimit] = useState<number>(-1);
  const [planCredits, setPlanCredits] = useState<number>(0);

  const { data: plans, isLoading: loadingPlans } = useQuery<any[]>({
    queryKey: ["admin-plans"],
    queryFn: () => api.get<any[]>("/admin/plans"),
  });

  const planMutation = useMutation({
    mutationFn: ({ id, data }: { id?: number; data: any }) => 
      id ? api.put(`/admin/plans/${id}`, data) : api.post("/admin/plans", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
      toast.success(activePlan ? "Package updated" : "Package created");
      setPlanModalOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to save package")
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (plan: any) => api.put(`/admin/plans/${plan.id}`, { ...plan, is_active: !plan.is_active }),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] }); 
      toast.success("Package status updated"); 
    },
    onError: (err: any) => toast.error(err.message || "Failed to update package status")
  });

  const handleOpenPlan = (plan?: any) => {
    setActivePlan(plan || null);
    setPlanName(plan?.name || "");
    setPlanPrice(plan?.price || 0);
    
    let period = plan?.period || "";
    if (period === "-1" || period.toLowerCase() === "unlimited") {
      setValidityNumber(1);
      setValidityUnit("Unlimited");
    } else {
      const match = period.match(/^(\d+)\s*(Days?|Months?|Years?)$/i);
      if (match) {
        setValidityNumber(parseInt(match[1], 10));
        let unit = match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase();
        if (!unit.endsWith('s')) unit += 's';
        setValidityUnit(unit);
      } else {
        setValidityNumber(1);
        setValidityUnit("Months");
      }
    }
    setInterestExpressLimit(plan?.interest_express_limit ?? -1);
    setProfileShowLimit(plan?.profile_show_limit ?? -1);
    setImageUploadLimit(plan?.image_upload_limit ?? -1);
    setPlanCredits(plan?.credits ?? 0);
    setPopular(plan?.popular ?? false);
    setFeaturesText(plan?.features ? (Array.isArray(plan.features) ? plan.features.join("\n") : plan.features) : "");
    setPlanModalOpen(true);
  };

  const handleSavePlan = () => {
    if (!planName.trim()) return toast.error("Package name is required");
    const finalPeriod = validityUnit === "Unlimited" ? "-1" : `${validityNumber} ${validityUnit}`;
    planMutation.mutate({
      id: activePlan?.id,
      data: {
        name: planName,
        price: planPrice,
        period: finalPeriod,
        interest_express_limit: interestExpressLimit,
        profile_show_limit: profileShowLimit,
        image_upload_limit: imageUploadLimit,
        credits: planCredits,
        popular: popular,
        features: featuresText.split("\n").map(f => f.trim()).filter(Boolean),
        is_active: activePlan?.is_active ?? true,
      }
    });
  };

  const filteredPlans = plans?.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h1 className="text-xl font-semibold text-slate-800">All Packages</h1>
          <Button 
            variant="outline"
            className="text-primary border-primary/20 hover:bg-primary/10 font-medium"
            onClick={() => handleOpenPlan()}
          >
            <Plus className="w-4 h-4 mr-2" /> Add New
          </Button>
        </div>

        <div className="p-4 border-b border-slate-100">
           <div className="relative max-w-sm">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Search className="h-4 w-4 text-slate-400" />
             </div>
             <Input 
               placeholder="Search packages..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-9 h-10 bg-slate-50 border-slate-200"
             />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider whitespace-nowrap">S.N.</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider whitespace-nowrap">name</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider text-center whitespace-nowrap">Interest Express Limit</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider text-center whitespace-nowrap">Profile Show Limit</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider text-center whitespace-nowrap">Image Upload Limit</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider text-center whitespace-nowrap">Validity Period</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider text-center whitespace-nowrap">Price</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider text-center whitespace-nowrap">Status</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingPlans ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : filteredPlans?.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                    No packages found.
                  </td>
                </tr>
              ) : (
                filteredPlans?.map((plan, index) => (
                  <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5 text-slate-500">{index + 1}</td>
                    <td className="px-6 py-5 font-bold text-slate-700 whitespace-nowrap uppercase">{plan.name}</td>
                    <td className="px-6 py-5 text-center text-slate-600">
                      {plan.interest_express_limit === -1 ? (
                        <span className="px-3 py-1 border border-slate-300 rounded-full text-xs">Unlimited</span>
                      ) : (
                        plan.interest_express_limit
                      )}
                    </td>
                    <td className="px-6 py-5 text-center text-slate-600">
                      {plan.profile_show_limit === -1 ? (
                        <span className="px-3 py-1 border border-slate-300 rounded-full text-xs">Unlimited</span>
                      ) : (
                        plan.profile_show_limit
                      )}
                    </td>
                    <td className="px-6 py-5 text-center text-slate-600">
                      {plan.image_upload_limit === -1 ? (
                        <span className="px-3 py-1 border border-slate-300 rounded-full text-xs">Unlimited</span>
                      ) : (
                        plan.image_upload_limit
                      )}
                    </td>
                    <td className="px-6 py-5 text-center text-slate-600">
                       {plan.period === "-1" || plan.period?.toLowerCase() === "unlimited" ? (
                        <span className="px-3 py-1 border border-slate-300 rounded-full text-xs">Unlimited</span>
                      ) : (
                        plan.period
                      )}
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-slate-700 whitespace-nowrap">
                      {Number(plan.price).toFixed(2)} INR
                    </td>
                    <td className="px-6 py-5 text-center">
                      {plan.is_active ? (
                        <span className="px-3 py-1 border border-emerald-400 text-emerald-500 rounded-full text-xs font-medium">Enabled</span>
                      ) : (
                        <span className="px-3 py-1 border border-orange-400 text-orange-500 rounded-full text-xs font-medium">Disabled</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col gap-2 items-center justify-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 text-primary border-primary/20 hover:bg-primary/10 w-24"
                          onClick={() => handleOpenPlan(plan)}
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={`h-8 w-24 ${
                            plan.is_active 
                              ? "text-rose-500 border-rose-200 hover:bg-rose-50" 
                              : "text-emerald-500 border-emerald-200 hover:bg-emerald-50"
                          }`}
                          onClick={() => {
                            if (confirm(`Are you sure you want to ${plan.is_active ? 'disable' : 'enable'} ${plan.name}?`)) {
                              toggleStatusMutation.mutate(plan);
                            }
                          }}
                        >
                          {plan.is_active ? (
                            <><EyeOff className="w-3.5 h-3.5 mr-1" /> Disable</>
                          ) : (
                            <><Eye className="w-3.5 h-3.5 mr-1" /> Enable</>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Package Form Dialog */}
      <Dialog open={planModalOpen} onOpenChange={setPlanModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{activePlan ? "Edit Package" : "Create New Package"}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold text-slate-700">Package Name</Label>
                <Input className="h-10 border-slate-200" placeholder="e.g., Premium Plan" value={planName} onChange={e => setPlanName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Price (INR)</Label>
                <Input className="h-10 border-slate-200" type="number" value={planPrice} onChange={e => setPlanPrice(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Validity Period</Label>
                <div className="flex gap-2">
                  {validityUnit !== "Unlimited" && (
                    <Input 
                      className="h-10 border-slate-200 w-24" 
                      type="number" 
                      min="1"
                      value={validityNumber} 
                      onChange={e => setValidityNumber(Number(e.target.value))} 
                    />
                  )}
                  <select 
                    className="h-10 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={validityUnit}
                    onChange={e => setValidityUnit(e.target.value)}
                  >
                    <option value="Days">Days</option>
                    <option value="Months">Months</option>
                    <option value="Years">Years</option>
                    <option value="Unlimited">Unlimited (-1)</option>
                  </select>
                </div>
              </div>
              {/* Interest Express Limit */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Interest Express Limit</Label>
                <div className="flex gap-2">
                  <select
                    className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 flex-1"
                    value={interestExpressLimit === -1 ? "unlimited" : "custom"}
                    onChange={(e) => setInterestExpressLimit(e.target.value === "unlimited" ? -1 : 50)}
                  >
                    <option value="unlimited">Unlimited (-1)</option>
                    <option value="custom">Custom</option>
                  </select>
                  {interestExpressLimit !== -1 && (
                    <Input
                      type="number"
                      className="h-10 border-slate-200 w-24"
                      min="0"
                      value={interestExpressLimit}
                      onChange={(e) => setInterestExpressLimit(Number(e.target.value))}
                    />
                  )}
                </div>
              </div>

              {/* Profile Show Limit */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Profile Show Limit</Label>
                <div className="flex gap-2">
                  <select
                    className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 flex-1"
                    value={profileShowLimit === -1 ? "unlimited" : "custom"}
                    onChange={(e) => setProfileShowLimit(e.target.value === "unlimited" ? -1 : 100)}
                  >
                    <option value="unlimited">Unlimited (-1)</option>
                    <option value="custom">Custom</option>
                  </select>
                  {profileShowLimit !== -1 && (
                    <Input
                      type="number"
                      className="h-10 border-slate-200 w-24"
                      min="0"
                      value={profileShowLimit}
                      onChange={(e) => setProfileShowLimit(Number(e.target.value))}
                    />
                  )}
                </div>
              </div>

              {/* Image Upload Limit */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold text-slate-700">Image Upload Limit</Label>
                <div className="flex gap-2">
                  <select
                    className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 flex-1"
                    value={imageUploadLimit === -1 ? "unlimited" : "custom"}
                    onChange={(e) => setImageUploadLimit(e.target.value === "unlimited" ? -1 : 5)}
                  >
                    <option value="unlimited">Unlimited (-1)</option>
                    <option value="custom">Custom</option>
                  </select>
                  {imageUploadLimit !== -1 && (
                    <Input
                      type="number"
                      className="h-10 border-slate-200 w-24"
                      min="0"
                      value={imageUploadLimit}
                      onChange={(e) => setImageUploadLimit(Number(e.target.value))}
                    />
                  )}
                </div>
              </div>

              {/* Contact View Credits */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold text-slate-700">Contact View Credits</Label>
                <Input className="h-10 border-slate-200" type="number" placeholder="e.g. 50" value={planCredits} onChange={e => setPlanCredits(Number(e.target.value))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold text-slate-700">Features (One per line)</Label>
                <textarea 
                  className="w-full min-h-[100px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. Chat with matches&#10;View contact details"
                  value={featuresText}
                  onChange={e => setFeaturesText(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2 flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="popular-checkbox"
                  checked={popular}
                  onChange={e => setPopular(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary/20"
                />
                <Label htmlFor="popular-checkbox" className="text-sm font-semibold text-slate-700 cursor-pointer">Mark as Popular Package</Label>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPlanModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePlan} disabled={planMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {planMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {activePlan ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
