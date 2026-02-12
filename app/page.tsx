"use client";

import { useEffect, useMemo, useState } from "react";

type Venue = {
  id?: string;
  name: string;
  address?: string;
  suburb?: string;
  city?: string;
  state?: string;
  playground?: boolean;
  kids_room?: boolean;
  games_room?: boolean;
  playground_notes?: string;
  image_url?: string;
};

export default function Page() {
  const [q, setQ] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Filters
  const [anyKids, setAnyKids] = useState(true);
  const [playground, setPlayground] = useState(false);
  const [kidsRoom, setKidsRoom] = useState(false);
  const [gamesRoom, setGamesRoom] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());

    // any_kids overrides the individual ones in the API
    if (anyKids) {
      params.set("any_kids", "1");
    } else {
      if (playground) params.set("playground", "1");
      if (kidsRoom) params.set("kids_room", "1");
      if (gamesRoom) params.set("games_room", "1");
    }

    return params.toString();
  }, [q, anyKids, playground, kidsRoom, gamesRoom]);

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
      <h1 style={{ fontSize: 34, marginBottom: 6 }}>Family-Friendly Venues</h1>
      <p style={{ opacity: 0.75, marginTop: 0 }}>
        Eating & drinking venues with kids entertainment (playgrounds, kids rooms, games/arcades).
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "16px 0" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, address, suburb, notes…"
          style={{ padding: 10, minWidth: 320 }}
        />
        <button onClick={load} style={{ padding: "10px 14px" }}>
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={anyKids}
            onChange={(e) => {
              const on = e.target.checked;
              setAnyKids(on);
              if (on) {
                setPlayground(false);
                setKidsRoom(false);
                setGamesRoom(false);
              }
            }}
          />
          Any kids entertainment
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center", opacity: anyKids ? 0.5 : 1 }}>
          <input
            type="checkbox"
            checked={playground}
            disabled={anyKids}
            onChange={(e) => setPlayground(e.target.checked)}
          />
          Playground
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center", opacity: anyKids ? 0.5 : 1 }}>
          <input
            type="checkbox"
            checked={kidsRoom}
            disabled={anyKids}
            onChange={(e) => setKidsRoom(e.target.checked)}
          />
          Kids room
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center", opacity: anyKids ? 0.5 : 1 }}>
          <input
            type="checkbox"
            checked={gamesRoom}
            disabled={anyKids}
            onChange={(e) => setGamesRoom(e.target.checked)}
          />
          Games / arcade room
        </label>

        <button onClick={load} style={{ padding: "8px 12px" }}>
          Apply filters
        </button>
      </div>

      {err && <pre style={{ background: "#fee", padding: 12, borderRadius: 8 }}>{err}</pre>}

      <p style={{ marginTop: 8 }}>{venues.length} venues</p>

      <ul style={{ paddingLeft: 16, lineHeight: 1.35 }}>
        {venues.map((v, i) => (
          <li key={v.id ?? `${v.name}-${i}`} style={{ marginBottom: 14 }}>
            <strong>{v.name}</strong>
            {(v.suburb || v.city || v.state) && (
              <div style={{ opacity: 0.75 }}>
                {[v.suburb, v.city, v.state].filter(Boolean).join(", ")}
              </div>
            )}
            {v.address && <div style={{ opacity: 0.8 }}>{v.address}</div>}

            <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap", opacity: 0.85 }}>
              {v.playground ? <span>✅ Playground</span> : null}
              {v.kids_room ? <span>✅ Kids room</span> : null}
              {v.games_room ? <span>✅ Games</span> : null}
            </div>

            {v.playground_notes && (
              <div style={{ marginTop: 6, opacity: 0.7, fontSize: 14 }}>{v.playground_notes}</div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
