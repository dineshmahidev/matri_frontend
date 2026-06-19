import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
} from "@tanstack/react-router";

import { ScrollingTicker } from "@/components/layout/ScrollingTicker";
import { MaintenanceGuard } from "@/components/layout/MaintenanceGuard";
import { SitePopup } from "@/components/layout/SitePopup";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, interactive-widget=resizes-content, viewport-fit=cover" },
      { title: "Ungalkalyanam — India's Trusted Matrimony Platform" },
      { name: "description", content: "Find your perfect life partner on Ungalkalyanam. Verified profiles, secure conversations and meaningful matches." },
      { name: "theme-color", content: "#E83F7B" },
      { property: "og:title", content: "Ungalkalyanam — Matrimony Reimagined" },
      { property: "og:description", content: "Verified profiles, secure conversations and meaningful matches." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Ungalkalyanam" },
      { property: "og:image", content: "https://ungalkalyanam.com/og-image.png" },
      { property: "og:locale", content: "en_IN" },
      { property: "og:locale:alternate", content: "ta_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Ungalkalyanam — Matrimony Reimagined" },
      { name: "twitter:description", content: "Verified profiles, secure conversations and meaningful matches." },
      { name: "twitter:image", content: "https://ungalkalyanam.com/og-image.png" },
    ],
    links: [
      { rel: "canonical", href: "https://ungalkalyanam.com/" },
      { rel: "alternate", hrefLang: "en", href: "https://ungalkalyanam.com/" },
      { rel: "alternate", hrefLang: "ta", href: "https://ungalkalyanam.com/" },
      { rel: "alternate", hrefLang: "x-default", href: "https://ungalkalyanam.com/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://ungalkalyanam.com/#organization",
              name: "Ungalkalyanam",
              url: "https://ungalkalyanam.com/",
              logo: "https://ungalkalyanam.com/logo-light.png",
              description: "India's trusted Tamil matrimony platform with verified profiles.",
              areaServed: "Tamil Nadu",
              knowsLanguage: ["en", "ta"],
              foundingDate: "2020",
            },
            {
              "@type": "WebSite",
              "@id": "https://ungalkalyanam.com/#website",
              url: "https://ungalkalyanam.com/",
              name: "Ungalkalyanam",
              description: "Find your perfect life partner on Ungalkalyanam. Verified profiles, secure conversations and meaningful matches.",
              inLanguage: ["en", "ta"],
              publisher: { "@id": "https://ungalkalyanam.com/#organization" },
            },
          ],
        }),
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

import { AuthProvider } from "@/lib/auth";
import { LanguageProvider } from "@/lib/language";
import { ThemeProvider } from "@/lib/theme";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { UpgradeProvider } from "@/lib/upgrade";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <>
      <HeadContent />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <UpgradeProvider>
                <ErrorBoundary>
                  <ScrollingTicker />
                  <MaintenanceGuard>
                    <Outlet />
                  </MaintenanceGuard>
                  <SitePopup />
                </ErrorBoundary>
                <Toaster />
              </UpgradeProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
}
