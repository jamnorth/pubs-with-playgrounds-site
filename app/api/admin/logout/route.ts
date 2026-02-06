import { NextResponse } from "next/server";

const ADMIN_COOKIE = "pwp_admin";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
