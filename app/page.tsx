"use client";

import { useEffect, useState } from "react";

type Venue = {
  id?: string;
  name?: string;
  address?: string;
};

export default function Page() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("Brisbane");
  const [sort, setSort] = useState<"name" | "popular">("name");

  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);

  // Always-visible debug info
  const [debug, setDebug] = useState<{
    requestUrl: string;
    status?: number;
    ok?: boolean;
    contentType?: string | null;
    textPreview?: string;
    jsonKeys?: string[];
    parsedSampleCount?: number;
    parsedVenuesCount?: number;
    error?: string;
    time?: string;
  }>({
    requestUrl: "",
  });

  async function load() {
    setLoading(true);

    const requestUrl = `/api/venues?q=${encodeURIComponent(q)}&city=${encodeURIComponent(
      city
    )}&sort=${encodeURIComponent(sort)}`;

    const startTime = new Date().toLocaleTimeString();

    try {
      const res = await fetch(requestUrl, { cache: "no-store" });
      const contentType = res.headers.get("content-type");

      const text = await res.text();
      const textPreview = (text || "").slice(0, 600);

      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }

      // Extract array from a bunch of possible shapes:
      // { venues: [] } OR { sample: [] } OR { data: [] } OR [] directly
      const venuesArray =
        (json && (json.venues ?? json.sample ?? json.data)) ??
        (Array.isArray(json) ? json : null);

      const venuesList: Venue[] = Array.isArray(venuesArray) ? venuesArray : [];

      setVenues(venuesList);

      setDebug({
        requestUrl,
        status: res.status,
        ok: res.ok,
        contentType,
        textPreview,
        jsonKeys: json && typeof json === "object" && !Array.isArray(json) ? Object.keys(json) : [],
        parsedSampleCount: Array.isArray(json?.sample) ? json.sample.length : undefined,
        parsedVenuesCount: venuesList.length,
        error: res.ok ? undefined : (json?.error || json?.message || `HTTP ${res.status}`),
        time: startTime,
      });
    } catch (e: any) {
      setVenues([]);
      setDebug({
        requestUrl,
        status: undefined,
        ok: false,
        contentType: null,
        textPreview: "",
        jsonKeys: [],
        parsedSampleCount: undefined,
        parsedVenuesCount: 0,
        error: e?.message || "Fetch failed (network error)",
        time: startTime,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, sort]);

  return (
    <main style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Pubs with Playgrounds ✅ DEBUG</h1>
      <p style={{ opacity: 0.75, marginTop: 0 }}>Demo search (Supabase-powered)</p>

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

      {/* ALWAYS visible debug panel */}
      <pre
        style={{
          background: "#111",
          color: "#eee",
          padding: 12,
          borderRadius: 8,
          overflowX: "auto",
          fontSize: 12,
          lineHeight: 1.35,
        }}
      >
{`DEBUG (${debug.time ?? ""})
requestUrl: ${debug.requestUrl}
status: ${debug.status ?? "n/a"}  ok: ${String(debug.ok ?? false)}
content-type: ${debug.contentType ?? "n/a"}
json keys: ${(debug.jsonKeys ?? []).join(", ") || "n/a"}
parsed sample count: ${debug.parsedSampleCount ?? "n/a"}
parsed venues count: ${debug.parsedVenuesCount ?? "n/a"}
error: ${debug.error ?? "none"}

body preview:
${debug.textPreview ?? ""}`}
      </pre>

      <p style={{ marginTop: 8 }}>{venues.length} venues</p>

      <ul style={{ paddingLeft: 16, lineHeight: 1.4 }}>
        {venues.map((v, i) => (
          <li key={v.id ?? `${v.name ?? "venue"}-${i}`} style={{ marginBottom: 10 }}>
            <strong>{v.name ?? "(no name)"}</strong>
            {v.address && <div style={{ opacity: 0.8 }}>{v.address}</div>}
          </li>
        ))}
      </ul>
    </main>
  );
}
