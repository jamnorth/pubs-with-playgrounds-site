import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return NextResponse.json(
        {
          error: "Missing env vars",
          hasUrl: !!SUPABASE_URL,
          hasAnonKey: !!SUPABASE_ANON_KEY,
        },
        { status: 500 }
      );
    }

    const q = (url.searchParams.get("q") || "").trim();
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    let query = supabase
      .from("venues")
      .select("id,name,address,city,suburb,state,website,phone,featured")
      .order("name", { ascending: true })
      .limit(100);

    if (q) {
      query = query.or(
        `name.ilike.%${q}%,address.ilike.%${q}%,suburb.ilike.%${q}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Supabase query failed", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      count: data?.length ?? 0,
      venues: data ?? [],
    });
  } catch (e: any) {
    console.error("API crash:", e);
    return NextResponse.json(
      { error: "API crashed", message: e?.message || String(e) },
      { status: 500 }
    );
  }
}
