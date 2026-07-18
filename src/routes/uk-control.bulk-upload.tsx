import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AppLayouts";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, FileSpreadsheet, Image, CheckCircle2, AlertCircle, X, ChevronDown, ChevronUp } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import JSZip from "jszip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/uk-control/bulk-upload")({
  head: () => ({ meta: [{ title: "Bulk Upload Users — Admin" }] }),
  component: BulkUpload,
});

function BulkUpload() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [parsedUsers, setParsedUsers] = useState<any[]>([]);
  const [step, setStep] = useState<"upload" | "preview" | "result">("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentProgressMsg, setCurrentProgressMsg] = useState("");
  const [results, setResults] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isCancelledRef = useRef<boolean>(false);

  const uploadMutation = useMutation({
    mutationFn: (users: any[]) => api.post("/admin/bulk-upload-users", { users }),
    onSuccess: (data: any) => {
      setResults(data);
      setStep("result");
      toast.success(data.message || "Users created successfully");

      // Auto download skipped duplicates
      if (data.skipped && data.skipped.length > 0) {
        const json = JSON.stringify(data.skipped, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `skipped_duplicates_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.info(`${data.skipped.length} duplicate users skipped. File downloaded.`);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to upload users");
    },
  });

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        let users: any[] = [];

        if (file.name.endsWith(".json")) {
          users = JSON.parse(text);
        } else if (file.name.endsWith(".csv")) {
          const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
          if (lines.length < 2) {
            toast.error("CSV file must have a header row and at least one data row");
            return;
          }
          const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
          users = lines.slice(1).map((line) => {
            const values = line.split(",").map((v) => v.trim());
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = values[index] || "";
            });
            return obj;
          });
        } else {
          toast.error("Please upload a CSV or JSON file");
          return;
        }

        if (users.length === 0) {
          toast.error("No users found in file");
          return;
        }

        const validUsers = users.filter((u) => u.name && u.email && u.phone && u.gender);
        if (validUsers.length === 0) {
          toast.error("Each user must have name, email, phone, and gender columns");
          return;
        }

        setParsedUsers(validUsers);
        setStep("preview");
        toast.success(`Parsed ${validUsers.length} users from file`);
      } catch (err: any) {
        toast.error("Failed to parse file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const newImages: File[] = [];

    setIsProcessing(true);
    setCurrentProgressMsg("Parsing uploaded files...");

    try {
      for (const file of fileArray) {
        if (file.name.toLowerCase().endsWith(".zip")) {
          setCurrentProgressMsg(`Extracting image ZIP: ${file.name}...`);
          const zip = new JSZip();
          const zipContent = await zip.loadAsync(file);
          
          let count = 0;
          const totalFiles = Object.keys(zipContent.files).length;
          
          for (const [relativePath, zipEntry] of Object.entries(zipContent.files)) {
            count++;
            if (zipEntry.dir) continue;
            
            const ext = relativePath.split(".").pop()?.toLowerCase();
            if (ext && ["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
              // Extract file to blob
              const blob = await zipEntry.async("blob");
              const baseName = relativePath.split("/").pop() || relativePath;
              const filename = decodeURIComponent(baseName);
              const extractedFile = new File([blob], filename, { type: `image/${ext === "jpg" ? "jpeg" : ext}` });
              newImages.push(extractedFile);
            }

            if (count % 20 === 0) {
              setUploadProgress(Math.round((count / totalFiles) * 100));
            }
          }
          toast.success(`Extracted ${newImages.length} images from ${file.name}`);
        } else {
          newImages.push(file);
        }
      }

      setImageFiles((prev) => [...prev, ...newImages]);
    } catch (err: any) {
      toast.error("Failed to parse ZIP archive: " + err.message);
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
      setCurrentProgressMsg("");
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getImageUrl = (filename: string): string | null => {
    const cleanFilename = decodeURIComponent(filename.split("?")[0].split("/").pop() || filename);
    const match = imageFiles.find((f) =>
      f.name.toLowerCase() === cleanFilename.toLowerCase() ||
      f.name.toLowerCase().replace(/\.[^.]+$/, "") === cleanFilename.toLowerCase().replace(/\.[^.]+$/, "")
    );
    if (!match) return null;
    return URL.createObjectURL(match);
  };

  const handleUploadImages = async (users: any[]): Promise<any[]> => {
    const enrichedUsers = [...users];
    const total = enrichedUsers.length;

    for (let i = 0; i < total; i++) {
      if (isCancelledRef.current) {
        throw new Error("Upload cancelled by administrator.");
      }

      const user = enrichedUsers[i];
      const pct = Math.round((i / total) * 100);
      setUploadProgress(pct);
      setCurrentProgressMsg(`Uploading images for user ${i + 1} of ${total}: ${user.name}...`);

      // Upload profile picture
      if (user.profile_pic_filename || user.photo_filename) {
        const rawFilename = user.profile_pic_filename || user.photo_filename;
        // Clean filename: strip URLs, folder paths, query strings, decode spaces
        const filename = decodeURIComponent(rawFilename.split("?")[0].split("/").pop() || rawFilename);
        
        const match = imageFiles.find((f) =>
          f.name.toLowerCase() === filename.toLowerCase() ||
          f.name.toLowerCase().replace(/\.[^.]+$/, "") === filename.toLowerCase().replace(/\.[^.]+$/, "")
        );
        if (match) {
          try {
            const formData = new FormData();
            formData.append("image", match);
            formData.append("type", "profile");
            const res = await api.post<any>("/admin/upload", formData);
            user.profile_pic = res.url;
          } catch (err: any) {
            const errorMsg = `Photo "${filename}" for user ${user.name}: ${err.message || "Unknown error"}`;
            console.error(`Failed to upload photo "${filename}" for user ${user.name}`, err);
            setUploadErrors((prev) => [...prev, errorMsg]);
            toast.error(errorMsg);
          }
        } else {
          const errorMsg = `Missing file: Photo "${filename}" referenced by user ${user.name} is not selected or uploaded.`;
          setUploadErrors((prev) => [...prev, errorMsg]);
        }
      }

      // Upload gallery images
      if (user.gallery_filenames) {
        let filenames: string[] = [];
        try {
          filenames = typeof user.gallery_filenames === "string"
            ? JSON.parse(user.gallery_filenames)
            : user.gallery_filenames;
        } catch {
          filenames = user.gallery_filenames.split(";").map((s: string) => s.trim()).filter(Boolean);
        }

        const galleryUrls: string[] = [];
        for (const rawGFilename of filenames) {
          // Clean filename: strip URLs, folder paths, query strings, decode spaces
          const gFilename = decodeURIComponent(rawGFilename.split("?")[0].split("/").pop() || rawGFilename);
          
          const match = imageFiles.find((f) =>
            f.name.toLowerCase() === gFilename.toLowerCase() ||
            f.name.toLowerCase().replace(/\.[^.]+$/, "") === gFilename.toLowerCase().replace(/\.[^.]+$/, "")
          );
          if (match) {
            try {
              const formData = new FormData();
              formData.append("image", match);
              formData.append("type", "gallery");
              const res = await api.post<any>("/admin/upload", formData);
              galleryUrls.push(res.url);
            } catch (err: any) {
              const errorMsg = `Gallery photo "${gFilename}" for user ${user.name}: ${err.message || "Unknown error"}`;
              console.error(`Failed to upload gallery photo "${gFilename}" for user ${user.name}`, err);
              setUploadErrors((prev) => [...prev, errorMsg]);
              toast.error(errorMsg);
            }
          } else {
            const errorMsg = `Missing file: Gallery image "${gFilename}" referenced by user ${user.name} is not selected or uploaded.`;
            setUploadErrors((prev) => [...prev, errorMsg]);
          }
        }
        if (galleryUrls.length > 0) {
          user.gallery = galleryUrls;
        }
      }
    }

    setUploadProgress(100);
    setCurrentProgressMsg("Image uploads complete! Creating users...");
    return enrichedUsers;
  };

  const handleSubmit = async () => {
    if (parsedUsers.length === 0) return;
    setIsProcessing(true);
    setUploadErrors([]);
    isCancelledRef.current = false;

    try {
      let usersToUpload = [...parsedUsers];

      // Upload images and link them
      if (imageFiles.length > 0) {
        usersToUpload = await handleUploadImages(usersToUpload);
      }

      uploadMutation.mutate(usersToUpload);
    } catch (err: any) {
      console.error("Failed to process bulk upload completely:", err);
      toast.error("Failed to process upload: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCsvFile(null);
    setImageFiles([]);
    setParsedUsers([]);
    setStep("upload");
    setResults(null);
    setShowDetails(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Bulk Upload Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload a CSV or JSON file with user data and optional image files for profile pictures and galleries.
          </p>
        </div>

        {step === "upload" && (
          <>
            {/* Step 1: Upload CSV/JSON */}
            <div className="rounded-2xl border bg-card p-6 shadow-soft space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                Step 1: Upload User Data File
              </h2>
              <p className="text-xs text-muted-foreground">
                Upload a CSV or JSON file with columns: <code>name, email, phone, gender, password</code>.
                Optional columns: <code>dob, religion, community, city, state, mother_tongue, profile_pic_filename, gallery_filenames</code>.
                If password is missing or too short, a random one will be auto-generated.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const csv = `name,email,phone,gender,password,dob,religion,community,city,state,mother_tongue,profile_pic_filename,gallery_filenames\nJohn Doe,john@example.com,9876543210,male,password123,1990-01-15,Hindu,Reddy,Chennai,Tamil Nadu,Tamil,john.jpg,["john_1.jpg","john_2.jpg"]\nJane Smith,jane@example.com,9876543211,female,pass456,1992-06-20,Muslim,Sheikh,Hyderabad,Telangana,Urdu,,jane.jpg,["jane_1.jpg"]`;
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = "sample-users.csv"; a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <FileSpreadsheet className="mr-1 h-3.5 w-3.5" />
                  Download Sample CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const json = JSON.stringify([
                      { name: "John Doe", email: "john@example.com", phone: "9876543210", gender: "male", password: "password123", dob: "1990-01-15", religion: "Hindu", community: "Reddy", city: "Chennai", state: "Tamil Nadu", mother_tongue: "Tamil", profile_pic_filename: "john.jpg", gallery_filenames: ["john_1.jpg", "john_2.jpg"] },
                      { name: "Jane Smith", email: "jane@example.com", phone: "9876543211", gender: "female", password: "pass456", dob: "1992-06-20", religion: "Muslim", community: "Sheikh", city: "Hyderabad", state: "Telangana", mother_tongue: "Urdu", profile_pic_filename: "jane.jpg", gallery_filenames: ["jane_1.jpg"] },
                    ], null, 2);
                    const blob = new Blob([json], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = "sample-users.json"; a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <FileSpreadsheet className="mr-1 h-3.5 w-3.5" />
                  Download Sample JSON
                </Button>
              </div>
              <div
                onClick={() => csvInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 p-8 hover:bg-muted/30 transition-colors"
              >
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv,.json"
                  className="hidden"
                  onChange={handleCsvUpload}
                />
                <Upload className="h-8 w-8 text-primary mb-3" />
                <p className="text-sm font-medium">
                  {csvFile ? csvFile.name : "Click to select CSV or JSON file"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {csvFile ? `${(csvFile.size / 1024).toFixed(1)} KB` : "CSV or JSON format"}
                </p>
              </div>
              {csvFile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setCsvFile(null); setParsedUsers([]); }}
                  className="w-full"
                >
                  <X className="mr-1.5 h-4 w-4" /> Remove file
                </Button>
              )}
            </div>

            {/* Step 2: Select Images */}
            <div className="rounded-2xl border bg-card p-6 shadow-soft space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Image className="h-5 w-5 text-primary" />
                Step 2: Select Image Files (Optional)
              </h2>
              <p className="text-xs text-muted-foreground">
                Select images or a ZIP archive containing images from your computer. The system will match filenames to the
                <code> profile_pic_filename </code>
                and <code>gallery_filenames</code> columns in your CSV.
              </p>
              <div
                onClick={() => imageInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 p-6 hover:bg-muted/30 transition-colors"
              >
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*,.zip"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <Image className="h-7 w-7 text-primary mb-2" />
                <p className="text-sm font-medium">Click to select image files or ZIP</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {imageFiles.length > 0 ? `${imageFiles.length} files selected` : "JPG, PNG, WebP or ZIP archives supported"}
                </p>
              </div>

              {imageFiles.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
                  {imageFiles.map((f, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted/30">
                      <img
                        src={URL.createObjectURL(f)}
                        alt={f.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <p className="absolute bottom-0 inset-x-0 text-[8px] text-white bg-black/60 truncate px-1 py-0.5">
                        {f.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                onClick={() => { setParsedUsers([]); setCsvFile(null); setImageFiles([]); }}
                variant="outline"
                className="flex-1"
                disabled={!csvFile}
              >
                Clear All
              </Button>
              <Button
                onClick={() => {
                  if (!csvFile) {
                    toast.error("Please upload a CSV/JSON file first");
                    return;
                  }

                  // Check if images are empty, warn the user
                  if (imageFiles.length === 0) {
                    const confirmNoImages = window.confirm(
                      "No image files or ZIP archive have been selected. Are you sure you want to import users without uploading their photos?"
                    );
                    if (!confirmNoImages) return;
                  }

                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    try {
                      const text = evt.target?.result as string;
                      let users: any[] = [];

                      if (csvFile.name.endsWith(".json")) {
                        users = JSON.parse(text);
                      } else {
                        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
                        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
                        users = lines.slice(1).map((line) => {
                          const values = line.split(",").map((v) => v.trim());
                          const obj: any = {};
                          headers.forEach((header, index) => {
                            obj[header] = values[index] || "";
                          });
                          return obj;
                        });
                      }

                      const valid = users.filter((u) => u.name && u.email && u.phone && u.gender);
                      setParsedUsers(valid);
                      setStep("preview");
                    } catch {
                      toast.error("Failed to parse file");
                    }
                  };
                  reader.readAsText(csvFile);
                }}
                className="flex-1 gradient-rose text-white"
                disabled={!csvFile}
              >
                Preview Users
              </Button>
            </div>
          </>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <div className="rounded-2xl border bg-card p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Preview ({parsedUsers.length} users)
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setStep("upload")}>
                  <X className="h-4 w-4 mr-1" /> Change file
                </Button>
              </div>
              <div className="overflow-x-auto max-h-80 border rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Gender</th>
                      <th className="p-3">Profile Pic</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {parsedUsers.slice(0, 50).map((u, i) => (
                      <tr key={i} className="hover:bg-muted/20">
                        <td className="p-3 text-muted-foreground">{i + 1}</td>
                        <td className="p-3 font-medium">{u.name}</td>
                        <td className="p-3 text-muted-foreground">{u.email}</td>
                        <td className="p-3 text-muted-foreground">{u.phone}</td>
                        <td className="p-3 capitalize">{u.gender}</td>
                        <td className="p-3">
                          {(() => {
                            const rawFilename = u.profile_pic_filename || u.photo_filename;
                            if (!rawFilename) return <span className="text-xs text-muted-foreground">—</span>;
                            
                            const filename = decodeURIComponent(rawFilename.split("?")[0].split("/").pop() || rawFilename);
                            const isMatched = imageFiles.some((f) =>
                              f.name.toLowerCase() === filename.toLowerCase() ||
                              f.name.toLowerCase().replace(/\.[^.]+$/, "") === filename.toLowerCase().replace(/\.[^.]+$/, "")
                            );

                            return isMatched ? (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                Matched: {filename}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                Missing: {filename}
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedUsers.length > 50 && (
                  <p className="p-3 text-xs text-muted-foreground text-center border-t">
                    ... and {parsedUsers.length - 50} more
                  </p>
                )}
              </div>
              {imageFiles.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  <Image className="h-3 w-3 inline mr-1" />
                  {imageFiles.length} image file(s) selected — filenames will be matched automatically.
                </p>
              )}
            </div>
            {isProcessing && (
              <div className="rounded-2xl border bg-card p-5 shadow-soft space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-muted-foreground">{currentProgressMsg || "Processing uploads..."}</span>
                  <span className="text-primary font-bold">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
             {isProcessing ? (
              <Button
                variant="destructive"
                onClick={() => {
                  isCancelledRef.current = true;
                  setIsProcessing(false);
                  toast.info("Upload cancellation requested...");
                }}
                className="w-full"
              >
                Cancel Upload
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("upload")} className="flex-1" disabled={isProcessing}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 gradient-rose text-white"
                  disabled={isProcessing || uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? (
                    <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Creating profiles...</>
                  ) : (
                    `Upload ${parsedUsers.length} Users`
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {step === "result" && results && (
          <div className="space-y-4">
            <div className="rounded-2xl border bg-card p-6 shadow-soft space-y-4 text-center">
              {results.errors?.length > 0 ? (
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <AlertCircle className="h-7 w-7" />
                </div>
              ) : (
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
              )}
              <h2 className="font-display text-xl font-bold">{results.message}</h2>
              <p className="text-sm text-muted-foreground">
                {results.created?.length || 0} users created successfully
                {results.errors?.length > 0 && `, ${results.errors.length} errors`}
              </p>

              {results.created?.length > 0 && (
                <div className="mt-4 text-left">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-1 text-sm font-medium text-primary mb-2"
                  >
                    {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    View created users
                  </button>
                  {showDetails && (
                    <div className="overflow-x-auto max-h-60 border rounded-xl">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                          <tr>
                            <th className="p-2">Name</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">ID</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {results.created.map((u: any, i: number) => (
                            <tr key={i} className="hover:bg-muted/20">
                              <td className="p-2 font-medium">{u.name}</td>
                              <td className="p-2 text-muted-foreground">{u.email}</td>
                              <td className="p-2 font-mono text-xs text-muted-foreground">{u.display_id}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {results.skipped?.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left space-y-2">
                  <p className="text-sm font-semibold text-amber-800 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    {results.skipped.length} Duplicates Skipped
                  </p>
                  <p className="text-xs text-muted-foreground">
                    A file containing the skipped duplicate user records has been downloaded automatically. You can also download it manually:
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-500/30 text-amber-900 hover:bg-amber-500/20 rounded-xl"
                    onClick={() => {
                      const json = JSON.stringify(results.skipped, null, 2);
                      const blob = new Blob([json], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `skipped_duplicates_${Date.now()}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Download Skipped JSON
                  </Button>
                </div>
              )}

              {results.errors?.length > 0 && (
                <div className="text-left mt-4 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                  <p className="text-sm font-semibold text-destructive mb-2">Errors:</p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {results.errors.map((err: string, i: number) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Button onClick={handleReset} className="w-full">
              Upload Another Batch
            </Button>
          </div>
        )}

        {/* Detailed Image Upload Errors Popup Dialog */}
        <Dialog open={uploadErrors.length > 0} onOpenChange={(open) => { if (!open) setUploadErrors([]); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Image Upload Issues
              </DialogTitle>
              <DialogDescription>
                Some image files failed to upload during this batch process. Review the details below:
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-xl p-3 bg-muted/20 text-xs text-muted-foreground font-mono">
              {uploadErrors.map((err, idx) => (
                <div key={idx} className="pb-1.5 border-b last:border-b-0 last:pb-0">
                  • {err}
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setUploadErrors([])}>
                Acknowledge
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
