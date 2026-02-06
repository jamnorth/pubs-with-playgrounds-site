"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type VenueLite = { id: string; name: string; suburb: string | null; state: string | null; venue_type: string };

export default function ClaimPage() {
  const [venueId, setVenueId] = useState<string>("");
  const [venueName, setVenueName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<VenueLite[]>([]);

  // Prefill from query params (when clicked from venue card)
  useEffect(() => {
    const url = new URL(window.location.href);
    const vid = url.searchParams.get("venue_id");
    const vname = url.searchParams.get("name");
    if (vid) setVenueId(vid);
    if (vname) setVenueName(vname);
  }, []);

  async function findVenues() {
    if (!search.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("venues")
      .select("id,name,suburb,state,venue_type")
      .ilike("name", `%${search}%`)
      .limit(20);

    setLoading(false);
    if (error) return alert(error.message);
    setResults((data || []) as VenueLite[]);
  }

  async function submit() {
    if (!email.trim()) return alert("Email required.");
    if (!venueId) return alert("Please select a venue to claim (search by name).");
    setLoading(true);

    const { error } = await supabase.from("venue_claim_requests").insert({
      venue_id: venueId,
      claimant_email: email.trim(),
      claimant_message: message || null,
    });

    setLoading(false);
    if (error) return alert(error.message);

    alert("Thanks! Claim request submitted for review.");
    setMessage("");
  }

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Claim a venue</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/">List</Link>
          <Link href="/owners">Venue owners</Link>
        </div>
      </div>

      <p style={{ opacity: 0.9 }}>
        Claiming lets you request updates and manage featured placement. We’ll verify ownership before applying changes.
      </p>

      <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Find your venue</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search venue name…"
            style={{ padding: 10, flex: "1 1 320px" }}
          />
          <button onClick={findVenues} disabled={loading}>{loading ? "Searching..." : "Search"}</button>
        </div>

        {results.length > 0 && (
          <div style={{ marginTop: 10 }}>
            {results.map((v) => (
              <button
                key={v.id}
                onClick={() => { setVenueId(v.id); setVenueName(v.name); }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: 10,
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  marginTop: 8,
                  background: venueId === v.id ? "#f6f6f6" : "#fff"
                }}
              >
                <div style={{ fontWeight: 700 }}>{v.name}</div>
                <div style={{ opacity: 0.8, fontSize: 13 }}>
                  {v.venue_type} • {[v.suburb, v.state].filter(Boolean).join(", ")}
                </div>
              </button>
            ))}
          </div>
        )}

        <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>
          Selected: <b>{venueName || "(none)"}</b>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <label>
          Your email
          <input value={email} onChange={(e)=>setEmail(e.target.value)} style={{ width: "100%", padding: 10 }} placeholder="you@venue.com" />
        </label>

        <label>
          Message (optional)
          <textarea value={message} onChange={(e)=>setMessage(e.target.value)} rows={4} style={{ width: "100%", padding: 10 }} placeholder="I’m the owner/manager… please update our listing…" />
        </label>

        <button onClick={submit} disabled={loading} style={{ padding: 12, fontWeight: 800 }}>
          {loading ? "Submitting..." : "Submit claim request"}
        </button>
      </div>
    </main>
  );
}
