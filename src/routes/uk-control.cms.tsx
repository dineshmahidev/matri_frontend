import { useState, useRef, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AppLayouts";
import { Button } from "@/components/ui/button";
import { 
  FileText, HelpCircle, Heart, Plus, Edit, Trash2, Loader2, Calendar, MapPin, 
  BookOpen, Clock, Upload, Type, Bold, Image as ImageIcon, Crown, Star, Check, X,
  ShieldAlert, Bell, Layout, Lock, Unlock, Eye, EyeOff
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/uk-control/cms")({
  head: () => ({ meta: [{ title: "CMS — Admin" }] }),
  component: AdminCms,
});

function AdminCms() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pages");
  const [settingsForm, setSettingsForm] = useState<any>({});
  const [pgUnlockPassword, setPgUnlockPassword] = useState("");
  const [pgUnlocked, setPgUnlocked] = useState(false);
  const [pgShowUnlock, setPgShowUnlock] = useState(false);
  const [pgShowSecret, setPgShowSecret] = useState(false);

  // --- Pages State ---
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [activePage, setActivePage] = useState<any>(null);
  const [pageTitle, setPageTitle] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [pageBody, setPageBody] = useState("");

  // --- FAQs State ---
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<any>(null);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqSortOrder, setFaqSortOrder] = useState<number | "">("");

  // --- Success Stories State ---
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [activeStory, setActiveStory] = useState<any>(null);
  const [storyCouple, setStoryCouple] = useState("");
  const [storyDate, setStoryDate] = useState("");
  const [storyCity, setStoryCity] = useState("");
  const [storyPhoto, setStoryPhoto] = useState("");
  const [storyQuote, setStoryQuote] = useState("");

  // --- Blogs State ---
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [activeBlog, setActiveBlog] = useState<any>(null);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogSlug, setBlogSlug] = useState("");
  const [blogCategory, setBlogCategory] = useState("");
  const [blogReadTime, setBlogReadTime] = useState("");
  const [blogPublishedAt, setBlogPublishedAt] = useState("");
  const [blogImage, setBlogImage] = useState("");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogBody, setBlogBody] = useState("");
  const blogImageInputRef = useRef<HTMLInputElement>(null);
  const storyImageInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const popupImageInputRef = useRef<HTMLInputElement>(null);

  // --- Plans State ---
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState<number>(0);
  const [planPeriod, setPlanPeriod] = useState("Month");
  const [planColor, setPlanColor] = useState("rose");
  const [planPopular, setPlanPopular] = useState(false);
  const [planFeatures, setPlanFeatures] = useState<string[]>([]);
  const [planContactQuota, setPlanContactQuota] = useState<number>(0);
  const [planMessageQuota, setPlanMessageQuota] = useState<number>(0);
  const [planCredits, setPlanCredits] = useState<number>(0);

  // --- Maintenance State ---
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceHeadline, setMaintenanceHeadline] = useState("");
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [maintenanceTimer, setMaintenanceTimer] = useState("");

  // --- Ticker State ---
  const [tickerEnabled, setTickerEnabled] = useState(false);
  const [tickerText, setTickerText] = useState("");

  // --- Popup State ---
  const [popupEnabled, setPopupEnabled] = useState(false);
  const [popupImage, setPopupImage] = useState("");
  const [popupContent, setPopupContent] = useState("");
  const [popupLink, setPopupLink] = useState("");
  const [popupLinkText, setPopupLinkText] = useState("");

  // --- Footer State ---
  const [footerDescriptionEn, setFooterDescriptionEn] = useState("");
  const [footerDescriptionTa, setFooterDescriptionTa] = useState("");
  const [footerPhone, setFooterPhone] = useState("");
  const [footerEmail, setFooterEmail] = useState("");
  const [footerAddressEn, setFooterAddressEn] = useState("");
  const [footerAddressTa, setFooterAddressTa] = useState("");
  const [footerTiming, setFooterTiming] = useState("");
  const [footerCopyright, setFooterCopyright] = useState("");

  // Queries
  const { data: pages, isLoading: loadingPages } = useQuery<any[]>({
    queryKey: ["admin-pages"],
    queryFn: () => api.get<any[]>("/admin/pages"),
    enabled: activeTab === "pages",
  });
  const { data: faqs, isLoading: loadingFaqs } = useQuery<any[]>({
    queryKey: ["admin-faqs"],
    queryFn: () => api.get<any[]>("/admin/faqs"),
    enabled: activeTab === "faqs",
  });
  const { data: stories, isLoading: loadingStories } = useQuery<any[]>({
    queryKey: ["admin-stories"],
    queryFn: () => api.get<any[]>("/admin/success-stories"),
    enabled: activeTab === "stories",
  });
  const { data: blogs, isLoading: loadingBlogs } = useQuery<any[]>({
    queryKey: ["admin-blogs"],
    queryFn: () => api.get<any[]>("/admin/blog"),
    enabled: activeTab === "blogs",
  });
  const { data: plans, isLoading: loadingPlans } = useQuery<any[]>({
    queryKey: ["admin-plans"],
    queryFn: () => api.get<any[]>("/admin/plans"),
    enabled: activeTab === "plans",
  });
  const { data: settingsData, isLoading: loadingSettings } = useQuery<any>({ queryKey: ["admin-settings"], queryFn: () => api.get<any>("/admin/settings"), enabled: ["settings", "maintenance", "ticker", "popup", "footer"].includes(activeTab) });

  
  // Update Settings Form when loaded
  useEffect(() => {
    if (settingsData) {
      setSettingsForm(settingsData);
      setMaintenanceMode(!!settingsData.maintenance_mode);
      setMaintenanceHeadline(settingsData.maintenance_headline || "");
      setMaintenanceMessage(settingsData.maintenance_message || "");
      setMaintenanceTimer(settingsData.maintenance_timer || "");
      setTickerEnabled(!!settingsData.ticker_enabled);
      setTickerText(settingsData.ticker_text || "");
      setPopupEnabled(!!settingsData.popup_enabled);
      setPopupImage(settingsData.popup_image || "");
      setPopupContent(settingsData.popup_content || "");
      setPopupLink(settingsData.popup_link || "");
      setPopupLinkText(settingsData.popup_link_text || "");
      setFooterDescriptionEn(settingsData.footer_description_en || "");
      setFooterDescriptionTa(settingsData.footer_description_ta || "");
      setFooterPhone(settingsData.footer_phone || "");
      setFooterEmail(settingsData.footer_email || "");
      setFooterAddressEn(settingsData.footer_address_en || "");
      setFooterAddressTa(settingsData.footer_address_ta || "");
      setFooterTiming(settingsData.footer_timing || "");
      setFooterCopyright(settingsData.footer_copyright || "");
    }
  }, [settingsData]);

  const settingsMutation = useMutation({
    mutationFn: (data: any) => api.post("/admin/settings", { settings: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Settings updated successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update settings")
  });

  const pgVerifyMutation = useMutation({
    mutationFn: (password: string) => api.post("/admin/verify-password", { password }),
    onSuccess: (res: any) => {
      if (res.verified) {
        setPgUnlocked(true);
        toast.success("Payment settings unlocked");
      } else {
        toast.error(res.message || "Incorrect password");
      }
    },
    onError: (err: any) => toast.error(err.message || "Incorrect password"),
  });

  const handlePgUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pgUnlockPassword) return;
    pgVerifyMutation.mutate(pgUnlockPassword);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    settingsMutation.mutate(settingsForm);
  };

  // Upload Mutations
  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => api.post("/admin/upload", formData),
    onSuccess: (data: any) => {
      setBlogImage(data.data.url);
      toast.success("Image uploaded successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to upload image")
  });
  const storyUploadMutation = useMutation({
    mutationFn: (formData: FormData) => api.post("/admin/upload", formData),
    onSuccess: (data: any) => {
      setStoryPhoto(data.data.url);
      toast.success("Story photo uploaded");
    },
    onError: (err: any) => toast.error(err.message || "Upload failed")
  });
  const heroUploadMutation = useMutation({
    mutationFn: (formData: FormData) => api.post("/admin/upload", formData),
    onSuccess: (data: any) => {
      setSettingsForm({ ...settingsForm, hero_background: data.data.url });
      toast.success("Hero image uploaded");
    },
    onError: (err: any) => toast.error(err.message || "Upload failed")
  });

  // Pages Mutations
  const pageMutation = useMutation({
    mutationFn: ({ id, data }: { id?: number; data: any }) => id ? api.put(`/admin/pages/${id}`, data) : api.post("/admin/pages", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      toast.success(activePage ? "Page updated" : "Page created");
      setPageModalOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to save page")
  });
  const deletePageMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/pages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      toast.success("Page deleted");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete page")
  });

  // FAQ Mutations
  const faqMutation = useMutation({
    mutationFn: ({ id, data }: { id?: number; data: any }) => id ? api.put(`/admin/faqs/${id}`, data) : api.post("/admin/faqs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      toast.success(activeFaq ? "FAQ updated" : "FAQ created");
      setFaqModalOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to save FAQ")
  });
  const deleteFaqMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/faqs/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-faqs"] }); toast.success("FAQ deleted"); },
    onError: (err: any) => toast.error(err.message || "Failed to delete FAQ")
  });

  // Story Mutations
  const storyMutation = useMutation({
    mutationFn: ({ id, data }: { id?: number; data: any }) => id ? api.put(`/admin/success-stories/${id}`, data) : api.post("/admin/success-stories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
      toast.success(activeStory ? "Success story updated" : "Success story created");
      setStoryModalOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to save story")
  });
  const deleteStoryMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/success-stories/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-stories"] }); toast.success("Story deleted"); },
    onError: (err: any) => toast.error(err.message || "Failed to delete story")
  });

  // Blog Mutations
  const blogMutation = useMutation({
    mutationFn: ({ id, data }: { id?: number; data: any }) => id ? api.put(`/admin/blog/${id}`, data) : api.post("/admin/blog", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
      toast.success(activeBlog ? "Blog post updated" : "Blog post created");
      setBlogModalOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to save blog")
  });
  const deleteBlogMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/blog/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-blogs"] }); toast.success("Blog deleted"); },
    onError: (err: any) => toast.error(err.message || "Failed to delete blog")
  });

  // Plan Mutations
  const planMutation = useMutation({
    mutationFn: ({ id, data }: { id?: number; data: any }) => id ? api.put(`/admin/plans/${id}`, data) : api.post("/admin/plans", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
      toast.success(activePlan ? "Plan updated" : "Plan created");
      setPlanModalOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to save plan")
  });
  const deletePlanMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/plans/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-plans"] }); toast.success("Plan deleted"); },
    onError: (err: any) => toast.error(err.message || "Failed to delete plan")
  });

  // Maintenance Mutation
  const maintenanceMutation = useMutation({
    mutationFn: (data: any) => api.post("/admin/settings", { settings: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Maintenance settings updated");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update maintenance settings")
  });

  // Ticker Mutation
  const tickerMutation = useMutation({
    mutationFn: (data: any) => api.post("/admin/settings", { settings: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Ticker settings updated");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update ticker settings")
  });

  // Popup Mutation
  const popupMutation = useMutation({
    mutationFn: (data: any) => api.post("/admin/settings", { settings: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Popup settings updated");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update popup settings")
  });

  // Footer Mutation
  const footerMutation = useMutation({
    mutationFn: (data: any) => api.post("/admin/settings", { settings: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Footer settings updated");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update footer settings")
  });

  const popupUploadMutation = useMutation({
    mutationFn: (formData: FormData) => api.post("/admin/upload", formData),
    onSuccess: (data: any) => {
      setPopupImage(data.data.url);
      toast.success("Popup image uploaded");
    },
    onError: (err: any) => toast.error(err.message || "Upload failed")
  });

  // Handlers - Pages
  const handleOpenPage = (page?: any) => {
    setActivePage(page || null);
    setPageTitle(page?.title || "");
    setPageSlug(page?.slug || "");
    setPageBody(page?.body || "");
    setPageModalOpen(true);
  };
  const handleSavePage = (e: React.FormEvent) => {
    e.preventDefault();
    pageMutation.mutate({ id: activePage?.id, data: { title: pageTitle, slug: pageSlug, body: pageBody } });
  };
  
  // Handlers - FAQs
  const handleOpenFaq = (faq?: any) => {
    setActiveFaq(faq || null);
    setFaqQuestion(faq?.question || "");
    setFaqAnswer(faq?.answer || "");
    setFaqSortOrder(faq?.sort_order ?? "");
    setFaqModalOpen(true);
  };
  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    faqMutation.mutate({ id: activeFaq?.id, data: { question: faqQuestion, answer: faqAnswer, sort_order: faqSortOrder === "" ? null : Number(faqSortOrder) } });
  };

  const handleStoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fd = new FormData();
      fd.append('image', e.target.files[0]);
      storyUploadMutation.mutate(fd);
    }
  };
  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fd = new FormData();
      fd.append('image', e.target.files[0]);
      heroUploadMutation.mutate(fd);
    }
  };

  // Handlers - Stories
  const handleOpenStory = (story?: any) => {
    setActiveStory(story || null);
    setStoryCouple(story?.couple_name || "");
    setStoryDate(story?.date || "");
    setStoryCity(story?.city || "");
    setStoryPhoto(story?.photo || "");
    setStoryQuote(story?.quote || "");
    setStoryModalOpen(true);
  };
  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    storyMutation.mutate({ id: activeStory?.id, data: { couple_name: storyCouple, date: storyDate, city: storyCity, photo: storyPhoto, quote: storyQuote } });
  };

  // Handlers - Blogs
  const handleOpenBlog = (blog?: any) => {
    setActiveBlog(blog || null);
    setBlogTitle(blog?.title || "");
    setBlogSlug(blog?.slug || "");
    setBlogCategory(blog?.category || "");
    setBlogReadTime(blog?.read_time || "");
    setBlogPublishedAt(blog?.published_at ? blog.published_at.split("T")[0] : "");
    setBlogImage(blog?.image || "");
    setBlogExcerpt(blog?.excerpt || "");
    setBlogBody(blog?.body || "");
    setBlogModalOpen(true);
  };
  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();
    blogMutation.mutate({ id: activeBlog?.id, data: { title: blogTitle, slug: blogSlug, category: blogCategory, read_time: blogReadTime, published_at: blogPublishedAt, image: blogImage, excerpt: blogExcerpt, body: blogBody } });
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append('image', e.target.files[0]);
      uploadMutation.mutate(formData);
    }
  };

  // Handlers - Plans
  const handleOpenPlan = (plan?: any) => {
    setActivePlan(plan || null);
    setPlanName(plan?.name || "");
    setPlanPrice(plan?.price || 0);
    setPlanContactQuota(plan?.contact_quota || 0);
    setPlanMessageQuota(plan?.message_quota || 0);
    setPlanCredits(plan?.credits || 0);
    setPlanPeriod(plan?.period || "Month");
    setPlanColor(plan?.color || "rose");
    setPlanPopular(!!plan?.popular);
    setPlanFeatures(Array.isArray(plan?.features) ? plan.features : [""]);
    setPlanModalOpen(true);
  };
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredFeatures = planFeatures.map(f => f.trim()).filter(Boolean);
    if (filteredFeatures.length === 0) return toast.error("Please add at least one feature");
    planMutation.mutate({ id: activePlan?.id, data: { name: planName, price: Number(planPrice), period: planPeriod, color: planColor, popular: planPopular, features: filteredFeatures, contact_quota: planContactQuota, message_quota: planMessageQuota, credits: planCredits } });
  };

  // Handlers - Maintenance
  const handleSaveMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    maintenanceMutation.mutate({
      maintenance_mode: maintenanceMode,
      maintenance_headline: maintenanceHeadline,
      maintenance_message: maintenanceMessage,
      maintenance_timer: maintenanceTimer,
    });
  };

  // Handlers - Ticker
  const handleSaveTicker = (e: React.FormEvent) => {
    e.preventDefault();
    tickerMutation.mutate({
      ticker_enabled: tickerEnabled,
      ticker_text: tickerText,
    });
  };

  // Handlers - Popup
  const handleSavePopup = (e: React.FormEvent) => {
    e.preventDefault();
    popupMutation.mutate({
      popup_enabled: popupEnabled,
      popup_image: popupImage,
      popup_content: popupContent,
      popup_link: popupLink,
      popup_link_text: popupLinkText,
    });
  };
  const handlePopupUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fd = new FormData();
      fd.append('image', e.target.files[0]);
      popupUploadMutation.mutate(fd);
    }
  };

  // Handlers - Footer
  const handleSaveFooter = (e: React.FormEvent) => {
    e.preventDefault();
    footerMutation.mutate({
      footer_description_en: footerDescriptionEn,
      footer_description_ta: footerDescriptionTa,
      footer_phone: footerPhone,
      footer_email: footerEmail,
      footer_address_en: footerAddressEn,
      footer_address_ta: footerAddressTa,
      footer_timing: footerTiming,
      footer_copyright: footerCopyright,
    });
  };

  const insertTag = (tagStart: string, tagEnd: string, isPage = false) => {
    const el = document.getElementById(isPage ? 'page-body' : 'blog-body') as HTMLTextAreaElement;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const currentVal = isPage ? pageBody : blogBody;
    const selectedText = currentVal.substring(start, end);
    const newText = currentVal.substring(0, start) + tagStart + selectedText + tagEnd + currentVal.substring(end);
    if (isPage) setPageBody(newText);
    else setBlogBody(newText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + tagStart.length, start + tagStart.length + selectedText.length);
    }, 10);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Content Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage pages, plans, blogs, and homepage content.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            <TabsList className="bg-card border w-max">
              <TabsTrigger value="pages" className="data-[state=active]:bg-primary data-[state=active]:text-white">Pages</TabsTrigger>
              <TabsTrigger value="plans" className="data-[state=active]:bg-primary data-[state=active]:text-white">Packages</TabsTrigger>
              <TabsTrigger value="blogs" className="data-[state=active]:bg-primary data-[state=active]:text-white">Blogs</TabsTrigger>
              <TabsTrigger value="faqs" className="data-[state=active]:bg-primary data-[state=active]:text-white">FAQs</TabsTrigger>
              <TabsTrigger value="stories" className="data-[state=active]:bg-primary data-[state=active]:text-white">Success Stories</TabsTrigger>
              <TabsTrigger value="maintenance" className="data-[state=active]:bg-primary data-[state=active]:text-white">Maintenance</TabsTrigger>
              <TabsTrigger value="ticker" className="data-[state=active]:bg-primary data-[state=active]:text-white">Ticker</TabsTrigger>
              <TabsTrigger value="popup" className="data-[state=active]:bg-primary data-[state=active]:text-white">Popup</TabsTrigger>
              <TabsTrigger value="footer" className="data-[state=active]:bg-primary data-[state=active]:text-white">Footer</TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-white">Settings</TabsTrigger>
            </TabsList>
          </div>

          {/* PAGES TAB */}
          <TabsContent value="pages" className="m-0 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Dynamic Pages</h2>
              <Button onClick={() => handleOpenPage()} className="gradient-rose text-white shadow-soft" size="sm">
                <Plus className="mr-1.5 h-4 w-4" /> Add Page
              </Button>
            </div>
            {loadingPages ? (
              <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="p-4 font-semibold w-1/3">Title</th>
                      <th className="p-4 font-semibold w-1/3">URL Slug</th>
                      <th className="p-4 font-semibold w-1/3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pages?.map(p => (
                      <tr key={p.id} className="hover:bg-muted/30">
                        <td className="p-4 font-medium">{p.title}</td>
                        <td className="p-4 text-muted-foreground">/{p.slug}</td>
                        <td className="p-4 text-right space-x-2">
                          <Button onClick={() => handleOpenPage(p)} variant="ghost" size="sm"><Edit className="h-4 w-4 mr-1" /> Edit</Button>
                          <Button onClick={() => confirm("Delete this page?") && deletePageMutation.mutate(p.id)} variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    ))}
                    {(!pages || pages.length === 0) && (
                      <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No pages found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* PLANS TAB */}
          <TabsContent value="plans" className="m-0 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Membership Plans</h2>
              <Button onClick={() => handleOpenPlan()} className="gradient-rose text-white shadow-soft" size="sm">
                <Plus className="mr-1.5 h-4 w-4" /> Add Plan
              </Button>
            </div>
            {loadingPlans ? (
              <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {plans?.map((p: any) => (
                  <div key={p.id} className={`rounded-2xl border p-6 relative flex flex-col ${p.popular ? 'bg-gradient-to-b from-primary/10 to-primary/5 border-primary shadow-md' : 'bg-card shadow-soft'}`}>
                    {p.popular && <span className="absolute -top-3 left-6 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white shadow-sm"><Star className="h-3 w-3 fill-white" /> Popular</span>}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2 rounded-xl ${p.popular ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}><Crown className="h-5 w-5" /></div>
                      <div className="flex items-center gap-1">
                        <Button onClick={() => handleOpenPlan(p)} variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                        <Button onClick={() => confirm("Delete plan?") && deletePlanMutation.mutate(p.id)} variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <h3 className="font-display text-xl font-bold">{p.name}</h3>
                    <p className="mt-1 font-display text-3xl font-bold">₹{p.price}<span className="text-sm font-normal text-muted-foreground"> / {p.period}</span></p>
                    <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
                      {Array.isArray(p.features) && p.features.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /><span>{f}</span></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* BLOGS TAB */}
          <TabsContent value="blogs" className="m-0 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Blog Posts</h2>
              <Button onClick={() => handleOpenBlog()} className="gradient-rose text-white shadow-soft" size="sm">
                <Plus className="mr-1.5 h-4 w-4" /> Add Blog
              </Button>
            </div>
            {loadingBlogs ? (
              <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {blogs?.map((blog: any) => (
                  <div key={blog.id} className="group rounded-2xl border bg-card overflow-hidden shadow-soft flex flex-col">
                    <div className="aspect-video w-full overflow-hidden relative">
                      <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute top-2 right-2 bg-background/80 backdrop-blur px-2 py-1 rounded-md text-xs font-medium">{blog.category}</div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-display font-bold text-lg line-clamp-2 leading-tight">{blog.title}</h3>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{new Date(blog.published_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{blog.read_time}</span>
                      </div>
                      <div className="mt-auto pt-4 flex gap-2">
                        <Button onClick={() => handleOpenBlog(blog)} variant="secondary" className="flex-1 text-xs" size="sm"><Edit className="mr-1.5 h-3.5 w-3.5" /> Edit</Button>
                        <Button onClick={() => confirm("Delete post?") && deleteBlogMutation.mutate(blog.id)} variant="ghost" className="text-destructive hover:bg-destructive/10" size="sm"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* FAQS TAB */}
          <TabsContent value="faqs" className="m-0 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">FAQs</h2>
              <Button onClick={() => handleOpenFaq()} className="gradient-rose text-white shadow-soft" size="sm">
                <Plus className="mr-1.5 h-4 w-4" /> Add FAQ
              </Button>
            </div>
            {loadingFaqs ? (
              <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="p-4 font-semibold w-12 text-center">#</th>
                      <th className="p-4 font-semibold min-w-[200px]">Question</th>
                      <th className="p-4 font-semibold min-w-[250px]">Answer</th>
                      <th className="p-4 font-semibold w-24 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {faqs?.map(faq => (
                      <tr key={faq.id} className="hover:bg-muted/30">
                        <td className="p-4 text-center font-medium text-muted-foreground">{faq.sort_order}</td>
                        <td className="p-4 font-medium">{faq.question}</td>
                        <td className="p-4 text-muted-foreground line-clamp-2">{faq.answer}</td>
                        <td className="p-4 text-right space-x-2">
                          <Button onClick={() => handleOpenFaq(faq)} variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                          <Button onClick={() => confirm("Delete FAQ?") && deleteFaqMutation.mutate(faq.id)} variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    ))}
                    {(!faqs || faqs.length === 0) && (
                      <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No FAQs found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* STORIES TAB */}
          <TabsContent value="stories" className="m-0 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Success Stories</h2>
              <Button onClick={() => handleOpenStory()} className="gradient-rose text-white shadow-soft" size="sm">
                <Plus className="mr-1.5 h-4 w-4" /> Add Story
              </Button>
            </div>
            {loadingStories ? (
              <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {stories?.map(s => (
                  <div key={s.id} className="rounded-xl border bg-card p-5 shadow-soft flex flex-col items-center text-center">
                    <img src={s.photo} alt={s.couple_name} className="h-20 w-20 rounded-full object-cover shadow-md mb-4 border-2 border-primary/20" />
                    <h3 className="font-display font-bold text-lg">{s.couple_name}</h3>
                    <div className="flex items-center justify-center gap-3 mt-1.5 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.city}</span>
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-primary" />{s.date}</span>
                    </div>
                    <p className="text-sm italic text-foreground/80 line-clamp-3 mb-5">"{s.quote}"</p>
                    <div className="mt-auto flex gap-2 w-full">
                      <Button onClick={() => handleOpenStory(s)} variant="secondary" className="flex-1" size="sm"><Edit className="mr-1.5 h-3.5 w-3.5" /> Edit</Button>
                      <Button onClick={() => confirm("Delete story?") && deleteStoryMutation.mutate(s.id)} variant="ghost" className="text-destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        
          {/* MAINTENANCE TAB */}
          <TabsContent value="maintenance" className="m-0 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Maintenance Mode</h2>
            </div>
            {loadingSettings ? (
              <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <form onSubmit={handleSaveMaintenance} className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border">
                    <div>
                      <Label className="cursor-pointer" htmlFor="maintenance-mode">Enable Maintenance Mode</Label>
                      <p className="text-xs text-muted-foreground">When enabled, visitors will see a maintenance page instead of the site.</p>
                    </div>
                    <Switch id="maintenance-mode" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="maintenance-headline">Headline</Label>
                    <Input id="maintenance-headline" value={maintenanceHeadline} onChange={e => setMaintenanceHeadline(e.target.value)} placeholder="We'll be back soon!" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="maintenance-message">Message</Label>
                    <Textarea id="maintenance-message" rows={3} value={maintenanceMessage} onChange={e => setMaintenanceMessage(e.target.value)} placeholder="We are currently performing scheduled maintenance. Please check back shortly." />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="maintenance-timer">Expected End Time (optional)</Label>
                    <Input id="maintenance-timer" type="datetime-local" value={maintenanceTimer} onChange={e => setMaintenanceTimer(e.target.value)} />
                  </div>
                </div>
                <div className="pt-4 border-t flex justify-end">
                  <Button type="submit" className="gradient-rose text-white" disabled={maintenanceMutation.isPending}>
                    {maintenanceMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Maintenance
                  </Button>
                </div>
              </form>
            )}
          </TabsContent>

          {/* TICKER TAB */}
          <TabsContent value="ticker" className="m-0 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Announcement Ticker</h2>
            </div>
            {loadingSettings ? (
              <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <form onSubmit={handleSaveTicker} className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border">
                    <div>
                      <Label className="cursor-pointer" htmlFor="ticker-enabled">Enable Scrolling Ticker</Label>
                      <p className="text-xs text-muted-foreground">Shows a scrolling announcement bar at the top of the site.</p>
                    </div>
                    <Switch id="ticker-enabled" checked={tickerEnabled} onCheckedChange={setTickerEnabled} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ticker-text">Announcement Text</Label>
                    <Textarea id="ticker-text" rows={3} value={tickerText} onChange={e => setTickerText(e.target.value)} placeholder="🎉 New features are live! Check out our latest updates." />
                  </div>
                </div>
                <div className="pt-4 border-t flex justify-end">
                  <Button type="submit" className="gradient-rose text-white" disabled={tickerMutation.isPending}>
                    {tickerMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Ticker
                  </Button>
                </div>
              </form>
            )}
          </TabsContent>

          {/* POPUP TAB */}
          <TabsContent value="popup" className="m-0 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Popup Modal</h2>
            </div>
            {loadingSettings ? (
              <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <form onSubmit={handleSavePopup} className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border">
                    <div>
                      <Label className="cursor-pointer" htmlFor="popup-enabled">Enable Popup Modal</Label>
                      <p className="text-xs text-muted-foreground">Shows a popup modal to visitors on page load.</p>
                    </div>
                    <Switch id="popup-enabled" checked={popupEnabled} onCheckedChange={setPopupEnabled} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Popup Image</Label>
                    <div className="flex gap-2">
                      <Input value={popupImage} onChange={e => setPopupImage(e.target.value)} placeholder="/uploads/popup.jpg" />
                      <input type="file" ref={popupImageInputRef} onChange={handlePopupUpload} accept="image/*" className="hidden" />
                      <Button type="button" variant="outline" onClick={() => popupImageInputRef.current?.click()}><Upload className="h-4 w-4" /></Button>
                    </div>
                    {popupImage && <img src={popupImage} alt="Popup" className="mt-2 h-24 w-full object-cover rounded-lg border" />}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="popup-content">Popup Content (HTML)</Label>
                    <Textarea id="popup-content" rows={4} value={popupContent} onChange={e => setPopupContent(e.target.value)} placeholder="Enter popup body text or HTML..." />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="popup-link">Button Link URL</Label>
                      <Input id="popup-link" value={popupLink} onChange={e => setPopupLink(e.target.value)} placeholder="https://example.com/offer" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="popup-link-text">Button Text</Label>
                      <Input id="popup-link-text" value={popupLinkText} onChange={e => setPopupLinkText(e.target.value)} placeholder="Learn More" />
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t flex justify-end">
                  <Button type="submit" className="gradient-rose text-white" disabled={popupMutation.isPending}>
                    {popupMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Popup
                  </Button>
                </div>
              </form>
            )}
          </TabsContent>

          {/* FOOTER TAB */}
          <TabsContent value="footer" className="m-0 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Footer Settings</h2>
            </div>
            {loadingSettings ? (
              <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <form onSubmit={handleSaveFooter} className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5"><Label>Footer Description (English)</Label><Textarea rows={3} value={footerDescriptionEn} onChange={e => setFooterDescriptionEn(e.target.value)} /></div>
                    <div className="space-y-1.5"><Label>Footer Description (Tamil)</Label><Textarea rows={3} value={footerDescriptionTa} onChange={e => setFooterDescriptionTa(e.target.value)} /></div>
                    <div className="space-y-1.5"><Label>Phone Number</Label><Input value={footerPhone} onChange={e => setFooterPhone(e.target.value)} placeholder="+91 80 4567 8900" /></div>
                    <div className="space-y-1.5"><Label>Email Address</Label><Input value={footerEmail} onChange={e => setFooterEmail(e.target.value)} placeholder="support@ungalkalyanam.in" /></div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5"><Label>Address (English)</Label><Textarea rows={2} value={footerAddressEn} onChange={e => setFooterAddressEn(e.target.value)} placeholder="8th Floor, Indiranagar, Bengaluru 560038" /></div>
                    <div className="space-y-1.5"><Label>Address (Tamil)</Label><Textarea rows={2} value={footerAddressTa} onChange={e => setFooterAddressTa(e.target.value)} /></div>
                    <div className="space-y-1.5"><Label>Business Hours</Label><Input value={footerTiming} onChange={e => setFooterTiming(e.target.value)} placeholder="Mon - Sat, 9:00 AM - 6:00 PM" /></div>
                    <div className="space-y-1.5"><Label>Copyright Text</Label><Input value={footerCopyright} onChange={e => setFooterCopyright(e.target.value)} /></div>
                  </div>
                </div>
                <div className="pt-4 border-t flex justify-end">
                  <Button type="submit" className="gradient-rose text-white" disabled={footerMutation.isPending}>
                    {footerMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Footer
                  </Button>
                </div>
              </form>
            )}
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="m-0 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Site Settings (Hero & Footer)</h2>
            </div>
            {loadingSettings ? (
              <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <form onSubmit={handleSaveSettings} className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
                <div className="space-y-4">
                  <h3 className="font-semibold text-primary">Hero Section</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5"><Label>Hero Title (English)</Label><Input value={settingsForm.hero_title_en || ""} onChange={e => setSettingsForm({...settingsForm, hero_title_en: e.target.value})} /></div>
                    <div className="space-y-1.5"><Label>Hero Title (Tamil)</Label><Input value={settingsForm.hero_title_ta || ""} onChange={e => setSettingsForm({...settingsForm, hero_title_ta: e.target.value})} /></div>
                    <div className="space-y-1.5"><Label>Hero Subtitle (English)</Label><Input value={settingsForm.hero_subtitle_en || ""} onChange={e => setSettingsForm({...settingsForm, hero_subtitle_en: e.target.value})} /></div>
                    <div className="space-y-1.5"><Label>Hero Subtitle (Tamil)</Label><Input value={settingsForm.hero_subtitle_ta || ""} onChange={e => setSettingsForm({...settingsForm, hero_subtitle_ta: e.target.value})} /></div>
                  </div>
                  <div className="space-y-1.5 mt-4">
                    <Label>Hero Background Image</Label>
                    <div className="flex gap-2">
                      <Input value={settingsForm.hero_background || ""} onChange={e => setSettingsForm({...settingsForm, hero_background: e.target.value})} placeholder="/hero-pair.png" />
                      <input type="file" ref={heroImageInputRef} onChange={handleHeroUpload} accept="image/*" className="hidden" />
                      <Button type="button" variant="outline" onClick={() => heroImageInputRef.current?.click()}><Upload className="h-4 w-4" /></Button>
                    </div>
                    {settingsForm.hero_background && <img src={settingsForm.hero_background} alt="Hero" className="mt-2 h-24 w-full object-cover rounded-lg border" />}
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-primary">Contact Info</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5"><Label>Contact Phone</Label><Input value={settingsForm.contact_phone || ""} onChange={e => setSettingsForm({...settingsForm, contact_phone: e.target.value})} placeholder="+91 80 4567 8900" /></div>
                    <div className="space-y-1.5"><Label>Contact Email</Label><Input value={settingsForm.contact_email || ""} onChange={e => setSettingsForm({...settingsForm, contact_email: e.target.value})} placeholder="support@ungalkalyanam.in" /></div>
                    <div className="space-y-1.5"><Label>Office Address (English)</Label><Textarea rows={2} value={settingsForm.contact_address_en || ""} onChange={e => setSettingsForm({...settingsForm, contact_address_en: e.target.value})} placeholder="8th Floor, Indiranagar, Bengaluru 560038" /></div>
                    <div className="space-y-1.5"><Label>Office Address (Tamil)</Label><Textarea rows={2} value={settingsForm.contact_address_ta || ""} onChange={e => setSettingsForm({...settingsForm, contact_address_ta: e.target.value})} /></div>
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-primary">Footer Section</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5"><Label>Footer Description (English)</Label><Textarea rows={3} value={settingsForm.footer_description_en || ""} onChange={e => setSettingsForm({...settingsForm, footer_description_en: e.target.value})} /></div>
                    <div className="space-y-1.5"><Label>Footer Description (Tamil)</Label><Textarea rows={3} value={settingsForm.footer_description_ta || ""} onChange={e => setSettingsForm({...settingsForm, footer_description_ta: e.target.value})} /></div>
                    <div className="space-y-1.5 sm:col-span-2"><Label>Copyright Text</Label><Input value={settingsForm.footer_copyright || ""} onChange={e => setSettingsForm({...settingsForm, footer_copyright: e.target.value})} /></div>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-primary">Payment Gateway (Razorpay)</h3>
                    {!pgUnlocked && !pgShowUnlock && (
                      <Button type="button" variant="outline" size="sm" onClick={() => setPgShowUnlock(true)}>
                        <Lock className="mr-1.5 h-4 w-4" /> Unlock
                      </Button>
                    )}
                  </div>

                  {pgShowUnlock && !pgUnlocked && (
                    <form onSubmit={handlePgUnlock} className="flex items-end gap-3 rounded-xl border bg-muted/30 p-4">
                      <div className="flex-1 space-y-1">
                        <Label htmlFor="cms-pg-unlock">Enter your password to modify payment settings</Label>
                        <Input id="cms-pg-unlock" type="password" value={pgUnlockPassword} onChange={(e) => setPgUnlockPassword(e.target.value)} placeholder="Your admin password" autoFocus />
                      </div>
                      <Button type="submit" disabled={!pgUnlockPassword || pgVerifyMutation.isPending}>
                        {pgVerifyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
                        Unlock
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => { setPgShowUnlock(false); setPgUnlockPassword(""); }}>Cancel</Button>
                    </form>
                  )}

                  {pgUnlocked && (
                    <>
                      <p className="text-xs text-muted-foreground">
                        Env vars (<code className="text-xs">RAZORPAY_KEY_ID</code>, <code className="text-xs">RAZORPAY_KEY_SECRET</code>) take priority.
                        {settingsForm.razorpay_source === "env" && " Currently using .env credentials."}
                        {settingsForm.razorpay_source === "database" && " Using database fallback."}
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label>Razorpay Key ID</Label>
                          <Input
                            value={settingsForm.razorpay_key_id || ""}
                            onChange={(e) => setSettingsForm({ ...settingsForm, razorpay_key_id: e.target.value })}
                            placeholder="rzp_test_..."
                            disabled={settingsForm.razorpay_source === "env"}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Razorpay Key Secret</Label>
                          <div className="relative">
                            <Input
                              type={pgShowSecret ? "text" : "password"}
                              value={settingsForm.razorpay_key_secret || ""}
                              onChange={(e) => setSettingsForm({ ...settingsForm, razorpay_key_secret: e.target.value })}
                              placeholder={settingsForm.razorpay_key_secret_masked ? "•••••••• (leave to keep)" : "Enter secret"}
                              disabled={settingsForm.razorpay_source === "env"}
                            />
                            <button type="button" onClick={() => setPgShowSecret(!pgShowSecret)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {pgShowSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button type="button" variant="ghost" size="sm" onClick={() => { setPgUnlocked(false); setPgShowUnlock(false); setPgUnlockPassword(""); }} className="text-muted-foreground">
                          <Lock className="mr-1.5 h-4 w-4" /> Lock
                        </Button>
                      </div>
                    </>
                  )}

                  {!pgUnlocked && !pgShowUnlock && (
                    <p className="text-xs text-muted-foreground">Payment settings are locked. Click "Unlock" and enter your admin password to modify Razorpay keys.</p>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-primary">Free Default Quotas</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5"><Label>Free Contact Quota</Label><Input type="number" value={settingsForm.free_contact_quota || ""} onChange={e => setSettingsForm({...settingsForm, free_contact_quota: e.target.value})} /></div>
                    <div className="space-y-1.5"><Label>Free Message Quota</Label><Input type="number" value={settingsForm.free_message_quota || ""} onChange={e => setSettingsForm({...settingsForm, free_message_quota: e.target.value})} /></div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-primary">Credit Costs Per Action</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5"><Label>Interest Send Cost</Label><Input type="number" min="0" value={settingsForm.credit_cost_interest || "1"} onChange={e => setSettingsForm({...settingsForm, credit_cost_interest: e.target.value})} /><p className="text-xs text-muted-foreground">Credits deducted per interest sent</p></div>
                    <div className="space-y-1.5"><Label>Profile Unlock Cost</Label><Input type="number" min="0" value={settingsForm.credit_cost_unlock || "5"} onChange={e => setSettingsForm({...settingsForm, credit_cost_unlock: e.target.value})} /><p className="text-xs text-muted-foreground">Credits deducted per contact unlock</p></div>
                    <div className="space-y-1.5"><Label>Message Cost</Label><Input type="number" min="0" value={settingsForm.credit_cost_message || "1"} onChange={e => setSettingsForm({...settingsForm, credit_cost_message: e.target.value})} /><p className="text-xs text-muted-foreground">Message quota deducted per first message</p></div>
                  </div>
                </div>
<div className="pt-4 border-t flex justify-end">
                  <Button type="submit" className="gradient-rose text-white" disabled={settingsMutation.isPending}>
                    {settingsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Settings
                  </Button>
                </div>
              </form>
            )}
          </TabsContent>

        </Tabs>
      </div>

      {/* --- MODALS --- */}

      {/* PAGES MODAL */}
      <Dialog open={pageModalOpen} onOpenChange={setPageModalOpen}>
        <DialogContent className="sm:max-w-2xl h-[90vh] flex flex-col p-4 sm:p-6 w-[95vw]">
          <form onSubmit={handleSavePage} className="flex-1 flex flex-col overflow-hidden">
            <DialogHeader className="pb-2 border-b">
              <DialogTitle className="font-display text-xl font-bold">{activePage ? "Edit Page" : "Add Page"}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="page-title">Page Title</Label>
                  <Input id="page-title" value={pageTitle} onChange={e => setPageTitle(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="page-slug">URL Slug</Label>
                  <Input id="page-slug" value={pageSlug} onChange={e => setPageSlug(e.target.value)} placeholder="e.g. privacy-policy" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="page-body">Body Content (HTML)</Label>
                  <div className="flex gap-1 overflow-x-auto pb-1 max-w-[200px] sm:max-w-none">
                    <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => insertTag('<h3>', '</h3>', true)}><Type className="h-3 w-3 mr-1" /> H3</Button>
                    <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => insertTag('<b>', '</b>', true)}><Bold className="h-3 w-3 mr-1" /> Bold</Button>
                    <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => insertTag('<p>', '</p>', true)}>P</Button>
                    <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => insertTag('<ul>\n  <li>Item</li>\n</ul>', '', true)}>List</Button>
                  </div>
                </div>
                <Textarea id="page-body" value={pageBody} onChange={e => setPageBody(e.target.value)} rows={12} className="font-mono text-sm" required />
              </div>
            </div>
            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setPageModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="gradient-rose text-white" disabled={pageMutation.isPending}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* PLANS MODAL */}
      <Dialog open={planModalOpen} onOpenChange={setPlanModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-4 sm:p-6 w-[95vw]">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="font-display text-2xl font-bold">{activePlan ? "Edit Plan" : "Create Plan"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePlan} className="flex-1 overflow-y-auto py-4 space-y-5 pr-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="plan-name">Plan Name</Label>
                <Input id="plan-name" value={planName} onChange={e => setPlanName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-price">Price (INR)</Label>
                <Input id="plan-price" type="number" value={planPrice} onChange={e => setPlanPrice(Number(e.target.value))} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-period">Period</Label>
                <select id="plan-period" value={planPeriod} onChange={e => setPlanPeriod(e.target.value)} required className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  <option>Month</option>
                  <option>3 Months</option>
                  <option>6 Months</option>
                  <option>Year</option>
                  <option>Lifetime</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border">
              <div>
                <Label className="cursor-pointer" htmlFor="plan-popular">Popular Plan</Label>
                <p className="text-xs text-muted-foreground">Highlight this plan</p>
              </div>
              <Switch id="plan-popular" checked={planPopular} onCheckedChange={setPlanPopular} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="contact-quota">Contact View Quota</Label>
                <Input id="contact-quota" type="number" value={planContactQuota} onChange={e => setPlanContactQuota(Number(e.target.value))} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message-quota">Message Quota</Label>
                <Input id="message-quota" type="number" value={planMessageQuota} onChange={e => setPlanMessageQuota(Number(e.target.value))} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-credits">Interest Credits</Label>
                <Input id="plan-credits" type="number" value={planCredits} onChange={e => setPlanCredits(Number(e.target.value))} required />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-1">
                <Label className="font-semibold text-sm">Features List</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setPlanFeatures(p => [...p, ""])} className="h-8 gap-1"><Plus className="h-3.5 w-3.5" /> Add</Button>
              </div>
              <div className="space-y-2.5 max-h-[150px] overflow-y-auto pr-1">
                {planFeatures.map((feat, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input value={feat} onChange={e => {
                      const c = [...planFeatures];
                      c[idx] = e.target.value;
                      setPlanFeatures(c);
                    }} required />
                    {planFeatures.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => setPlanFeatures(p => p.filter((_, i) => i !== idx))} className="h-9 w-9 text-destructive"><X className="h-4 w-4" /></Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setPlanModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="gradient-rose text-white" disabled={planMutation.isPending}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* BLOG MODAL */}
      <Dialog open={blogModalOpen} onOpenChange={setBlogModalOpen}>
        <DialogContent className="sm:max-w-2xl h-[90vh] flex flex-col p-4 sm:p-6 w-[95vw]">
          <form onSubmit={handleSaveBlog} className="flex-1 flex flex-col overflow-hidden">
            <DialogHeader className="pb-2 border-b"><DialogTitle className="font-display text-xl font-bold">{activeBlog ? "Edit Blog" : "Add Blog"}</DialogTitle></DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Blog Title</Label><Input value={blogTitle} onChange={e => setBlogTitle(e.target.value)} required /></div>
                <div className="space-y-1.5"><Label>URL Slug</Label><Input value={blogSlug} onChange={e => setBlogSlug(e.target.value)} required /></div>
                <div className="space-y-1.5"><Label>Category</Label><Input value={blogCategory} onChange={e => setBlogCategory(e.target.value)} required /></div>
                <div className="space-y-1.5"><Label>Read Time</Label><Input value={blogReadTime} onChange={e => setBlogReadTime(e.target.value)} required /></div>
                <div className="space-y-1.5"><Label>Publish Date</Label><Input type="date" value={blogPublishedAt} onChange={e => setBlogPublishedAt(e.target.value)} required /></div>
                <div className="space-y-1.5">
                  <Label>Hero Image URL</Label>
                  <div className="flex gap-2">
                    <Input type="url" value={blogImage} onChange={e => setBlogImage(e.target.value)} required />
                    <input type="file" ref={blogImageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    <Button type="button" variant="outline" onClick={() => blogImageInputRef.current?.click()}><Upload className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5"><Label>Excerpt Summary</Label><Input value={blogExcerpt} onChange={e => setBlogExcerpt(e.target.value)} required /></div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Body Content (HTML)</Label>
                  <div className="flex gap-1 overflow-x-auto pb-1 max-w-[200px] sm:max-w-none">
                    <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => insertTag('<h2>', '</h2>')}><Type className="h-3 w-3 mr-1" /> H2</Button>
                    <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => insertTag('<b>', '</b>')}><Bold className="h-3 w-3 mr-1" /> B</Button>
                    <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => insertTag('<p>', '</p>')}>P</Button>
                    <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => insertTag('<img src="URL_HERE" alt="Image" className="w-full rounded-xl my-4" />')}><ImageIcon className="h-3 w-3 mr-1" /> Img</Button>
                  </div>
                </div>
                <Textarea id="blog-body" value={blogBody} onChange={e => setBlogBody(e.target.value)} rows={8} className="font-mono text-sm" required />
              </div>
            </div>
            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setBlogModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="gradient-rose text-white" disabled={blogMutation.isPending}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* FAQS MODAL */}
      <Dialog open={faqModalOpen} onOpenChange={setFaqModalOpen}>
        <DialogContent className="sm:max-w-xl w-[95vw] p-4 sm:p-6"><form onSubmit={handleSaveFaq}>
          <DialogHeader className="mb-4"><DialogTitle>{activeFaq ? "Edit FAQ" : "Add FAQ"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Question</Label><Input value={faqQuestion} onChange={e => setFaqQuestion(e.target.value)} required /></div>
            <div className="space-y-1.5"><Label>Answer</Label><Textarea value={faqAnswer} onChange={e => setFaqAnswer(e.target.value)} rows={4} required /></div>
            <div className="space-y-1.5"><Label>Sort Order</Label><Input type="number" value={faqSortOrder} onChange={e => setFaqSortOrder(e.target.value === "" ? "" : Number(e.target.value))} /></div>
          </div>
          <DialogFooter className="mt-6"><Button type="button" variant="outline" onClick={() => setFaqModalOpen(false)}>Cancel</Button><Button type="submit" className="gradient-rose text-white">Save</Button></DialogFooter>
        </form></DialogContent>
      </Dialog>

      {/* STORY MODAL */}
      <Dialog open={storyModalOpen} onOpenChange={setStoryModalOpen}>
        <DialogContent className="sm:max-w-xl w-[95vw] p-4 sm:p-6"><form onSubmit={handleSaveStory}>
          <DialogHeader className="mb-4"><DialogTitle>{activeStory ? "Edit Story" : "Add Story"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Couple Name</Label><Input value={storyCouple} onChange={e => setStoryCouple(e.target.value)} required /></div>
              <div className="space-y-1.5"><Label>Marriage Date</Label><Input value={storyDate} onChange={e => setStoryDate(e.target.value)} required /></div>
              <div className="space-y-1.5"><Label>City</Label><Input value={storyCity} onChange={e => setStoryCity(e.target.value)} required /></div>
              <div className="space-y-1.5">
                <Label>Photo</Label>
                <div className="flex gap-2">
                  <Input type="url" value={storyPhoto} onChange={e => setStoryPhoto(e.target.value)} required />
                  <input type="file" ref={storyImageInputRef} onChange={handleStoryUpload} accept="image/*" className="hidden" />
                  <Button type="button" variant="outline" onClick={() => storyImageInputRef.current?.click()}><Upload className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Quote</Label><Textarea value={storyQuote} onChange={e => setStoryQuote(e.target.value)} rows={3} required /></div>
          </div>
          <DialogFooter className="mt-6"><Button type="button" variant="outline" onClick={() => setStoryModalOpen(false)}>Cancel</Button><Button type="submit" className="gradient-rose text-white">Save</Button></DialogFooter>
        </form></DialogContent>
      </Dialog>

    </AdminLayout>
  );
}
