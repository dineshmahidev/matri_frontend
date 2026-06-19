import { createFileRoute } from "@tanstack/react-router";
import { Legal } from "./privacy";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — Ungalkalyanam" }] }),
  component: () => <Legal slug="terms-and-conditions" />,
});
