import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") || "").trim();
  const city = (searchParams.get("city") || "").trim();
  const sort = (searchParams.get("sort") || "name").trim(); // name | popular

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let query = supabase.from("venues").select("*");

  // If you don't have a city column yet, comment this out.
  if (city) query = query.eq("city", city);

  if (q) {
    query = query.or(`name.ilike.%${q}%,address.ilike.%${q}%`);
  }

  // If you don't have popularity/rating columns yet, this will still work (it just won't sort by them)
  if (sort === "popular") {
    query = query.order("user_ratings_total", { ascending: false });
  } else {
    query = query.order("name", { ascending: true });
  }

  const { data, error } = await query.limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ venues: data ?? [] });
}
