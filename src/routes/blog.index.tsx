import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/blog/")({
  head: () => ({ meta: [{ title: "Blog — Ungalkalyanam" }, { name: "description", content: "Stories, advice and inspiration on love, relationships and weddings." }] }),
  component: Blog,
});

type PostType = {
  id: number;
  slug: string;
  title: string;
  category: string;
  read_time: string;
  published_at: string;
  image: string;
  excerpt: string;
};

function Blog() {
  const { data: posts = [], isLoading } = useQuery<PostType[]>({
    queryKey: ["blog-posts"],
    queryFn: () => api.get<PostType[]>("/blog"),
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <p className="text-sm font-medium text-primary">Blog</p>
        <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Words on love, life & forever.</h1>
        
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link to="/blog/$slug" params={{ slug: p.slug }} key={p.id} className="hover-lift group overflow-hidden rounded-3xl border bg-card shadow-soft text-left animate-fade-in block">
                <div className="overflow-hidden">
                  <img src={p.image} alt={p.title} className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">{p.category}</span>
                    · {p.read_time} · {new Date(p.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <h3 className="mt-3 font-display text-xl font-semibold leading-snug">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
