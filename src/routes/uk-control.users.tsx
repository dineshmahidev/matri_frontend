import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AppLayouts";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Crown, 
  ShieldCheck, 
  X,
  Upload,
  Image as ImageIcon,
  Coins,
  ChevronDown
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, BASE_URL } from "@/lib/api";
import { toast } from "sonner";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { StatusPill } from "./uk-control.index";
import { RELIGIONS, CASTES, RELIGION_CASTE_MAP, OPTION_TRANSLATIONS } from "@/data/castes";
import { EDUCATION_LEVELS, PROFESSIONS } from "@/data/education";
import { MemberProfileFields } from "@/components/matrimony/MemberProfileFields";
import { BulkUploadModal } from "@/components/admin/BulkUploadModal";

export const Route = createFileRoute("/uk-control/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
  component: AdminUsers,
});

const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  
  // Replace backslashes with forward slashes for Windows paths
  let normalizedPath = path.replace(/\\/g, '/');
  
  const base = BASE_URL.replace('/api', '');
  return `${base}/${normalizedPath.startsWith('/') ? normalizedPath.substring(1) : normalizedPath}`;
};

const getCity = (cityStr: any) => {
  if (!cityStr) return "N/A";
  
  let parsedStr = cityStr;
  
  if (typeof parsedStr === 'string') {
     try {
       while (typeof parsedStr === 'string' && parsedStr.startsWith('{')) {
         parsedStr = JSON.parse(parsedStr);
       }
     } catch (e) {
       // if it fails to parse halfway, use whatever we successfully parsed so far
     }
  }

  if (typeof parsedStr === 'object' && parsedStr !== null) {
      if (parsedStr.address) {
        const parts = parsedStr.address.split(',');
        if (parts.length >= 2) {
            return parts[parts.length > 2 ? parts.length - 2 : 0].trim();
        }
        return parsedStr.address.trim();
      }
  }

  if (typeof cityStr === 'string') return cityStr.replace(/\\"/g, '"');
  return String(cityStr);
};

function AdminUsers() {
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [hasPhoto, setHasPhoto] = useState("all");
  const [hasGallery, setHasGallery] = useState("all");
  const [hasPremium, setHasPremium] = useState("all");
  const [hasFeatured, setHasFeatured] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeUser, setActiveUser] = useState<any>(null);

  // Form states for edit drawer
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  // const [tob, setTob] = useState("");
  const [bio, setBio] = useState("");
  const [height, setHeight] = useState("");
  const [religion, setReligion] = useState("");
  const [community, setCommunity] = useState("");
  const [motherTongue, setMotherTongue] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [profession, setProfession] = useState("");
  const [education, setEducation] = useState("");
  const [income, setIncome] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [premium, setPremium] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [verified, setVerified] = useState(false);
  const [photo, setPhoto] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("free");

  // Credit management
  const [userCredits, setUserCredits] = useState(0);
  const [userContactQuota, setUserContactQuota] = useState(0);
  const [userMessageQuota, setUserMessageQuota] = useState(0);
  const [addCreditsInput, setAddCreditsInput] = useState("");
  const [addContactInput, setAddContactInput] = useState("");
  const [addMessageInput, setAddMessageInput] = useState("");

  // Horoscope fields (removed rasi/nakshatram)

  // Family fields
  const [father, setFather] = useState("");
  const [mother, setMother] = useState("");
  const [siblings, setSiblings] = useState("");
  const [familyStatus, setFamilyStatus] = useState("Middle Class");

  // Partner Preferences fields
  const [prefAgeRange, setPrefAgeRange] = useState("");
  const [prefHeightRange, setPrefHeightRange] = useState("");
  const [prefReligion, setPrefReligion] = useState("");
  const [prefCommunity, setPrefCommunity] = useState("");
  const [prefEducation, setPrefEducation] = useState("");
  const [prefProfession, setPrefProfession] = useState("");
  const [prefLocation, setPrefLocation] = useState("");

  // Password change dialog
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordUser, setPasswordUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");

  // Create user dialog
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createGender, setCreateGender] = useState("male");
  const [createPassword, setCreatePassword] = useState("");
  const [createDob, setCreateDob] = useState("");
  const [createReligionId, setCreateReligionId] = useState<number | null>(null);
  const [createCasteId, setCreateCasteId] = useState<number | null>(null);
  const [createStateId, setCreateStateId] = useState<number | null>(null);
  const [createCityId, setCreateCityId] = useState<number | null>(null);

  // Bulk add user states
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [bulkUsers, setBulkUsers] = useState<any[]>([{ name: "", email: "", phone: "", gender: "male", password: "", dob: "", religion: "", community: "", state: "", city: "", mother_tongue: "", profile_pic: "", profile_pic_file: null }]);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  // Fetch available plans
  const { data: plansData } = useQuery<any[]>({
    queryKey: ["admin-plans-list"],
    queryFn: () => api.get<any>("/admin/plans"),
  });
  const plans = plansData || [];

  // Fetch users (paginated)
  const { data: usersResponse, isLoading } = useQuery<any>({
    queryKey: ["admin-users", page, search, hasPhoto, hasGallery, hasPremium, hasFeatured, filterGender],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (hasPhoto !== "all") params.set("has_photo", hasPhoto);
      if (hasGallery !== "all") params.set("has_gallery", hasGallery);
      if (hasPremium !== "all") params.set("premium", hasPremium);
      if (hasFeatured !== "all") params.set("featured", hasFeatured);
      if (filterGender !== "all") params.set("gender", filterGender);
      return api.get<any>(`/admin/users?${params.toString()}`);
    },
  });

  const users = usersResponse?.data || [];
  const meta = usersResponse?.meta;
  const counts = usersResponse?.counts || usersResponse?.meta?.counts || { male: 0, female: 0 };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  // Toggle selection for single user
  const handleSelectRow = (userId: number) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Toggle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allUserIds = users.map((u: any) => u.userId);
      setSelectedIds(allUserIds);
    } else {
      setSelectedIds([]);
    }
  };

  // Mutate for single deletion
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedIds((prev) => prev.filter((id) => id !== activeUser?.userId));
      toast.success("User deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete user");
    },
  });

  // Mutate for bulk deletion
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => api.post("/admin/users/bulk-delete", { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedIds([]);
      toast.success("Selected users deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete users");
    },
  });

  // Mutate for bulk premium toggle
  const bulkPremiumMutation = useMutation({
    mutationFn: ({ ids, premium, planId }: { ids: number[]; premium: boolean; planId?: number | null }) => 
      api.post("/admin/users/bulk-premium", { ids, premium, plan_id: planId }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedIds([]);
      toast.success(data.message || "Bulk premium updated");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update bulk premium status");
    },
  });

  // Mutate for bulk verification toggle
  const bulkVerifyMutation = useMutation({
    mutationFn: ({ ids, verified }: { ids: number[]; verified: boolean }) => 
      api.post("/admin/users/bulk-verify", { ids, verified }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedIds([]);
      toast.success(data.message || "Bulk verification updated");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update bulk verification status");
    },
  });

  // Mutate for update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/admin/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User updated successfully");
      setIsEditing(false);
      setActiveUser(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update user");
    },
  });

  // Mutate for change password
  const changePasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      api.post(`/admin/users/${id}/change-password`, { password }),
    onSuccess: () => {
      toast.success("Password changed successfully");
      setIsChangingPassword(false);
      setPasswordUser(null);
      setNewPassword("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to change password");
    },
  });

  // Mutate for create user
  const createUserMutation = useMutation({
    mutationFn: (data: any) => api.post<any>("/admin/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User created successfully");
      setIsCreatingUser(false);
      setCreateName("");
      setCreateEmail("");
      setCreatePhone("");
      setCreateGender("male");
      setCreatePassword("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create user");
    },
  });

  const addCreditsMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.post(`/admin/users/${id}/add-credits`, data),
    onSuccess: (res: any, vars) => {
      toast.success(res.message || "Credits added successfully");
      setUserCredits(res.user?.credits ?? userCredits);
      setUserContactQuota(res.user?.contact_quota ?? userContactQuota);
      setUserMessageQuota(res.user?.message_quota ?? userMessageQuota);
      setAddCreditsInput("");
      setAddContactInput("");
      setAddMessageInput("");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to add credits"),
  });

  const handleOpenEdit = (user: any) => {
    setActiveUser(user);
    setName(user.name || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setGender(user.gender || "male");
    setDob(user.dob || "");
    setBio(user.bio || "");
    setHeight(user.height || "");
    setReligion(user.religion || "");
    setCommunity(user.community || "");
    setMotherTongue(user.motherTongue || "Tamil");
    setCity(user.city || "");
    setState(user.state || "");
    setProfession(user.profession || "");
    setEducation(user.education || "");
    setIncome(user.income || "");
    setMaritalStatus(user.maritalStatus || "Never Married");
    setPremium(!!user.premium);
    setFeatured(!!user.featured);
    setVerified(!!user.verified);
    setPhoto(user.photo || "");
    setGallery(user.gallery || []);
    setSelectedPlanId(user.planId ? String(user.planId) : "free");
    setUserCredits(user.credits ?? 0);
    setUserContactQuota(user.contact_quota ?? 0);
    setUserMessageQuota(user.message_quota ?? 0);
    setAddCreditsInput("");
    setAddContactInput("");
    setAddMessageInput("");
    setFather(user.family?.father || "");
    setMother(user.family?.mother || "");
    setSiblings(user.family?.siblings || "");
    setFamilyStatus(user.family?.familyStatus || "Middle Class");
    setPrefAgeRange(user.partnerPrefs?.ageRange || "");
    setPrefHeightRange(user.partnerPrefs?.heightRange || "");
    setPrefReligion(user.partnerPrefs?.religion || "");
    setPrefCommunity(user.partnerPrefs?.community || "");
    setPrefEducation(user.partnerPrefs?.education || "");
    setPrefProfession(user.partnerPrefs?.profession || "");
    setPrefLocation(user.partnerPrefs?.location || "");
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;
    
    updateMutation.mutate({
      id: activeUser.userId,
      data: {
        name,
        email,
        phone,
        gender,
        dob,
        bio,
        height,
        religion,
        community,
        motherTongue,
        city,
        state,
        profession,
        education,
        income,
        maritalStatus,
        premium,
        featured,
        verified,
        photo,
        gallery,
        planId: selectedPlanId === "free" ? null : parseInt(selectedPlanId),
        family: {
          father,
          mother,
          siblings,
          familyStatus,
        },
        partnerPrefs: {
          ageRange: prefAgeRange,
          heightRange: prefHeightRange,
          religion: prefReligion,
          community: prefCommunity,
          education: prefEducation,
          profession: prefProfession,
          location: prefLocation,
        },
      },
    });
  };

  const handleDeleteSingle = (id: number) => {
    if (confirm("Are you sure you want to delete this user? This action is irreversible.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected users? This action is irreversible.`)) {
      bulkDeleteMutation.mutate(selectedIds);
    }
  };

  const allSelectedOnPage = users.length > 0 && users.every((u: any) => selectedIds.includes(u.userId));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">Users</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              {meta ? (
                <>
                  <span className="font-semibold text-foreground">Total: {meta.total}</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Male: {counts.male}</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-pink-500"></div> Female: {counts.female}</span>
                </>
              ) : "Loading users..."}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="shadow-soft gap-1.5 border-primary/30">
                    Bulk Actions ({selectedIds.length})
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>Update Selected</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger disabled={bulkPremiumMutation.isPending}>
                      <Crown className="h-4 w-4 mr-2 text-amber-500 fill-amber-500" />
                      Set Premium
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="w-56">
                        <DropdownMenuLabel>Select Membership Plan</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => bulkPremiumMutation.mutate({ ids: selectedIds, premium: true, planId: null })}
                        >
                          Free Plan (Basic)
                        </DropdownMenuItem>
                        {plans.map((p: any) => (
                          <DropdownMenuItem 
                            key={p.id}
                            onClick={() => bulkPremiumMutation.mutate({ ids: selectedIds, premium: true, planId: p.id })}
                          >
                            {p.name} (₹{p.price})
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuItem 
                    onClick={() => bulkPremiumMutation.mutate({ ids: selectedIds, premium: false })}
                    disabled={bulkPremiumMutation.isPending}
                  >
                    <Crown className="h-4 w-4 mr-2 text-muted-foreground" />
                    Remove Premium
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => bulkVerifyMutation.mutate({ ids: selectedIds, verified: true })}
                    disabled={bulkVerifyMutation.isPending}
                  >
                    <ShieldCheck className="h-4 w-4 mr-2 text-emerald-500" />
                    Mark Verified
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => bulkVerifyMutation.mutate({ ids: selectedIds, verified: false })}
                    disabled={bulkVerifyMutation.isPending}
                  >
                    <ShieldCheck className="h-4 w-4 mr-2 text-muted-foreground" />
                    Remove Verified
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleBulkDelete}
                    disabled={bulkDeleteMutation.isPending}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsBulkAdding(true)}
                variant="outline" 
                className="shadow-soft"
              >
                <Upload className="mr-1.5 h-4 w-4" /> Bulk Add
              </Button>
              <Button 
                onClick={() => window.location.href = "/uk-control/bulk-upload"} 
                variant="outline" 
                className="shadow-soft"
              >
                <Upload className="mr-1.5 h-4 w-4" /> Bulk Import
              </Button>
              <Button onClick={() => setIsCreatingUser(true)} className="gradient-rose text-white shadow-soft">
                <Plus className="mr-1.5 h-4 w-4" /> Add user
              </Button>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="rounded-2xl border bg-card p-4 shadow-soft space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, or ID (e.g. UK0010008)..."
                className="pl-9 pr-8"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" variant="secondary">Search</Button>
          </form>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Profile photo</Label>
              <Select value={hasPhoto} onValueChange={(v) => { setHasPhoto(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Has photo</SelectItem>
                  <SelectItem value="no">No photo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Gallery</Label>
              <Select value={hasGallery} onValueChange={(v) => { setHasGallery(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Has gallery</SelectItem>
                  <SelectItem value="no">No gallery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Premium</Label>
              <Select value={hasPremium} onValueChange={(v) => { setHasPremium(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Premium</SelectItem>
                  <SelectItem value="no">Free</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Featured</Label>
              <Select value={hasFeatured} onValueChange={(v) => { setHasFeatured(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Featured</SelectItem>
                  <SelectItem value="no">Not Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Gender</Label>
              <Select value={filterGender} onValueChange={(v) => { setFilterGender(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Main Users Table */}
        <div className="rounded-2xl border bg-card shadow-soft overflow-hidden">
          {isLoading ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex h-60 flex-col items-center justify-center text-muted-foreground">
              <p className="font-semibold text-lg">No users found</p>
              <p className="text-sm">Try clearing your filters or searches.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                  <tr>
                    <th className="p-4 w-12 text-center">
                      <Checkbox
                        checked={allSelectedOnPage}
                        onCheckedChange={(val) => handleSelectAll(!!val)}
                      />
                    </th>
                    <th className="p-4">User</th>
                    <th className="p-4">ID</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Plan Status</th>
                    <th className="p-4">Credits</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((m: any) => {
                    const isSelected = selectedIds.includes(m.userId);
                    return (
                      <tr 
                        key={m.userId} 
                        className={`hover:bg-muted/30 transition-colors ${isSelected ? "bg-primary/5 hover:bg-primary/10" : ""}`}
                      >
                        <td className="p-4 text-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleSelectRow(m.userId)}
                          />
                        </td>
                        <td 
                          className="p-4 cursor-pointer" 
                          onClick={() => handleOpenEdit(m)}
                        >
                          <div className="flex items-center gap-3">
                            {m.photo ? (
                              <img src={getImageUrl(m.photo)} className="h-9 w-9 rounded-full object-cover border shadow-sm" alt="" />
                            ) : (
                              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border uppercase text-xs">
                                {m.name ? m.name.slice(0, 2) : "??"}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-foreground flex items-center gap-1.5">
                                {m.name}
                                {m.featured && <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">★</span>}
                                {m.premium && <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                              </p>
                              <p className="text-xs text-muted-foreground font-medium">{m.profession || "Not Specified"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-muted-foreground">{m.id}</td>
                        <td className="p-4">{getCity(m.city)}{m.state ? `, ${m.state}` : ''}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${m.premium ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}>
                            {m.premium ? "Premium" : "Free"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 text-xs font-medium">
                            <Coins className="h-3 w-3 text-amber-500" />
                            {m.credits ?? 0}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${m.verified ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                            {m.verified ? (
                              <>
                                <ShieldCheck className="h-3 w-3 mr-0.5" />
                                Verified
                              </>
                            ) : (
                              "Unverified"
                            )}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="rounded-md p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36 shadow-lg border rounded-xl p-1">
                              <DropdownMenuItem 
                                onClick={() => handleOpenEdit(m)}
                                className="gap-2 cursor-pointer rounded-lg text-sm"
                              >
                                <Edit className="h-4 w-4" /> Edit details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setPasswordUser(m);
                                  setNewPassword("");
                                  setIsChangingPassword(true);
                                }}
                                className="gap-2 cursor-pointer rounded-lg text-sm"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg> Change password
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteSingle(m.userId)}
                                className="gap-2 cursor-pointer rounded-lg text-sm text-destructive focus:text-destructive focus:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" /> Delete user
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between border-t p-4 bg-muted/20">
              <span className="text-xs text-muted-foreground font-medium">
                Page {meta.current_page} of {meta.last_page} ({meta.total} users)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                  disabled={page === meta.last_page}
                  className="shadow-sm"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Slide-over Drawer */}
      <Sheet open={isEditing} onOpenChange={setIsEditing}>
        <SheetContent className="w-full lg:max-w-[100vw] h-full flex flex-col p-6 border-l shadow-2xl">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="font-display text-2xl font-bold flex items-center gap-2">
              Edit User Profile
              {activeUser && (
                <span className="text-xs font-mono font-normal bg-muted px-2 py-0.5 rounded text-muted-foreground">
                  {activeUser.id}
                </span>
              )}
            </SheetTitle>
            <SheetDescription>
              Modify member details. Toggle premium and verification flags manually.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSave} className="flex-1 overflow-y-auto py-4 pr-1 max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
              
              {/* LEFT COLUMN: Profile Visual Summary Card */}
              <div className="space-y-6 lg:sticky lg:top-0">
                <div className="rounded-3xl border shadow-soft overflow-hidden bg-card">
                  {/* Photo Container */}
                  <div className="relative aspect-[4/5] bg-muted group">
                    <img 
                      src={getImageUrl(photo) || (gender?.toLowerCase() === "female" ? "/avatar-female.png" : "/avatar-male.png")} 
                      className="w-full h-full object-cover object-top" 
                      alt="User Profile" 
                      onError={(e) => {
                        e.currentTarget.src = gender?.toLowerCase() === "female" ? "/avatar-female.png" : "/avatar-male.png";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="rounded-full shadow-md gap-1.5"
                        disabled={isUploadingPhoto}
                        onClick={() => document.getElementById("admin-photo-upload")?.click()}
                      >
                        {isUploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        Change Photo
                      </Button>
                    </div>
                    {/* Top Right Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                      {premium && (
                        <span className="flex items-center gap-1 rounded-full gradient-gold px-2.5 py-1 text-[10px] font-bold text-gold-foreground shadow-soft">
                          <Crown className="h-3.5 w-3.5" /> Premium
                        </span>
                      )}
                      {verified && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500 text-white px-2.5 py-1 text-[10px] font-bold shadow-soft">
                          <ShieldCheck className="h-3.5 w-3.5" /> Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Profile Vital Stats */}
                  <div className="p-5 border-t space-y-4">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{name || "Unnamed"}</h2>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{activeUser?.id || "N/A"}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="bg-muted/40 p-2.5 rounded-xl">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Gender</p>
                        <p className="font-semibold text-foreground mt-0.5 capitalize">{gender || "Not Specified"}</p>
                      </div>
                      <div className="bg-muted/40 p-2.5 rounded-xl">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">DOB</p>
                        <p className="font-semibold text-foreground mt-0.5">{dob || "Not Specified"}</p>
                      </div>
                      <div className="bg-muted/40 p-2.5 rounded-xl">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Caste</p>
                        <p className="font-semibold text-foreground mt-0.5 truncate">{community || "Other"}</p>
                      </div>
                      <div className="bg-muted/40 p-2.5 rounded-xl">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">City</p>
                        <p className="font-semibold text-foreground mt-0.5 truncate">{city || "Not Specified"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photo Gallery Visual Card */}
                <div className="rounded-3xl border shadow-soft bg-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5 font-bold text-sm">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      Gallery Pictures
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl shadow-sm text-xs"
                      disabled={isUploadingGallery}
                      onClick={() => document.getElementById("admin-gallery-upload")?.click()}
                    >
                      {isUploadingGallery ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                      Add Photos
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {gallery.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border shadow-sm group">
                        <img src={url} className="w-full h-full object-cover" alt="" />
                        <button
                          type="button"
                          onClick={() => setGallery((prev) => prev.filter((_, i) => i !== index))}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {gallery.length === 0 && (
                      <p className="col-span-full py-4 text-center text-[11px] text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                        No gallery photos added yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Edit Form Fields */}
              <div className="space-y-6">
                
                {/* Hidden input wrappers for file triggers */}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="admin-photo-upload"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploadingPhoto(true);
                    const formData = new FormData();
                    formData.append("image", file);
                    try {
                      const res = await api.post<any>("/admin/upload", formData);
                      setPhoto(res.url);
                      toast.success("Profile photo uploaded!");
                    } catch (err: any) {
                      toast.error(err.message || "Upload failed");
                    } finally {
                      setIsUploadingPhoto(false);
                    }
                  }}
                />
                
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  id="admin-gallery-upload"
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (!files || files.length === 0) return;
                    setIsUploadingGallery(true);
                    try {
                      const uploadedUrls: string[] = [];
                      for (let i = 0; i < files.length; i++) {
                        const formData = new FormData();
                        formData.append("image", files[i]);
                        const res = await api.post<any>("/admin/upload", formData);
                        uploadedUrls.push(res.url);
                      }
                      setGallery((prev) => [...prev, ...uploadedUrls]);
                      toast.success("Gallery pictures uploaded!");
                    } catch (err: any) {
                      toast.error(err.message || "Upload failed");
                    } finally {
                      setIsUploadingGallery(false);
                    }
                  }}
                />

                {/* Account Info Form Card */}
                <div className="rounded-3xl border bg-card p-6 shadow-soft space-y-4">
                  <h3 className="font-semibold text-sm tracking-wider uppercase text-primary border-b pb-1">Account Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input 
                    id="edit-name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-email">Email Address</Label>
                  <Input 
                    id="edit-email" 
                    type="text" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input 
                    id="edit-phone" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="edit-gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-dob">Date of Birth</Label>
                  <Input 
                    id="edit-dob" 
                    type="date" 
                    value={dob} 
                    onChange={(e) => setDob(e.target.value)} 
                  />
                </div>
                {/* TOB field removed */}
              </div>
            </div>

            {/* Status & Privileges */}
            <div className="space-y-4 bg-muted/30 p-5 rounded-2xl border">
              <h3 className="font-semibold text-sm tracking-wider uppercase text-primary border-b pb-1">Status & Privileges</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="flex items-center justify-between border bg-card p-3.5 rounded-xl shadow-sm">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-1.5 cursor-pointer text-sm font-semibold" htmlFor="edit-premium">
                      <Crown className="h-4 w-4 text-amber-500 fill-amber-500" />
                      Premium Member
                    </Label>
                    <p className="text-[11px] text-muted-foreground">Grant unlock credits and highlighted badges.</p>
                  </div>
                  <Switch 
                    id="edit-premium" 
                    checked={premium} 
                    onCheckedChange={(checked) => {
                      setPremium(checked);
                      if (!checked) setSelectedPlanId("free");
                    }} 
                  />
                </div>
                
                <div className="space-y-1.5 bg-card border p-3.5 rounded-xl shadow-sm">
                  <Label htmlFor="edit-plan" className="text-xs font-semibold">Membership Plan</Label>
                  <Select 
                    value={selectedPlanId} 
                    onValueChange={(val) => {
                      setSelectedPlanId(val);
                      setPremium(val !== "free");
                    }}
                  >
                    <SelectTrigger id="edit-plan" className="h-9">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free Plan (Basic)</SelectItem>
                      {plans.map((p: any) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name} (₹{p.price} / {p.period})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">

                {/* Credit Management */}
                <div className="border-t pt-3 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Coins className="h-3.5 w-3.5 text-amber-500" />
                    Credits &amp; Quotas
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-2 border">
                      <p className="font-bold text-lg text-amber-600">{userCredits}</p>
                      <p className="text-muted-foreground">Interest Credits</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-2 border">
                      <p className="font-bold text-lg text-blue-600">{userContactQuota}</p>
                      <p className="text-muted-foreground">Contact Quota</p>
                    </div>
                    <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-2 border">
                      <p className="font-bold text-lg text-green-600">{userMessageQuota}</p>
                      <p className="text-muted-foreground">Message Quota</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><Input type="number" min="0" placeholder="+Credits" value={addCreditsInput} onChange={e => setAddCreditsInput(e.target.value)} className="h-8 text-xs" /></div>
                    <div><Input type="number" min="0" placeholder="+Contact" value={addContactInput} onChange={e => setAddContactInput(e.target.value)} className="h-8 text-xs" /></div>
                    <div><Input type="number" min="0" placeholder="+Message" value={addMessageInput} onChange={e => setAddMessageInput(e.target.value)} className="h-8 text-xs" /></div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    disabled={addCreditsMutation.isPending || (!addCreditsInput && !addContactInput && !addMessageInput)}
                    onClick={() => {
                      if (!activeUser) return;
                      addCreditsMutation.mutate({
                        id: activeUser.userId,
                        data: {
                          credits: parseInt(addCreditsInput) || 0,
                          contact_quota: parseInt(addContactInput) || 0,
                          message_quota: parseInt(addMessageInput) || 0,
                        },
                      });
                    }}
                  >
                    {addCreditsMutation.isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Coins className="mr-1 h-3 w-3" />}
                    Add to Balance
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-1.5 cursor-pointer" htmlFor="edit-featured">
                      <span className="text-purple-500 font-bold">★</span>
                      Featured Profile
                    </Label>
                    <p className="text-xs text-muted-foreground">Show this profile on the homepage featured section.</p>
                  </div>
                  <Switch 
                    id="edit-featured" 
                    checked={featured} 
                    onCheckedChange={setFeatured} 
                  />
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-1.5 cursor-pointer" htmlFor="edit-verified">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      Verified Profile
                    </Label>
                    <p className="text-xs text-muted-foreground">Indicate government ID or phone validation completed.</p>
                  </div>
                  <Switch 
                    id="edit-verified" 
                    checked={verified} 
                    onCheckedChange={setVerified} 
                  />
                </div>
              </div>
            </div>

            {/* Religious Background */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm tracking-wider uppercase text-primary border-b pb-1">Religious Background</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-religion">Religion</Label>
                  <Select value={religion} onValueChange={setReligion}>
                    <SelectTrigger id="edit-religion">
                      <SelectValue placeholder="Select religion" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELIGIONS.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-community">Community / Caste</Label>
                  <Select value={community} onValueChange={setCommunity}>
                    <SelectTrigger id="edit-community">
                      <SelectValue placeholder="Select community" />
                    </SelectTrigger>
                    <SelectContent>
                      {CASTES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-mothertongue">Mother Tongue</Label>
                  <Input 
                    id="edit-mothertongue" 
                    value={motherTongue} 
                    onChange={(e) => setMotherTongue(e.target.value)} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-height">Height</Label>
                  <Input 
                    id="edit-height" 
                    value={height} 
                    onChange={(e) => setHeight(e.target.value)} 
                    placeholder="e.g. 5ft 8in"
                  />
                </div>
              </div>
            </div>

            {/* Location & Career */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm tracking-wider uppercase text-primary border-b pb-1">Location & Career</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-city">City</Label>
                  <Input 
                    id="edit-city" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-state">State</Label>
                  <Input 
                    id="edit-state" 
                    value={state} 
                    onChange={(e) => setState(e.target.value)} 
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="edit-education">Education</Label>
                  <Input 
                    id="edit-education" 
                    value={education} 
                    onChange={(e) => setEducation(e.target.value)} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-profession">Profession</Label>
                  <Input 
                    id="edit-profession" 
                    value={profession} 
                    onChange={(e) => setProfession(e.target.value)} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-income">Annual Income</Label>
                  <Input 
                    id="edit-income" 
                    value={income} 
                    onChange={(e) => setIncome(e.target.value)} 
                    placeholder="e.g. ₹12 LPA"
                  />
                </div>
              </div>
            </div>

            {/* Bio & Marriage details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm tracking-wider uppercase text-primary border-b pb-1">Bio & Personal Status</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-marital">Marital Status</Label>
                  <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                    <SelectTrigger id="edit-marital">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Never Married">Never Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                      <SelectItem value="Awaiting Divorce">Awaiting Divorce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-bio">Bio Details</Label>
                  <Textarea 
                    id="edit-bio" 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Horoscope Details (removed rasi/nakshatram) */}

            {/* Family Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm tracking-wider uppercase text-primary border-b pb-1">Family Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-father">Father's Name</Label>
                  <Input id="edit-father" value={father} onChange={(e) => setFather(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-mother">Mother's Name</Label>
                  <Input id="edit-mother" value={mother} onChange={(e) => setMother(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-siblings">Sibling Details</Label>
                  <Input id="edit-siblings" value={siblings} onChange={(e) => setSiblings(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-family-status">Family Status</Label>
                  <Select value={familyStatus} onValueChange={setFamilyStatus}>
                    <SelectTrigger id="edit-family-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Middle Class">Middle Class</SelectItem>
                      <SelectItem value="Upper Middle Class">Upper Middle Class</SelectItem>
                      <SelectItem value="Rich / Affluent">Rich / Affluent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Partner Preferences */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm tracking-wider uppercase text-primary border-b pb-1">Partner Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-pref-age">Age Range</Label>
                  <Select value={prefAgeRange} onValueChange={setPrefAgeRange}>
                    <SelectTrigger id="edit-pref-age">
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      {["18-25","25-30","30-35","35-40","40-45","45-50","50+"].map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-pref-height">Height Range</Label>
                  <Select value={prefHeightRange} onValueChange={setPrefHeightRange}>
                    <SelectTrigger id="edit-pref-height">
                      <SelectValue placeholder="Select height range" />
                    </SelectTrigger>
                    <SelectContent>
                      {["4ft-5ft","5ft-5ft6in","5ft6in-6ft","6ft+"].map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-pref-religion">Religion</Label>
                  <Select value={prefReligion} onValueChange={setPrefReligion}>
                    <SelectTrigger id="edit-pref-religion">
                      <SelectValue placeholder="Select religion" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELIGIONS.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-pref-community">Community</Label>
                  <Input id="edit-pref-community" value={prefCommunity} onChange={(e) => setPrefCommunity(e.target.value)} placeholder="Any" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-pref-education">Education</Label>
                  <Select value={prefEducation} onValueChange={setPrefEducation}>
                    <SelectTrigger id="edit-pref-education">
                      <SelectValue placeholder="Select education" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-pref-profession">Profession</Label>
                  <Select value={prefProfession} onValueChange={setPrefProfession}>
                    <SelectTrigger id="edit-pref-profession">
                      <SelectValue placeholder="Select profession" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFESSIONS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="edit-pref-location">Preferred Location</Label>
                  <Input id="edit-pref-location" value={prefLocation} onChange={(e) => setPrefLocation(e.target.value)} placeholder="e.g. Chennai, Bangalore" />
                </div>
              </div>
            </div>

              </div>
            </div>

            <div className="pt-4 border-t flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="gradient-rose text-white"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Change Password Dialog */}
      <Sheet open={isChangingPassword} onOpenChange={(open) => { if (!open) { setIsChangingPassword(false); setPasswordUser(null); setNewPassword(""); } }}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="font-display text-xl font-bold">Change Password</SheetTitle>
            <SheetDescription>
              Set a new password for <span className="font-semibold text-foreground">{passwordUser?.name}</span> ({passwordUser?.id})
            </SheetDescription>
          </SheetHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newPassword || newPassword.length < 8) {
                toast.error("Password must be at least 8 characters");
                return;
              }
              changePasswordMutation.mutate({ id: passwordUser?.userId, password: newPassword });
            }}
            className="py-6 space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
              />
            </div>
            <SheetFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => { setIsChangingPassword(false); setPasswordUser(null); setNewPassword(""); }}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-rose text-white" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending ? (
                  <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Changing...</>
                ) : "Change Password"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Create User Dialog */}
      <Sheet open={isCreatingUser} onOpenChange={(open) => { if (!open) { setIsCreatingUser(false); setCreateName(""); setCreateEmail(""); setCreatePhone(""); setCreateGender("male"); setCreatePassword(""); setCreateDob(""); setCreateReligionId(null); setCreateCasteId(null); setCreateStateId(null); setCreateCityId(null); } }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="font-display text-xl font-bold">Create User Profile</SheetTitle>
            <SheetDescription>On-board a new member manually with religion, caste, and location.</SheetDescription>
          </SheetHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!createName || !createEmail || !createPhone || !createPassword) {
                toast.error("Please fill in all required fields");
                return;
              }
              if (createPassword.length < 8) {
                toast.error("Password must be at least 8 characters");
                return;
              }
              if (!createReligionId || !createCasteId || !createStateId || !createCityId) {
                toast.error("Please select religion, caste, state, and city");
                return;
              }
              createUserMutation.mutate({
                name: createName,
                email: createEmail,
                phone: createPhone,
                gender: createGender,
                password: createPassword,
                dob: createDob || undefined,
                religion_id: createReligionId,
                caste_id: createCasteId,
                state_id: createStateId,
                city_id: createCityId,
              });
            }}
            className="py-6 space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="create-name">Full Name *</Label>
                <Input id="create-name" value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="e.g. Rajesh Kumar" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-email">Email Address *</Label>
                <Input id="create-email" type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} placeholder="rajesh@example.com" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-phone">Phone Number *</Label>
                <Input id="create-phone" value={createPhone} onChange={(e) => setCreatePhone(e.target.value)} placeholder="9876543210" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-gender">Gender *</Label>
                <Select value={createGender} onValueChange={setCreateGender}>
                  <SelectTrigger id="create-gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-dob">Date of Birth</Label>
                <Input id="create-dob" type="date" value={createDob} onChange={(e) => setCreateDob(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-password">Temporary Password *</Label>
                <Input id="create-password" type="password" value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} placeholder="Minimum 8 characters" required />
              </div>
              <MemberProfileFields
                religionId={createReligionId}
                casteId={createCasteId}
                stateId={createStateId}
                cityId={createCityId}
                onReligionChange={setCreateReligionId}
                onCasteChange={setCreateCasteId}
                onStateChange={setCreateStateId}
                onCityChange={setCreateCityId}
                required
              />
            </div>
            <SheetFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreatingUser(false)}>Cancel</Button>
              <Button type="submit" className="gradient-rose text-white" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? (
                  <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Creating...</>
                ) : "Create Member Profile"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Bulk Add Users Drawer */}
      <Sheet open={isBulkAdding} onOpenChange={(open) => { if (!open) { setIsBulkAdding(false); setBulkUsers([{ name: "", email: "", phone: "", gender: "male", password: "", dob: "", religion: "", community: "", state: "", city: "", mother_tongue: "", profile_pic: "", profile_pic_file: null }]); } }}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="font-display text-xl font-bold">Bulk Add Users</SheetTitle>
            <SheetDescription>Add multiple users at once with selectable fields. Fill in the details below.</SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-6">
            {bulkUsers.map((u, idx) => (
              <div key={idx} className="rounded-2xl border bg-card p-5 space-y-4 relative">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{idx + 1}</span>
                    User #{idx + 1}
                  </h3>
                  {bulkUsers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setBulkUsers(bulkUsers.filter((_, i) => i !== idx))}
                      className="text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Full Name *</Label>
                    <Input value={u.name} onChange={(e) => { const copy = [...bulkUsers]; copy[idx] = { ...copy[idx], name: e.target.value }; setBulkUsers(copy); }} placeholder="e.g. Rajesh Kumar" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email *</Label>
                    <Input type="email" value={u.email} onChange={(e) => { const copy = [...bulkUsers]; copy[idx] = { ...copy[idx], email: e.target.value }; setBulkUsers(copy); }} placeholder="rajesh@example.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone *</Label>
                    <Input value={u.phone} onChange={(e) => { const copy = [...bulkUsers]; copy[idx] = { ...copy[idx], phone: e.target.value }; setBulkUsers(copy); }} placeholder="9876543210" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Gender *</Label>
                    <select className="field" value={u.gender} onChange={(e) => { const copy = [...bulkUsers]; copy[idx] = { ...copy[idx], gender: e.target.value }; setBulkUsers(copy); }}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>DOB</Label>
                    <Input type="date" value={u.dob} onChange={(e) => { const copy = [...bulkUsers]; copy[idx] = { ...copy[idx], dob: e.target.value }; setBulkUsers(copy); }} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Password</Label>
                    <Input type="password" value={u.password} onChange={(e) => { const copy = [...bulkUsers]; copy[idx] = { ...copy[idx], password: e.target.value }; setBulkUsers(copy); }} placeholder="Min 8 chars (auto if empty)" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Religion</Label>
                    <select className="field" value={u.religion} onChange={(e) => { const copy = [...bulkUsers]; copy[idx] = { ...copy[idx], religion: e.target.value, community: "" }; setBulkUsers(copy); }}>
                      <option value="">Select</option>
                      {RELIGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Caste / Community</Label>
                    <select className="field" value={u.community} onChange={(e) => { const copy = [...bulkUsers]; copy[idx] = { ...copy[idx], community: e.target.value }; setBulkUsers(copy); }}>
                      <option value="">Select</option>
                      {(u.religion ? (RELIGION_CASTE_MAP[u.religion] || ["Other"]) : CASTES).map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>State</Label>
                    <Input value={u.state} onChange={(e) => { const copy = [...bulkUsers]; copy[idx] = { ...copy[idx], state: e.target.value }; setBulkUsers(copy); }} placeholder="e.g. Tamil Nadu" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>City</Label>
                    <Input value={u.city} onChange={(e) => { const copy = [...bulkUsers]; copy[idx] = { ...copy[idx], city: e.target.value }; setBulkUsers(copy); }} placeholder="e.g. Chennai" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Mother Tongue</Label>
                    <select className="field" value={u.mother_tongue} onChange={(e) => { const copy = [...bulkUsers]; copy[idx] = { ...copy[idx], mother_tongue: e.target.value }; setBulkUsers(copy); }}>
                      <option value="">Select</option>
                      {["Tamil", "Telugu", "Kannada", "Malayalam", "Hindi", "English", "Urdu", "Other"].map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Profile Photo</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id={`bulk-photo-${idx}`}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const copy = [...bulkUsers];
                          copy[idx] = { ...copy[idx], profile_pic_file: file };
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            copy[idx] = { ...copy[idx], profile_pic_preview: ev.target?.result as string };
                            setBulkUsers([...copy]);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                      <label htmlFor={`bulk-photo-${idx}`} className="cursor-pointer">
                        {u.profile_pic_preview ? (
                          <div className="relative h-14 w-14 rounded-xl overflow-hidden border">
                            <img src={u.profile_pic_preview} alt="" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); const copy = [...bulkUsers]; copy[idx] = { ...copy[idx], profile_pic_file: null, profile_pic_preview: "" }; setBulkUsers(copy); }}
                              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed bg-muted/50 hover:bg-muted transition-colors">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={() => setBulkUsers([...bulkUsers, { name: "", email: "", phone: "", gender: "male", password: "", dob: "", religion: "", community: "", state: "", city: "", mother_tongue: "", profile_pic: "", profile_pic_file: null, profile_pic_preview: "" }])}
              className="w-full border-dashed"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Add Another User
            </Button>
          </div>

          <SheetFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => { setIsBulkAdding(false); setBulkUsers([{ name: "", email: "", phone: "", gender: "male", password: "", dob: "", religion: "", community: "", state: "", city: "", mother_tongue: "", profile_pic: "", profile_pic_file: null }]); }}>
              Cancel
            </Button>
            <Button
              className="gradient-rose text-white"
              disabled={isBulkSubmitting}
              onClick={async () => {
                const valid = bulkUsers.filter((u) => u.name && u.email && u.phone);
                if (valid.length === 0) {
                  toast.error("At least one user with name, email, and phone is required");
                  return;
                }

                setIsBulkSubmitting(true);
                try {
                  // Upload images first
                  const usersWithPics = await Promise.all(
                    valid.map(async (u) => {
                      if (u.profile_pic_file) {
                        const formData = new FormData();
                        formData.append("image", u.profile_pic_file);
                        formData.append("type", "profile");
                        const res = await api.post("/admin/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
                        return { ...u, profile_pic: res.url };
                      }
                      return u;
                    })
                  );

                  // Clean up for API
                  const payload = usersWithPics.map(({ profile_pic_file, profile_pic_preview, ...rest }) => rest);

                  const res = await api.post("/admin/bulk-upload-users", { users: payload });
                  toast.success(res.message || "Users created successfully");
                  setIsBulkAdding(false);
                  setBulkUsers([{ name: "", email: "", phone: "", gender: "male", password: "", dob: "", religion: "", community: "", state: "", city: "", mother_tongue: "", profile_pic: "", profile_pic_file: null }]);
                  queryClient.invalidateQueries({ queryKey: ["admin-users"] });
                } catch (err: any) {
                  toast.error(err.message || "Failed to create users");
                } finally {
                  setIsBulkSubmitting(false);
                }
              }}
            >
              {isBulkSubmitting ? (
                <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Creating...</>
              ) : (
                `Create ${bulkUsers.filter((u) => u.name && u.email && u.phone).length} User(s)`
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

    </AdminLayout>
  );
}
