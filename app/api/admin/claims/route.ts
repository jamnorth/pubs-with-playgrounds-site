import { NextResponse } from "next/server";
import { supabaseAdmin } from "../_supabase";

export async function GET() {
  try {
    const supabase = supabaseAdmin();

    // join to venue name
    const { data, error } = await supabase
      .from("venue_claim_requests")
      .select("id,created_at,status,claimant_email,claimant_message,venue_id, venues(name)")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;

    const items = (data || []).map((r: any) => ({
      id: r.id,
      created_at: r.created_at,
      status: r.status,
      claimant_email: r.claimant_email,
      claimant_message: r.claimant_message,
      venue_id: r.venue_id,
      venue_name: r.venues?.name || "(unknown venue)",
    }));

    return NextResponse.json({ items });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = supabaseAdmin();
    const { id, action, reason } = await req.json();

    if (!id || !action) return NextResponse.json({ error: "Missing id/action" }, { status: 400 });

    const { data: claim, error: e1 } = await supabase
      .from("venue_claim_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (e1) throw e1;

    if (action === "approve") {
      // mark venue claimed
      const { error: e2 } = await supabase.from("venues").update({ claimed: true, owner_email: claim.claimant_email }).eq("id", claim.venue_id);
      if (e2) throw e2;

      const { error: e3 } = await supabase
        .from("venue_claim_requests")
        .update({ status: "approved", reviewer_notes: null, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (e3) throw e3;
    } else if (action === "reject") {
      const { error: e3 } = await supabase
        .from("venue_claim_requests")
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
