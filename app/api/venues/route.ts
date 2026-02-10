import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // 1) Confirm route is being hit
    console.log("✅ /api/venues hit");

    // 2) Read env vars (these names MUST match what you set in Vercel)
    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      return NextResponse.json(
        {
          error: "Missing Supabase env vars",
          hasUrl: !!url,
          hasKey: !!key,
          urlPreview: url ? url.slice(0, 30) + "..." : null,
          keyPreview: key ? key.slice(0, 12) + "..." : null,
        },
        { status: 500 }
      );
    }

    const supabase = createClient(url, key);

    // 3) Simple query to prove DB works (no filters yet)
    const { data, error } = await supabase
      .from("venues")
      .select("id,name,address")
      .limit(5);

    if (error) {
      return NextResponse.json(
        { error: "Supabase query failed", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, sample: data });
  } catch (e: any) {
    return NextResponse.json(
      {
        error: "Route crashed",
        message: e?.message,
        stack: e?.stack,
      },
      { status: 500 }
    );
  }
}
