import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // important for Vercel

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const city = (url.searchParams.get("city") || "").trim(); // optional
    const sort = (url.searchParams.get("sort") || "name").trim();

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return NextResponse.json(
        {
          error:
            "Missing env vars: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // IMPORTANT: only select columns you know exist
    let query = supabase
      .from("venues")
      .select("id,name,address,lat,lng", { count: "exact" })
      .limit(200);

    // basic search
    if (q) {
      query = query.or(`name.ilike.%${q}%,address.ilike.%${q}%`);
    }

    // city filter ONLY works if you actually have a city column.
    // If you don’t, comment this block out for now.
    if (city) {
      // If you don't have a "city" column yet, this will throw.
      query = query.eq("city", city);
    }

    // sorting
    if (sort === "name") query = query.order("name", { ascending: true });
    if (sort === "popular") query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: `Supabase error: ${error.message}`, details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ venues: data ?? [] }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: `Server error: ${e?.message || String(e)}` },
      { status: 500 }
    );
  }
}
