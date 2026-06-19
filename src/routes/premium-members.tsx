import { createFileRoute } from "@tanstack/react-router";
import { BrowseLayout } from "./browse";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/premium-members")({
  head: () => ({ meta: [{ title: "Premium Members — Ungalkalyanam" }] }),
  component: PremiumMembers,
});

function PremiumMembers() {
  const { language } = useLanguage();
  const { data, isLoading } = useQuery<{ data: any[] }>({
    queryKey: ["premium-members"],
    queryFn: () => api.get<{ data: any[] }>("/members/premium"),
  });

  const members = data?.data || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <BrowseLayout 
      title={language === "ta" ? "பிரீமியம் வரன்கள்" : "Premium Members"} 
      subtitle={language === "ta" ? "சரிபார்க்கப்பட்ட சிறப்பு வரன்கள்" : "Verified & highlighted"} 
      members={members} 
    />
  );
}
