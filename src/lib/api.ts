import "server-only";
import { NextResponse } from "next/server";

import { isAdmin } from "./auth";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

/** Returns a 401 response if the caller isn't an admin, otherwise null. */
export async function guard() {
  return (await isAdmin()) ? null : json({ error: "Unauthorized" }, 401);
}
