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
  const region = (searchParams.get("region") || "all").toLowerCase();

  // optional facility checkboxes
  const indoor = searchParams.get("indoor_playground") === "1";
  const outdoor = searchParams.get("outdoor_playground") === "1";
  const kidsRoom = searchParams.get("kids_room") === "1";
  const kidsClub = searchParams.get("kids_club") === "1";

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  let query = supabase
    .from("venues")
    .select(
      [
        "id",
        "name",
        "address",
        "suburb",
        "state",
        "lat",
        "lng",
        "indoor_playground",
        "outdoor_playground",
        "kids_room",
        "kids_club",
        "kids_facility_notes",
      ].join(",")
    )
    .eq("approved", true)
    // ✅ HARD GATE: must have one of the allowed kids facilities
    .or("indoor_playground.eq.true,outdoor_playground.eq.true,kids_room.eq.true,kids_club.eq.true")
    .order("name", { ascending: true })
    .limit(500);

  // Search across common fields
  if (q) {
    const like = `%${q}%`;
    query = query.or(
      [
        `name.ilike.${like}`,
        `address.ilike.${like}`,
        `suburb.ilike.${like}`,
        `state.ilike.${like}`,
        `kids_facility_notes.ilike.${like}`,
      ].join(",")
    );
  }

  // Facility filters (AND)
  if (indoor) query = query.eq("indoor_playground", true);
  if (outdoor) query = query.eq("outdoor_playground", true);
  if (kidsRoom) query = query.eq("kids_room", true);
  if (kidsClub) query = query.eq("kids_club", true);

  // Region filter using lat/lng (does NOT rely on "city")
  if (region === "brisbane") {
    query = query.gte("lat", -27.75).lte("lat", -27.2).gte("lng", 152.85).lte("lng", 153.35);
  } else if (region === "goldcoast") {
    query = query.gte("lat", -28.35).lte("lat", -27.85).gte("lng", 153.2).lte("lng", 153.55);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ venues: data ?? [] });
}
