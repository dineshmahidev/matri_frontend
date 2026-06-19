import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    requireRole("admin", location.pathname);
  },
  head: () => ({
    meta: [
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <Outlet />,
});
