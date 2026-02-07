"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Venue = {
  id: string;
  name: string;
  suburb?: string | null;
  city?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;

  // Optional fields (if you have them)
  featured?: boolean | null;
  popularity?: number | null; // higher = more popular
  has_playground?: boolean | null;
  website_url?: string | null;
};

type SortMode = "nearest" | "popular" | "az";

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  return 2 * R * Math.asin(Math.sqrt(h));
}

export default function MapPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortMode, setSortMode] = useState<SortMode>("nearest");
  const [onlyPlayground, setOnlyPlayground] = useState(false);

  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [geoDenied, setGeoDenied] = useState(false);

  // Fetch venues from API (client-side, so build won’t crash)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/venues", { cache: "no-store" });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || `Failed to load venues (${res.status})`);
        }
        const data = (await res.json()) as Venue[];
        if (!cancelled) setVenues(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load venues");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Ask for location only if sorting by nearest
  useEffect(() => {
    if (sortMode !== "nearest") return;

    if (!("geolocation" in navigator)) {
      setGeoDenied(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setGeoDenied(true);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [sortMode]);

  const filteredAndSorted = useMemo(() => {
    const filtered = venues.filter((v) => {
      if (onlyPlayground) {
        // treat null as unknown; only show explicit true when filtering
        return v.has_playground === true;
      }
      return true;
    });

    // Featured ALWAYS at the top
    const featured = filtered.filter((v) => v.featured === true);
    const normal = filtered.filter((v) => v.featured !== true);

    const sortChunk = (list: Venue[]) => {
      if (sortMode === "az") {
        return [...list].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      }

      if (sortMode === "popular") {
        return [...list].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
      }

      // nearest
      if (!userPos) {
        // If no location, fall back to A–Z so it’s stable
        return [...list].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      }

      return [...list].sort((a, b) => {
        const aHas = typeof a.lat === "number" && typeof a.lng === "number";
        const bHas = typeof b.lat === "number" && typeof b.lng === "number";
        if (!aHas && !bHas) return 0;
        if (!aHas) return 1;
        if (!bHas) return -1;

        const da = haversineKm(userPos.lat, userPos.lng, a.lat!, a.lng!);
        const db = haversineKm(userPos.lat, userPos.lng, b.lat!, b.lng!);
        return da - db;
      });
    };

    return [...sortChunk(featured), ...sortChunk(normal)];
  }, [venues, sortMode, onlyPlayground, userPos]);

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Venues</h1>
        <Link href="/" style={{ textDecoration: "underline" }}>
          Back
        </Link>
      </div>

      <p style={{ marginTop: 8, color: "rgba(255,255,255,0.7)" }}>
        Scroll the list, sort by nearest or popular, and keep Featured venues pinned to the top.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          marginTop: 16,
          marginBottom: 16,
          padding: 12,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ opacity: 0.8 }}>Sort</span>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            style={{ padding: "8px 10px", borderRadius: 10 }}
          >
            <option value="nearest">Nearest</option>
            <option value="popular">Most popular</option>
            <option value="az">A–Z</option>
          </select>
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={onlyPlayground}
            onChange={(e) => setOnlyPlayground(e.target.checked)}
          />
          <span>Playground only</span>
        </label>

        {sortMode === "nearest" && !userPos && (
          <span style={{ opacity: 0.75 }}>
            {geoDenied
              ? "Location blocked — showing A–Z instead."
              : "Getting your location…"}
          </span>
        )}
      </div>

      {loading && <p>Loading venues…</p>}

      {!loading && error && (
        <div style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,0,0,0.35)" }}>
          <p style={{ margin: 0 }}>Couldn’t load venues: {error}</p>
          <p style={{ marginTop: 8, opacity: 0.8 }}>
            If this is your first deploy, make sure Supabase env vars are set (see below).
          </p>
        </div>
      )}

      {!loading && !error && filteredAndSorted.length === 0 && (
        <p>No venues found.</p>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {filteredAndSorted.map((v) => {
          const isFeatured = v.featured === true;

          let distanceText: string | null = null;
          if (sortMode === "nearest" && userPos && typeof v.lat === "number" && typeof v.lng === "number") {
            const km = haversineKm(userPos.lat, userPos.lng, v.lat, v.lng);
            distanceText = `${km.toFixed(km < 10 ? 1 : 0)} km away`;
          }

          return (
            <div
              key={v.id}
              style={{
                padding: 14,
                borderRadius: 14,
                border: isFeatured
                  ? "1px solid rgba(240,202,61,0.6)"
                  : "1px solid rgba(255,255,255,0.12)",
                background: isFeatured ? "rgba(240,202,61,0.08)" : "transparent",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0 }}>{v.name}</h3>
                    {isFeatured && (
                      <span
                        style={{
                          fontSize: 12,
                          padding: "3px 8px",
                          borderRadius: 999,
                          border: "1px solid rgba(240,202,61,0.7)",
                        }}
                      >
                        Featured
                      </span>
                    )}
                    {v.has_playground === true && (
                      <span
                        style={{
                          fontSize: 12,
                          padding: "3px 8px",
                          borderRadius: 999,
                          border: "1px solid rgba(255,255,255,0.2)",
                          opacity: 0.9,
                        }}
                      >
                        Playground
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: 6, opacity: 0.8 }}>
                    {[v.suburb, v.city].filter(Boolean).join(", ")}
                  </div>

                  {v.address && (
                    <div style={{ marginTop: 6, opacity: 0.7 }}>
                      {v.address}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: "right", opacity: 0.85, minWidth: 140 }}>
                  {distanceText && <div>{distanceText}</div>}
                  {typeof v.popularity === "number" && (
                    <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                      Popularity: {v.popularity}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                {v.website_url && (
                  <a
                    href={v.website_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "underline" }}
                  >
                    Website
                  </a>
                )}

                {/* Directions link (works fine and does NOT cause this build error) */}
                {(typeof v.lat === "number" && typeof v.lng === "number") && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "underline" }}
                  >
                    Directions
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
