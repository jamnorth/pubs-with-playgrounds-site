import { NextResponse } from "next/server";
import { supabaseAdmin } from "../_supabase";

export async function GET() {
  try {
    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from("venue_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;
    return NextResponse.json({ items: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = supabaseAdmin();
    const { id, action, reason } = await req.json();
    if (!id || !action) return NextResponse.json({ error: "Missing id/action" }, { status: 400 });

    const { data: s, error: e1 } = await supabase.from("venue_submissions").select("*").eq("id", id).single();
    if (e1) throw e1;

    if (action === "approve") {
      if (!s.submitted_lat || !s.submitted_lng) {
        return NextResponse.json({ error: "Submission has no lat/lng. Edit it in Supabase first." }, { status: 400 });
      }

      const manualId = `manual/${id}`;
      const { error: e2 } = await supabase.from("venues").upsert(
        {
          osm_id: manualId,
          name: s.submitted_name,
          venue_type: s.submitted_venue_type || "venue",
          address: s.submitted_address,
          website: s.submitted_website,
          phone: s.submitted_phone,
          lat: s.submitted_lat,
          lng: s.submitted_lng,
        },
        { onConflict: "osm_id" }
      );
      if (e2) throw e2;

      const { error: e3 } = await supabase
        .from("venue_submissions")
        .update({ status: "approved", reviewer_notes: null, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (e3) throw e3;
    } else if (action === "reject") {
      const { error: e3 } = await supabase
        .from("venue_submissions")
        .update({ status: "rejected", reviewer_notes: reason || null, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (e3) throw e3;
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Error" }, { status: 500 });
  }
}
