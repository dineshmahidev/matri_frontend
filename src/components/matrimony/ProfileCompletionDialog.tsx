import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";

const FIELD_LABELS: Record<string, string> = {
  date_of_birth: "Date of birth",
  religion: "Religion",
  caste: "Caste / community",
  city: "City",
  state: "State",
  education: "Education",
  profile_photo: "Profile photo",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  completionPercent: number;
  missingFields: string[];
  language?: "en" | "ta";
};

export function ProfileCompletionDialog({
  open,
  onOpenChange,
  completionPercent,
  missingFields,
  language = "en",
}: Props) {
  const isTa = language === "ta";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <AlertCircle className="h-5 w-5 text-primary" />
            {isTa ? "உங்கள் சுயவிவரத்தை முடிக்கவும்" : "Complete your profile"}
          </DialogTitle>
          <DialogDescription>
            {isTa
              ? "வரன்களை உலாவுவதற்கு முன் கீழே உள்ள விவரங்களை நிரப்பவும்."
              : "Please fill in the details below before browsing matches."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {isTa ? "சுயவிவர முழுமை" : "Profile completion"}
            </span>
            <span className="font-semibold">{completionPercent}%</span>
          </div>
          <Progress value={completionPercent} className="h-2" />
          {missingFields.length > 0 && (
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {missingFields.map((field) => (
                <li key={field} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {FIELD_LABELS[field] ?? field}
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button asChild className="w-full gradient-rose text-white">
            <Link to="/complete-profile" onClick={() => onOpenChange(false)}>
              {isTa ? "சுயவிவரத்தை முடிக்கவும்" : "Complete profile now"}
            </Link>
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
            {isTa ? "பின்னர் நினைவூட்டு" : "Remind me later"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
