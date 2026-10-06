"use client";

import { useActionState } from "react";

import { loginAction } from "@/lib/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, undefined);
  const field =
    "mt-1 w-full rounded-xl bg-background px-4 py-3 text-sm ring-1 ring-border outline-none focus:ring-2 focus:ring-primary";
  return (
    <form action={action} className="space-y-4 rounded-3xl bg-surface p-6 ring-1 ring-border">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="text-xs font-medium text-muted-foreground">Email</span>
        <input name="email" type="email" required autoComplete="username" defaultValue={state?.email} key={state?.email} className={field} />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-muted-foreground">Password</span>
        <input name="password" type="password" required autoComplete="current-password" className={field} />
      </label>
      {state?.error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-deep disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
