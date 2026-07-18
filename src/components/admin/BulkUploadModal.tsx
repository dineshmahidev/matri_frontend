import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface BulkUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BulkUploadModal({ open, onOpenChange, onSuccess }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [logId, setLogId] = useState<number | null>(null);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (logId && (!status || status.status === 'pending' || status.status === 'processing')) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/admin/bulk-upload/status/${logId}`);
          setStatus(res.data);
          
          if (res.data.status === 'completed' || res.data.status === 'failed') {
            clearInterval(interval);
            if (res.data.status === 'completed') {
              toast.success("Import completed successfully!");
              if (onSuccess) onSuccess();
            } else {
              toast.error("Import failed: " + res.data.error_message);
            }
          }
        } catch (e) {
          console.error("Failed to fetch status", e);
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [logId, status]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    if (!file.name.endsWith(".zip")) {
      toast.error("Please upload a .zip file");
      return;
    }

    setIsUploading(true);
    setStatus(null);
    setLogId(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/admin/bulk-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setLogId(res.data.log_id);
      toast.success("Upload successful, processing started.");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to upload file");
      setIsUploading(false);
    }
  };

  const calculateProgress = () => {
    if (!status || !status.total_records) return 0;
    const processed = status.imported + status.skipped + status.failed;
    return Math.round((processed / status.total_records) * 100);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val && isUploading && status?.status === 'processing') {
        toast.info("Import is still running in the background.");
      }
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Upload Profiles</DialogTitle>
          <DialogDescription>
            Upload a ZIP file containing <code>users.json</code> and an <code>images/</code> folder to import female profiles.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!logId ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors">
              <Upload className="h-10 w-10 text-muted-foreground mb-4" />
              <label htmlFor="zip-upload" className="cursor-pointer">
                <span className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                  Select ZIP File
                </span>
                <input
                  id="zip-upload"
                  type="file"
                  accept=".zip,application/zip,application/x-zip-compressed,multipart/x-zip"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              {file && (
                <p className="mt-4 text-sm font-medium">Selected: {file.name}</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium capitalize text-muted-foreground">Status: {status?.status || 'Starting...'}</span>
                <span className="font-bold">{calculateProgress()}%</span>
              </div>
              
              <Progress value={calculateProgress()} className="h-2" />
              
              {status && (
                <div className="grid grid-cols-3 gap-4 text-center mt-4">
                  <div className="bg-muted p-2 rounded">
                    <p className="text-xs text-muted-foreground uppercase">Imported</p>
                    <p className="text-xl font-semibold text-green-600">{status.imported}</p>
                  </div>
                  <div className="bg-muted p-2 rounded">
                    <p className="text-xs text-muted-foreground uppercase">Skipped</p>
                    <p className="text-xl font-semibold text-amber-600">{status.skipped}</p>
                  </div>
                  <div className="bg-muted p-2 rounded">
                    <p className="text-xs text-muted-foreground uppercase">Failed</p>
                    <p className="text-xl font-semibold text-red-600">{status.failed}</p>
                  </div>
                </div>
              )}
              
              {status?.status === 'completed' && (
                <div className="flex items-center text-green-600 mt-4 bg-green-50 p-3 rounded text-sm">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Successfully processed {status.total_records} records.
                </div>
              )}
              
              {status?.status === 'failed' && (
                <div className="flex items-center text-red-600 mt-4 bg-red-50 p-3 rounded text-sm">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {status.error_message || 'An error occurred during import.'}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {status?.status === 'completed' ? 'Close' : 'Cancel'}
          </Button>
          {!logId && (
            <Button onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload & Start
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
