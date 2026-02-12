"use client";

import { useEffect, useState } from "react";

type Venue = { id?: string; name: string; address?: string };

export default function Page() {
  const [q, setQ] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      const res = await fetch(`/api/venues?q=${encodeURIComponent(q)}`, { cache: "no-store" });
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
    <main style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Pubs with Playgrounds</h1>
      <p style={{ opacity: 0.75, marginTop: 0 }}>Search venues</p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "16px 0" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or address…"
          style={{ padding: 10, minWidth: 260 }}
        />
        <button onClick={load} style={{ padding: "10px 14px" }}>
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {err && <pre style={{ background: "#fee", padding: 12, borderRadius: 8 }}>{err}</pre>}

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
