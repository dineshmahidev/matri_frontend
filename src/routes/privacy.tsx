import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Ungalkalyanam" }] }),
  component: () => <Legal slug="privacy-policy" />,
});

export function Legal({ slug }: { slug: string }) {
  const { data: page, isLoading, isError } = useQuery<any>({
    queryKey: ["page", slug],
    queryFn: () => api.get(`/pages/${slug}`),
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError || !page ? (
          <div className="text-center py-20 text-muted-foreground">
            <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
            <p>The requested page could not be found.</p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-4xl font-bold">{page.title}</h1>
            <div 
              className="prose prose-neutral mt-8 max-w-none text-foreground/90"
              dangerouslySetInnerHTML={{ __html: page.body }}
            />
          </>
        )}
      </section>
      <Footer />
    </div>
  );
}
