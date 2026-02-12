"use client";

import { useEffect, useMemo, useState } from "react";

type Venue = {
  id?: string;
  name: string;
  address?: string;
  suburb?: string;
  city?: string;
  state?: string;

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

  // Facility filters (optional)
  const [indoor, setIndoor] = useState(false);
  const [outdoor, setOutdoor] = useState(false);
  const [kidsRoom, setKidsRoom] = useState(false);
  const [kidsClub, setKidsClub] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());

    if (indoor) params.set("indoor_playground", "1");
    if (outdoor) params.set("outdoor_playground", "1");
    if (kidsRoom) params.set("kids_room", "1");
    if (kidsClub) params.set("kids_club", "1");

    return params.toString();
  }, [q, indoor, outdoor, kidsRoom, kidsClub]);

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
      <h1 style={{ fontSize: 34, marginBottom: 6 }}>Pubs with Playgrounds</h1>
      <p style={{ opacity: 0.75, marginTop: 0 }}>
        Only venues with an indoor playground, outdoor playground, kids room or kids club.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "16px 0" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, address, suburb, city…"
          style={{ padding: 10, minWidth: 340 }}
        />
        <button onClick={load} style={{ padding: "10px 14px" }}>
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          marginBottom: 16,
          padding: 12,
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: 10,
        }}
      >
        <strong style={{ marginRight: 6 }}>Filter by facility:</strong>

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

        <button onClick={load} style={{ padding: "8px 12px", marginLeft: "auto" }}>
          Apply
        </button>

        <button
          onClick={() => {
            setIndoor(false);
            setOutdoor(false);
            setKidsRoom(false);
            setKidsClub(false);
            // optional: also clear search
            // setQ("");
            setTimeout(load, 0);
          }}
          style={{ padding: "8px 12px" }}
        >
          Clear
        </button>
      </div>

      {err && <pre style={{ background: "#fee", padding: 12, borderRadius: 8 }}>{err}</pre>}

      <p style={{ marginTop: 8 }}>{venues.length} venues</p>

      <ul style={{ paddingLeft: 16, lineHeight: 1.35 }}>
        {venues.map((v, i) => (
          <li key={v.id ?? `${v.name}-${i}`} style={{ marginBottom: 14 }}>
            <strong>{v.name}</strong>

            {(v.suburb || v.cit
