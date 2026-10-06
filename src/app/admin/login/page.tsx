import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/LoginForm";
import { getSession } from "@/lib/auth";

export const metadata = { title: "Admin login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getSession()) redirect("/admin");
  const { next } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-body">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-primary font-display text-2xl text-primary-foreground">
            D
          </div>
          <h1 className="font-display text-3xl tracking-tight">Dental Demos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to manage client demos</p>
        </div>
        <LoginForm next={next ?? "/admin"} />
      </div>
    </div>
  );
}
