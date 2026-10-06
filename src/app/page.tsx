import { redirect } from "next/navigation";

// The root of the domain isn't a client site — send the owner to the dashboard.
export default function Home() {
  redirect("/admin");
}
