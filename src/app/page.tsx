import { redirect } from "next/navigation";

export default function Home() {
  // Temporarily bypass auth for testing
  redirect("/dashboard");
  // redirect("/auth/login");
}
