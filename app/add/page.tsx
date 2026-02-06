"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { geocodePlace } from "@/lib/geocode";

export default function AddVenuePage() {
  const [name, setName] = useState("");
  const [venueType, setVenueType] = useState("pub");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);

  async function geocodeAddress() {
    setLoading(true);
    const r = await geocodePlace(address);
    setLoading(false);
    if (!r) return alert("Could not locate that address. Try adding suburb + QLD.");
    setLat(r.lat);
    setLng(r.lng);
  }

  async function submit() {
    if (!name.trim()) return alert("Venue name required.");
    setLoading(true);

    const { error } = await supabase.from("venue_submissions").insert({
      submitted_name: name.trim(),
      submitted_venue_type: venueType,
      submitted_address: address || null,
      submitted_notes: notes || null,
      submitted_website: website || null,
      submitted_phone: phone || null,
      submitted_lat: lat,
      submitted_lng: lng,
    });

    setLoading(false);

    if (error) return alert(error.message);

    setName("");
    setAddress("");
    setNotes("");
    setWebsite("");
    setPhone("");
    setLat(null);
    setLng(null);
    alert("Thanks! Submitted for review.");
  }

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Add a venue</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/">List</Link>
          <Link href="/map">Map</Link>
        </div>
      </div>

      <p style={{ opacity: 0.85 }}>
        Submit a venue that has a playground (or one very nearby). We’ll review it before it appears publicly.
      </p>

      <div style={{ display: "grid", gap: 10 }}>
        <label>
          Venue name
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: 10 }} />
        </label>

        <label>
          Venue type
          <select value={venueType} onChange={(e) => setVenueType(e.target.value)} style={{ width: "100%", padding: 10 }}>
            <option value="pub">pub</option>
            <option value="bar">bar</option>
            <option value="restaurant">restaurant</option>
            <option value="cafe">cafe</option>
            <option value="club">club</option>
            <option value="brewery">brewery</option>
            <option value="winery">winery</option>
          </select>
        </label>

        <label>
          Address (or suburb)
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input value={address} onChange={(e) => setAddress(e.target.value)} style={{ flex: "1 1 320px", padding: 10 }} />
            <button onClick={geocodeAddress} disabled={loading || !address.trim()}>
              {loading ? "Locating..." : "Locate"}
            </button>
          </div>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            {lat && lng ? (
              <>
                Pinned at <b>{lat.toFixed(5)}, {lng.toFixed(5)}</b>
              </>
            ) : (
              "Optional: click Locate to pin it"
            )}
          </div>
        </label>

        <label>
          Website (optional)
          <input value={website} onChange={(e) => setWebsite(e.target.value)} style={{ width: "100%", padding: 10 }} />
        </label>

        <label>
          Phone (optional)
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: "100%", padding: 10 }} />
        </label>

        <label>
          Playground notes (optional)
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} style={{ width: "100%", padding: 10 }} />
        </label>

        <button onClick={submit} disabled={loading} style={{ padding: 12, fontWeight: 700 }}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </main>
  );
}
