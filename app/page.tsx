"use client";

import { useEffect, useState } from "react";

type Venue = {
  id: string;
  name: string;
  address?: string;
  featured?: boolean;
  popularity?: number;
};

export default function Page() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("Brisbane");
  const [sort, setSort] = useState("featured");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const url = `/api/venues?q=${encodeURIComponent(q)}&city=${encodeURIComponent(city)}&sort=${encodeURIComponent(sort)}`;
    const res = await fetch(url);
    const json = await res.json();
    setVenues(json.venues || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [city, sort]); // auto-load on change

  return (
    <main style={{ padding: 20 }}>
      <h1>Pubs with Playgrounds</h1>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "12px 0" }}>
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
          <option>Brisbane</option>
          <option>Gold Coast</option>
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: 10 }}>
          <option value="featured">Featured</option>
          <option value="popular">Most popular</option>
          <option value="name">A–Z</option>
        </select>
      </div>

      <p>{venues.length} venues</p>

      <ul style={{ lineHeight: 1.4 }}>
        {venues.map((v) => (
          <li key={v.id} style={{ marginBottom: 10 }}>
            <strong>{v.featured ? "⭐ " : ""}{v.name}</strong>
            <div style={{ opacity: 0.8 }}>{v.address}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
