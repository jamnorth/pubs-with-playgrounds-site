"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Plan = "featured_monthly" | "featured_annual" | "claimed_plus";

export default function UpgradePage() {
  const [venueId, setVenueId] = useState("");
  const [venueName, setVenueName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<Plan>("featured_monthly");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const vid = url.searchParams.get("venue_id") || "";
    const vname = url.searchParams.get("name") || "";
    setVenueId(vid);
    setVenueName(vname);
  }, []);

  async function startCheckout() {
    if (!venueId) return alert("Missing venue_id. Please open this page from a venue card.");
    if (!email.trim()) return alert("Email required.");
    setLoading(true);

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ venue_id: venueId, plan, email: email.trim() }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) return alert(data.error || "Checkout failed");
    if (data.url) window.location.href = data.url;
  }

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Upgrade</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/">List</Link>
          <Link href="/owners">Venue owners</Link>
        </div>
      </div>

      <p style={{ opacity: 0.9 }}>
        Upgrading is for venue owners. If you’re just searching as a parent, the site is free.
      </p>

      <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
        <div><b>Venue:</b> {venueName || "(unknown)"} </div>
        <div style={{ fontSize: 13, opacity: 0.8 }}><b>ID:</b> {venueId || "(missing)"} </div>
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <label>
          Your email
          <input value={email} onChange={(e)=>setEmail(e.target.value)} style={{ width: "100%", padding: 10 }} placeholder="you@venue.com" />
        </label>

        <label>
          Plan
          <select value={plan} onChange={(e)=>setPlan(e.target.value as Plan)} style={{ width: "100%", padding: 10 }}>
            <option value="featured_monthly">Featured — $39/month</option>
            <option value="featured_annual">Featured — $390/year</option>
            <option value="claimed_plus">Claimed+ — $19/month</option>
          </select>
        </label>

        <button onClick={startCheckout} disabled={loading} style={{ padding: 12, fontWeight: 800 }}>
          {loading ? "Redirecting..." : "Continue to payment"}
        </button>

        <p style={{ fontSize: 13, opacity: 0.8 }}>
          Payment handled by Stripe. After checkout, your listing will update automatically.
        </p>
      </div>
    </main>
  );
}
