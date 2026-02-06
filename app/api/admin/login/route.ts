import { NextResponse } from "next/server";

const ADMIN_COOKIE = "pwp_admin";

export async function POST(req: Request) {
  const { password } = await req.json();
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) return NextResponse.json({ error: "Missing ADMIN_PASSWORD" }, { status: 500 });
  if (!password || password !== expected) return NextResponse.json({ error: "Invalid password" }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // 14 days
  });
  return res;
}
