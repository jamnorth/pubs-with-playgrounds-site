import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  try {
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .limit(20);

    if (error) {
      console.error("SUPABASE ERROR:", error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ venues: data });
  } catch (e: any) {
    console.error("SERVER CRASH:", e);
    return NextResponse.json(
      { error: e?.message || "unknown crash" },
      { status: 500 }
    );
  }
}
