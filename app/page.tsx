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

  // Region dropdown (does not rely on bad "city" values)
  const [region, setRegion] = useState<"all" | "brisbane" | "goldcoast">("all");

  // Facility filters
  const [indoor, setIndoor] = useState(false);
  const [outdoor, setOutdoor] = useState(false);
  const [kidsRoom, setKidsRoom] = useState(false);
  const [kidsClub, setKidsClub] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (q.trim()) params.set("q", q.trim());
    if (region !== "all") params.set("region", region);

    if (indoor) params.set("indoor_playground", "1");
    if (outdoor) params.set("outdoor_playground", "1");
    if (kidsRoom) params.set("kids_room", "1");
    if (kidsClub) params.set("kids_club", "1");

    return params.toString();
  }, [q, region, indoor, outdoor, kidsRoom, kidsClub]);

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

  // load once
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main style={{ padding: 20, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ fontSize: 34, marginBottom: 6 }}>Pubs with Playgrounds</h1>

      <p style={{ opacity: 0.75, marginTop: 0 }}>
        Only venues with an indoor playground, outdoor playground, kids room or kids club.
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

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={indoor} onChange={(e) => setIndoor(e.target.checked)} />
          Indoor playground
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={outdoor} onChange={(e) => setOutdoor(e.target.checked)} />
          Outdoor playground
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={kidsRoom} onChange={(e) => setKidsRoom(e.target.checked)} />
          Kids room
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={kidsClub} onChange={(e) => setKidsClub(e.target.checked)} />
          Kids club
        </label>

        <button onClick={load} style={{ padding: "8px 12px" }}>
          Apply
        </button>

        <button
          onClick={() => {
            setQ("");
            setRegion("all");
            setIndoor(false);
            setOutdoor(false);
            setKidsRoom(false);
            setKidsClub(false);
            setTimeout(load, 0);
          }}
          style={{ padding: "8px 12px" }}
        >
          Clear
        </button>
      </div>

      {err && <pre style={{ background: "#fee", padding: 12 }}>{err}</pre>}

      <p>{venues.length} venues</p>

      <ul style={{ paddingLeft: 16, lineHeight: 1.35 }}>
        {venues.map((v, i) => (
          <li key={v.id ?? `${v.name}-${i}`} style={{ marginBottom: 14 }}>
            <strong>{v.name}</strong>

            {/* ✅ show suburb + state ONLY (city was unreliable) */}
            {(v.suburb || v.state) && (
              <div style={{ opacity: 0.7 }}>
                {[v.suburb, v.state].filter(Boolean).join(", ")}
              </div>
            )}

            {v.address && <div style={{ opacity: 0.85 }}>{v.address}</div>}

            <div style={{ marginTop: 6 }}>
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
