import { createFileRoute } from "@tanstack/react-router";
import { BrowseLayout } from "./browse";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type SearchParams = {
  q?: string;
};

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Advanced Search — Ungalkalyanam" }] }),
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      q: search.q as string | undefined,
    };
  },
  component: SearchPage,
});

function SearchPage() {
  const { q = "" } = Route.useSearch();

  const { data, isLoading } = useQuery<{ data: any[] }>({
    queryKey: ["search-members", q],
    queryFn: () => api.get<{ data: any[] }>(`/search?q=${encodeURIComponent(q)}`),
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
      title="Advanced Search" 
      subtitle={`Search results for "${q}"`} 
      members={members} 
    />
  );
}
