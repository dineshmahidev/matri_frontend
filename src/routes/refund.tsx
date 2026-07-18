import { createFileRoute } from "@tanstack/react-router";
import { Legal } from "./privacy";

export const Route = createFileRoute("/refund")({
  head: () => ({ meta: [{ title: "Refund Policy — Ungalkalyanam" }] }),
  component: () => <Legal slug="refund-policy" />,
});
