import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // important: avoid edge weirdness
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    // Use NEXT_PUBLIC vars (fine on server too) since you already set them in Vercel
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

    // Simple query first (no city filter). Limit to 100 for demo.
    let query = supabase
      .from("venues")
      .select("id,name,address,city,suburb,state,website,phone,featured,popular")
      .order("name", { ascending: true })
      .limit(100);

    // Optional search
    if (q) {
      // searches name/address/suburb if those columns exist
      query = query.or(`name.ilike.%${q}%,address.ilike.%${q}%,suburb.ilike.%${q}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Supabase query failed", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, count: data?.length ?? 0, venues: data ?? [] });
  } catch (e: any) {
    console.error("API crash:", e);
    return NextResponse.json(
      { error: "API crashed", message: e?.message || String(e) },
      { status: 500 }
    );
  }
}
