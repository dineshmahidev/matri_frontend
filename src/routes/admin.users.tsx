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
  Coins
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
} from "@/components/ui/dropdown-menu";
import { StatusPill } from "./admin.index";
import { RELIGIONS, CASTES, RELIGION_CASTE_MAP, OPTION_TRANSLATIONS } from "@/data/castes";
import { RASIS, NAKSHATRAMS, RASI_NAKSHATRAM_MAP } from "@/data/astrology";
import { EDUCATION_LEVELS, PROFESSIONS } from "@/data/education";
import { MemberProfileFields } from "@/components/matrimony/MemberProfileFields";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
  component: AdminUsers,
});

function AdminUsers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [hasPhoto, setHasPhoto] = useState("all");
  const [hasGallery, setHasGallery] = useState("all");
  const [hasPremium, setHasPremium] = useState("all");
  const [hasFeatured, setHasFeatured] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeUser, setActiveUser] = useState<any>(null);

  // Form states for edit drawer
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("");
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

  // Horoscope fields
  const [rasi, setRasi] = useState("");
  const [nakshatram, setNakshatram] = useState("");

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

  // Fetch available plans
  const { data: plansData } = useQuery<any[]>({
    queryKey: ["admin-plans-list"],
    queryFn: () => api.get<any>("/admin/plans"),
  });
  const plans = plansData || [];

  // Fetch users (paginated)
  const { data: usersResponse, isLoading } = useQuery<any>({
    queryKey: ["admin-users", page, search, hasPhoto, hasGallery, hasPremium, hasFeatured],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (hasPhoto !== "all") params.set("has_photo", hasPhoto);
      if (hasGallery !== "all") params.set("has_gallery", hasGallery);
      if (hasPremium !== "all") params.set("premium", hasPremium);
      if (hasFeatured !== "all") params.set("featured", hasFeatured);
      return api.get<any>(`/admin/users?${params.toString()}`);
    },
  });

  const users = usersResponse?.data || [];
  const meta = usersResponse?.meta;

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
    setTob(user.tob || "");
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
    setRasi(user.rasi || "");
    setNakshatram(user.nakshatram || "");
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
        tob,
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
        rasi,
        nakshatram,
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
            <p className="text-sm text-muted-foreground">
              {meta ? `${meta.total} total users` : "Loading users..."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <Button 
                onClick={handleBulkDelete} 
                variant="destructive"
                className="shadow-soft"
                disabled={bulkDeleteMutation.isPending}
              >
                {bulkDeleteMutation.isPending ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-1.5 h-4 w-4" />
                )}
                Delete Selected ({selectedIds.length})
              </Button>
            )}
            <Button onClick={() => setIsCreatingUser(true)} className="gradient-rose text-white shadow-soft">
              <Plus className="mr-1.5 h-4 w-4" /> Add user
            </Button>
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
                              <img src={m.photo} className="h-9 w-9 rounded-full object-cover border shadow-sm" alt="" />
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
                        <td className="p-4">{m.city ? `${m.city}, ${m.state}` : "N/A"}</td>
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
        <SheetContent className="w-full sm:max-w-xl h-full flex flex-col p-6 border-l shadow-2xl max-w-full">
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

          <form onSubmit={handleSave} className="flex-1 overflow-y-auto py-4 pr-1 space-y-6">
            {/* Account Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm tracking-wider uppercase text-primary border-b pb-1">Account Info</h3>
              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="edit-photo">Profile Photo</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="edit-photo" 
                      value={photo} 
                      onChange={(e) => setPhoto(e.target.value)} 
                      placeholder="URL to profile picture"
                      className="flex-1"
                    />
                    <div className="relative">
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
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUploadingPhoto}
                        onClick={() => document.getElementById("admin-photo-upload")?.click()}
                      >
                        {isUploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  {photo && (
                    <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border shadow-sm group">
                      <img src={photo} className="w-full h-full object-cover" alt="Profile" />
                      <button
                        type="button"
                        onClick={() => setPhoto("")}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Gallery Section */}
                <div className="space-y-2 col-span-2 border-t pt-4 mt-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      Gallery Pictures
                    </Label>
                    <div className="relative">
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
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploadingGallery}
                        onClick={() => document.getElementById("admin-gallery-upload")?.click()}
                      >
                        {isUploadingGallery ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
                        Add Photos
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mt-2">
                    {gallery.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden border shadow-sm group">
                        <img src={url} className="w-full h-full object-cover" alt={`Gallery ${index}`} />
                        <button
                          type="button"
                          onClick={() => setGallery((prev) => prev.filter((_, i) => i !== index))}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    {gallery.length === 0 && (
                      <p className="col-span-full py-4 text-center text-xs text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                        No gallery photos added yet.
                      </p>
                    )}
                  </div>
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
                <div className="space-y-1.5">
                  <Label htmlFor="edit-tob">Time of Birth</Label>
                  <Input 
                    id="edit-tob" 
                    type="time" 
                    value={tob} 
                    onChange={(e) => setTob(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            {/* Status & Privileges */}
            <div className="space-y-4 bg-muted/30 p-4 rounded-2xl border">
              <h3 className="font-semibold text-sm tracking-wider uppercase text-primary border-b pb-1">Status & Privileges</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-1.5 cursor-pointer" htmlFor="edit-premium">
                      <Crown className="h-4 w-4 text-amber-500 fill-amber-500" />
                      Premium Member
                    </Label>
                    <p className="text-xs text-muted-foreground">Grant unlock credits and highlighted badges.</p>
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
                
                <div className="space-y-1.5 border-t pt-3">
                  <Label htmlFor="edit-plan">Membership Plan</Label>
                  <Select 
                    value={selectedPlanId} 
                    onValueChange={(val) => {
                      setSelectedPlanId(val);
                      setPremium(val !== "free");
                    }}
                  >
                    <SelectTrigger id="edit-plan">
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
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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

            {/* Horoscope Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm tracking-wider uppercase text-primary border-b pb-1">Horoscope Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-rasi">Rasi (Moon Sign)</Label>
                  <Select value={rasi} onValueChange={(v) => { setRasi(v); setNakshatram(""); }}>
                    <SelectTrigger id="edit-rasi">
                      <SelectValue placeholder="Select Rasi" />
                    </SelectTrigger>
                    <SelectContent>
                      {RASIS.map((r) => (
                        <SelectItem key={r.en} value={r.en}>{r.en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-nakshatram">Nakshatram (Birth Star)</Label>
                  <Select value={nakshatram} onValueChange={setNakshatram}>
                    <SelectTrigger id="edit-nakshatram">
                      <SelectValue placeholder="Select Nakshatram" />
                    </SelectTrigger>
                    <SelectContent>
                      {(rasi ? (RASI_NAKSHATRAM_MAP[rasi] || []) : NAKSHATRAMS.map(n => n.en)).map((nName: string) => (
                        <SelectItem key={nName} value={nName}>{nName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Family Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm tracking-wider uppercase text-primary border-b pb-1">Family Details</h3>
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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
    </AdminLayout>
  );
}
