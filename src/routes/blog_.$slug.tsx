import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/blog_/$slug")({
  component: BlogDetail,
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
  body: string;
};

function BlogDetail() {
  const { slug } = Route.useParams();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => api.get<PostType>(`/blog/${slug}`),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen space-y-4">
          <h1 className="text-2xl font-bold">Blog post not found.</h1>
          <Link to="/blog" className="text-primary hover:underline">
            Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to all posts
        </Link>
        
        <div className="space-y-4 text-left animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary font-medium">{post.category}</span>
            <span>·</span>
            <span>{post.read_time} read</span>
            <span>·</span>
            <span>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          
          <h1 className="font-display text-4xl font-bold sm:text-5xl leading-tight">{post.title}</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">{post.excerpt}</p>
        </div>

        {post.image && (
          <div className="mt-10 overflow-hidden rounded-3xl border shadow-soft animate-fade-in animate-delay-100">
            <img src={post.image} alt={post.title} className="w-full aspect-video object-cover" />
          </div>
        )}

        <div className="mt-12 prose prose-lg prose-rose max-w-none animate-fade-in animate-delay-200" dangerouslySetInnerHTML={{ __html: post.body }} />
      </section>
      <Footer />
    </div>
  );
}
