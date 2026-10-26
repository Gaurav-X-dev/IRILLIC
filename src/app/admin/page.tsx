import { redirect } from "next/navigation";

/** Canonical entry point for the administration panel. */
export default function AdminEntryPage() {
  redirect("/login");
}
