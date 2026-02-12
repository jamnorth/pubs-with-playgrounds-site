import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: "Missing env vars (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  let query = supabase
    .from("venues")
    .select("id,name,address")
    .eq("approved", true)
    .order("name", { ascending: true })
    .limit(200);

  if (q) {
    query = query.or(`name.ilike.%${q}%,address.ilike.%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ✅ THIS is what your frontend expects
  return NextResponse.json({ venues: data ?? [] });
}
