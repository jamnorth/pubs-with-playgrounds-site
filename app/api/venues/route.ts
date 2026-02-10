import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") || "").trim();
  const city = (searchParams.get("city") || "").trim();
  const sort = (searchParams.get("sort") || "featured").trim(); // featured | popular | name

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let query = supabase.from("venues").select("*");

  if (city) query = query.eq("city", city);

  if (q) {
    // searches name OR address
    query = query.or(`name.ilike.%${q}%,address.ilike.%${q}%`);
  }

  // Sorting
  if (sort === "popular") query = query.order("popularity", { ascending: false }).order("user_ratings_total", { ascending: false });
  else if (sort === "name") query = query.order("name", { ascending: true });
  else {
    // featured first, then popularity
    query = query.order("featured", { ascending: false }).order("popularity", { ascending: false });
  }

  const { data, error } = await query.limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ venues: data ?? [] });
}
