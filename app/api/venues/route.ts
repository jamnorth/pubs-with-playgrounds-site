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

  // filters: "1" means on
  const playground = searchParams.get("playground") === "1";
  const kidsRoom = searchParams.get("kids_room") === "1";
  const gamesRoom = searchParams.get("games_room") === "1";
  const anyKids = searchParams.get("any_kids") === "1";

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  let query = supabase
    .from("venues")
    .select(
      [
        "id",
        "name",
        "address",
        "suburb",
        "city",
        "state",
        "playground",
        "kids_room",
        "games_room",
        "playground_notes",
        "image_url",
      ].join(",")
    )
    .eq("approved", true)
    .order("name", { ascending: true })
    .limit(500);

  // Broader text search
  if (q) {
    const like = `%${q}%`;
    query = query.or(
      [
        `name.ilike.${like}`,
        `address.ilike.${like}`,
        `suburb.ilike.${like}`,
        `city.ilike.${like}`,
        `state.ilike.${like}`,
        `playground_notes.ilike.${like}`,
      ].join(",")
    );
  }

  // Kids filters
  // any_kids = OR across the three flags
  if (anyKids) {
    query = query.or("playground.eq.true,kids_room.eq.true,games_room.eq.true");
  } else {
    if (playground) query = query.eq("playground", true);
    if (kidsRoom) query = query.eq("kids_room", true);
    if (gamesRoom) query = query.eq("games_room", true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ venues: data ?? [] });
}
