"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export default function OwnersPage() {
  const [email, setEmail] = useState("");
  const mailto = useMemo(() => {
    const subject = encodeURIComponent("Feature or claim my venue");
    const body = encodeURIComponent(
      `Hi Pubs with Playgrounds,\n\nI’d like to feature/claim my venue.\n\nVenue name:\nVenue suburb/city:\nWebsite:\nMy role/connection:\n\nThanks,\n${email || ""}`
    );
    return `mailto:hello@pubswithplaygrounds.com.au?subject=${subject}&body=${body}`;
  }, [email]);

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0 }}>For Venue Owners</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/">List</Link>
          <Link href="/map">Map</Link>
        </div>
      </div>

      <p style={{ marginTop: 10, opacity: 0.9 }}>
        Families use <b>Pubs with Playgrounds</b> to decide where to eat and drink based on kid-friendly options.
        Keep your listing accurate, and get more visibility with Featured placement.
      </p>

      <h2>Featured Listing</h2>
      <ul>
        <li>⭐ Appear at the top of results</li>
        <li>📸 Add a hero photo</li>
        <li>🛝 Highlight playground details</li>
        <li>🔗 Add a button to your website or bookings</li>
      </ul>

      <p style={{ fontSize: 18 }}>
        <b>$39/month</b> or <b>$390/year</b>
      </p>

      <h3>Ready to feature or claim?</h3>
      <p>Start with either option:</p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
        <Link href="/claim" style={{ padding: "10px 14px", border: "1px solid #ddd", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>
          Claim a venue
        </Link>

        <a
          href={mailto}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            textDecoration: "none",
            fontWeight: 700,
            background: "#000",
            color: "#fff",
          }}
        >
          Email us
        </a>
      </div>

      <div style={{ marginTop: 18, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Self-serve payments (Stripe)</div>
        <p style={{ marginTop: 0, opacity: 0.9 }}>
          If you’ve already found your listing, you can feature it now. You’ll need the venue ID (we prefill it when you click from a venue card).
        </p>
        <Link href="/" style={{ fontWeight: 700 }}>Go pick your venue</Link>
      </div>

      <div style={{ marginTop: 18 }}>
        <label style={{ display: "block", marginBottom: 6 }}>Your email (optional)</label>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} style={{ width: "100%", padding: 10, maxWidth: 420 }} placeholder="you@venue.com" />
        <p style={{ fontSize: 13, opacity: 0.8 }}>
          We use this only for replying to your request.
        </p>
      </div>
    </main>
  );
}
