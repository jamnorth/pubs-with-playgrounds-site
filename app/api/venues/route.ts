import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // safe default on Vercel

export async function GET() {
  // Try both common env var sets
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new NextResponse("Missing Supabase env vars.", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Adjust table name + fields to match your schema
  const { data, error } = await supabase
    .from("venues")
    .select(
      "id,name,suburb,city,address,lat,lng,featured,popularity,has_playground,website_url"
    )
    .limit(2000);

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
