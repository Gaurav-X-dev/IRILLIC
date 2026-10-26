import { redirect } from "next/navigation";

export default function RegistrationDisabledPage() {
  redirect("/login");
}
