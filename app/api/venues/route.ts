import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // important: avoids edge/runtime weirdness while debugging

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const city = url.searchParams.get("city") ?? "Brisbane";
    const sort = url.searchParams.get("sort") ?? "name";

    // Use the SAME env var names you added in Vercel:
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return NextResponse.json(
        {
          error:
            "Missing env vars on server. Need NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel for this deployment.",
          hasUrl: !!SUPABASE_URL,
          hasAnon: !!SUPABASE_ANON_KEY,
        },
        { status: 500 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    let query = supabase
      .from("venues")
      .select("id,name,address,city")
      .eq("city", city)
      .limit(200);

    if (q.trim()) {
      // matches name OR address
      query = query.or(`name.ilike.%${q}%,address.ilike.%${q}%`);
    }

    if (sort === "name") query = query.order("name", { ascending: true });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: `Supabase error: ${error.message}`, details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ venues: data ?? [] });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Route crashed", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
