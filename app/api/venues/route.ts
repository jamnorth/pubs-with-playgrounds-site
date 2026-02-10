import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  // 1) Prove env vars exist (without leaking secrets)
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json(
      {
        ok: false,
        step: "env",
        hasUrl: !!SUPABASE_URL,
        hasAnonKey: !!SUPABASE_ANON_KEY,
        urlPreview: SUPABASE_URL ? SUPABASE_URL.slice(0, 30) : null,
        anonLen: SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.length : null,
      },
      { status: 500 }
    );
  }

  // 2) Minimal DB hit: just grab 5 rows
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error } = await supabase
      .from("venues")
      .select("id,name,address")
      .limit(20);

    if (error) {
      return NextResponse.json(
        { ok: false, step: "query", error },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, step: "success", sample: data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, step: "crash", message: e?.message || String(e) },
      { status: 500 }
    );
  }
}
