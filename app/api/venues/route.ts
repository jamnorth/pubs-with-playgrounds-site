import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // important: avoid edge surprises

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(req: Request) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const city = (searchParams.get("city") || "").trim();
    const sort = (searchParams.get("sort") || "name").trim();

    let query = supabase.from("venues").select("id,name,address,city");

    if (city) query = query.eq("city", city);

    if (q) {
      // searches name OR address
      const safe = q.replace(/%/g, "\\%").replace(/_/g, "\\_");
      query = query.or(`name.ilike.%${safe}%,address.ilike.%${safe}%`);
    }

    if (sort === "popular") query = query.order("popularity", { ascending: false, nullsFirst: false });
    else query = query.order("name", { ascending: true });

    // keep it small for demo
    query = query.limit(200);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ venues: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
