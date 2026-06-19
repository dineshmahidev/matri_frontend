import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Languages, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TranslateTextProps {
  text: string;
  className?: string;
}

export function TranslateText({ text, className = "" }: TranslateTextProps) {
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (translatedText) {
      setTranslatedText(null); // Toggle off if already translated
      return;
    }

    if (!text || text.trim() === "") return;

    setIsTranslating(true);
    try {
      // Using free Google Translate API endpoint
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=${encodeURIComponent(
        text
      )}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Translation failed");
      const data = await res.json();

      // data[0] contains the translated segments
      let result = "";
      if (data && data[0]) {
        for (let i = 0; i < data[0].length; i++) {
          result += data[0][i][0];
        }
      }
      setTranslatedText(result);
    } catch (error) {
      console.error(error);
      toast.error("Could not translate at this moment.");
    } finally {
      setIsTranslating(false);
    }
  };

  if (!text) return <p className={`text-sm leading-relaxed text-muted-foreground ${className}`}>No details added yet.</p>;

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {translatedText || text}
      </p>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleTranslate}
        disabled={isTranslating}
        className="h-8 text-xs text-muted-foreground hover:text-primary"
      >
        {isTranslating ? (
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
        ) : (
          <Languages className="mr-2 h-3 w-3" />
        )}
        {translatedText ? "Show Original" : "Translate to Tamil"}
      </Button>
    </div>
  );
}
