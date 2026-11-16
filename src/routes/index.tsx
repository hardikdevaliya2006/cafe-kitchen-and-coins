import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cafe | Kitchen and Billing" },
      { name: "description", content: "Manage restaurant kitchen orders, tables, and billing." },
      { property: "og:title", content: "Cafe | Kitchen and Billing" },
      { property: "og:description", content: "Manage restaurant kitchen orders, tables, and billing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/kitchen" });
  },
});