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
