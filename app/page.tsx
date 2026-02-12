"use client";

import { useEffect, useMemo, useState } from "react";

type Venue = {
  id?: string;
  name: string;
  address?: string;
  suburb?: string;
  state?: string;
  lat?: number;
  lng?: number;

  approved?: boolean;

  indoor_playground?: boolean;
  outdoor_playground?: boolean;
  kids_room?: boolean;
  kids_club?: boolean;

  kids_facility_notes?: string;
};

export default function Page() {
  const [q, setQ] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [region, setRegion] = useState<"all" | "brisbane" | "goldcoast">("all");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (region !== "all") params.set("region", region);
    return params.toString();
  }, [q, region]);

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      const url = `/api/venues${queryString ? `?${queryString}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) {
        setErr(json?.error || "Search failed");
        setVenues([]);
      } else {
        setVenues(Array.isArray(json?.venues) ? json.venues : []);
      }
    } catch (e: any) {
      setErr(e?.message || "Fetch failed");
      setVenues([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main style={{ padding: 20, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ fontSize: 34, marginBottom: 6 }}>Venue List (All)</h1>
      <p style={{ opacity: 0.75, marginTop: 0 }}>
        Temporary mode: showing all venues in the database (approved + unapproved).
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "16px 0" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, address, suburb…"
          style={{ padding: 10, minWidth: 320 }}
        />

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          Region:
          <select value={region} onChange={(e) => setRegion(e.target.value as any)} style={{ padding: 8 }}>
            <option value="all">All</option>
            <option value="brisbane">Brisbane</option>
            <option value="goldcoast">Gold Coast</option>
          </select>
        </label>

        <button onClick={load} style={{ padding: "10px 14px" }}>
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {err && <pre style={{ background: "#fee", padding: 12 }}>{err}</pre>}

      <p>{venues.length} venues</p>

      <ul style={{ paddingLeft: 16, lineHeight: 1.35 }}>
        {venues.map((v, i) => (
          <li key={v.id ?? `${v.name}-${i}`} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
              <strong>{v.name}</strong>
              {v.approved ? (
                <span style={{ fontSize: 12, opacity: 0.7 }}>✅ approved</span>
              ) : (
                <span style={{ fontSize: 12, opacity: 0.7 }}>⚠️ not approved</span>
              )}
            </div>

            {(v.suburb || v.state) && (
              <div style={{ opacity: 0.7 }}>
                {[v.suburb, v.state].filter(Boolean).join(", ")}
              </div>
            )}

            {v.address && <div style={{ opacity: 0.85 }}>{v.address}</div>}

            <div style={{ marginTop: 6, opacity: 0.9 }}>
              {v.indoor_playground && <div>✅ Indoor playground</div>}
              {v.outdoor_playground && <div>✅ Outdoor playground</div>}
              {v.kids_room && <div>✅ Kids room</div>}
              {v.kids_club && <div>✅ Kids club</div>}
            </div>

            {v.kids_facility_notes && <div style={{ opacity: 0.7 }}>{v.kids_facility_notes}</div>}
          </li>
        ))}
      </ul>
    </main>
  );
}
