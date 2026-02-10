"use client";

import { useEffect, useState } from "react";

type Venue = {
  id?: string;
  name: string;
  address?: string;
};

export default function Page() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("Brisbane");
  const [sort, setSort] = useState<"name" | "popular">("name");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);

    const url = `/api/venues?q=${encodeURIComponent(q)}&city=${encodeURIComponent(
      city
    )}&sort=${encodeURIComponent(sort)}`;

    const res = await fetch(url);
    const json = await res.json();

    if (!res.ok) {
      setErr(json?.error || "Search failed");
      setVenues([]);
      setLoading(false);
      return;
    }

    setVenues(json.venues || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, sort]);

  return (
    <main style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Pubs with Playgrounds</h1>
      <p style={{ opacity: 0.75, marginTop: 0 }}>
        Demo search (Supabase-powered)
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "16px 0" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or suburb…"
          style={{ padding: 10, minWidth: 260 }}
        />
        <button onClick={load} style={{ padding: "10px 14px" }}>
          {loading ? "Searching…" : "Search"}
        </button>

        <select value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: 10 }}>
          <option value="Brisbane">Brisbane</option>
          <option value="Gold Coast">Gold Coast</option>
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value as any)} style={{ padding: 10 }}>
          <option value="name">A–Z</option>
          <option value="popular">Most popular</option>
        </select>
      </div>

      {err && (
        <pre style={{ background: "#fee", padding: 12, borderRadius: 8 }}>
          {err}
        </pre>
      )}

      <p style={{ marginTop: 8 }}>{venues.length} venues</p>

      <ul style={{ paddingLeft: 16, lineHeight: 1.4 }}>
        {venues.map((v, i) => (
          <li key={v.id ?? `${v.name}-${i}`} style={{ marginBottom: 10 }}>
            <strong>{v.name}</strong>
            {v.address && <div style={{ opacity: 0.8 }}>{v.address}</div>}
          </li>
        ))}
      </ul>
    </main>
  );
}
