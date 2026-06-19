import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/staff")({
  beforeLoad: ({ location }) => {
    requireRole("staff", location.pathname);
  },
  head: () => ({
    meta: [
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <Outlet />,
});
