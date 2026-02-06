"use client";

import { useEffect, useMemo, useState } from "react";
import NavigateModal from "@/components/NavigateModal";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { geocodePlace } from "@/lib/geocode";

type Venue = {
  id: string;
  name: string;
  venue_type: string;
  address: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  lat: number;
  lng: number;
  playground_nearby: boolean;
  playground_distance_m: number | null;

  // monetisation/display
  is_featured: boolean;
  featured_rank: number | null;
  hero_image_url: string | null;
  playground_type: string | null;
  playground_notes: string | null;
  cta_url: string | null;
  claimed: boolean;
  distance_m: number;
};

const CITY_PRESETS: { label: string; q: string }[] = [
  { label: "Sydney", q: "Sydney NSW" },
  { label: "Melbourne", q: "Melbourne VIC" },
  { label: "Brisbane", q: "Brisbane QLD" },
  { label: "Perth", q: "Perth WA" },
  { label: "Adelaide", q: "Adelaide SA" },
  { label: "Hobart", q: "Hobart TAS" },
  { label: "Canberra", q: "Canberra ACT" },
  { label: "Darwin", q: "Darwin NT" },
  { label: "Gold Coast", q: "Gold Coast QLD" },
  { label: "Sunshine Coast", q: "Sunshine Coast QLD" },
];

export default function Home() {
  const [loading, setLoading] = useState(false);

  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [centerLabel, setCenterLabel] = useState<string>("");

  const [preset, setPreset] = useState<string>("Brisbane");
  const [suburbQuery, setSuburbQuery] = useState("St Lucia QLD");
  const [radiusKm, setRadiusKm] = useState(8);

  const [onlyPlayground, setOnlyPlayground] = useState(true);
  const [type, setType] = useState<string>("pub");

  const [venues, setVenues] = useState<Venue[]>([]);
  const [error, setError] = useState<string>("");

  const [navOpen, setNavOpen] = useState(false);
  const [navTarget, setNavTarget] = useState<{ lat: number; lng: number; name: string } | null>(null);


  function getLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation not supported on this device/browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setCenterLabel("Your location");
      },
      () => alert("Could not get your location. Check permissions."),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  async function searchSuburb(q?: string) {
    const query = (q ?? suburbQuery).trim();
    if (!query) return;

    setLoading(true);
    const result = await geocodePlace(query);
    setLoading(false);

    if (!result) {
      alert("Could not find that place. Try adding 'QLD/NSW/VIC' etc.");
      return;
    }
    setCenter({ lat: result.lat, lng: result.lng });
    setCenterLabel(result.display);
  }

  async function loadNearby() {
    if (!center) return;
    setLoading(true);
    setError("");

    const { data, error: e } = await supabase.rpc("venues_nearby", {
      in_lat: center.lat,
      in_lng: center.lng,
      radius_m: Math.round(radiusKm * 1000),
      in_type: type || null,
      only_playground: onlyPlayground,
      row_limit: 200,
    });

    setLoading(false);

    if (e) {
      setError(e.message);
      setVenues([]);
      return;
    }
    setVenues((data || []) as Venue[]);
  }

  useEffect(() => {
    // initial city preset
    const p = CITY_PRESETS.find((x) => x.label === preset);
    if (p) {
      setSuburbQuery(p.q);
      searchSuburb(p.q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (center) loadNearby();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, radiusKm, type, onlyPlayground]);

  const showing = useMemo(() => venues || [], [venues]);

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Pubs with Playgrounds</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/map">Map</Link>
          <Link href="/add">Add a venue</Link>
          <Link href="/owners">Venue owners</Link>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={getLocation}>Near me</button>

        <label>
          City{" "}
          <select
            value={preset}
            onChange={async (e) => {
              const next = e.target.value;
              setPreset(next);
              const p = CITY_PRESETS.find((x) => x.label === next);
              if (p) {
                setSuburbQuery(p.q);
                await searchSuburb(p.q);
              }
            }}
          >
            {CITY_PRESETS.map((c) => (
              <option key={c.label} value={c.label}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <input
          value={suburbQuery}
          onChange={(e) => setSuburbQuery(e.target.value)}
          placeholder="Search suburb… e.g. St Lucia QLD"
          style={{ padding: 8, minWidth: 260 }}
        />
        <button onClick={() => searchSuburb()} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Radius: {radiusKm} km</span>
          <input
            type="range"
            min={2}
            max={30}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            style={{ width: 240 }}
          />
        </label>

        <label>
          Venue type{" "}
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="pub">pub</option>
            <option value="bar">bar</option>
            <option value="restaurant">restaurant</option>
            <option value="cafe">cafe</option>
            <option value="nightclub">nightclub</option>
            <option value="biergarten">biergarten</option>
            <option value="fast_food">fast_food</option>
            <option value="food_court">food_court</option>
          </select>
        </label>

        <label>
          <input type="checkbox" checked={onlyPlayground} onChange={(e) => setOnlyPlayground(e.target.checked)} /> Playground nearby
        </label>
      </div>

      <div style={{ marginTop: 12, opacity: 0.85 }}>
        Center: <b>{centerLabel || "Not set"}</b>
      </div>

      {!center && (
        <p style={{ marginTop: 12 }}>
          Use <b>Near me</b> or search a suburb/city to begin.
        </p>
      )}

      {error && <p style={{ marginTop: 12, color: "crimson" }}>{error}</p>}

      {center && (
        <div style={{ marginTop: 16 }}>
          <p>
            Showing <b>{showing.length}</b> results within <b>{radiusKm} km</b>.
          </p>

          <ul style={{ padding: 0, listStyle: "none" }}>
            {showing.map((v) => (
              <li key={v.id} style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, display: "flex", gap: 8, alignItems: "center" }}>
                      {v.is_featured && (
                        <span
                          style={{
                            background: "#f0ca3d",
                            color: "#000",
                            padding: "2px 8px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          ⭐ Featured
                        </span>
                      )}
                      {v.name}
                    </div>

                    {v.is_featured && v.hero_image_url && (
                      <img
                        src={v.hero_image_url}
                        alt={v.name}
                        style={{
                          width: "100%",
                          maxHeight: 180,
                          objectFit: "cover",
                          borderRadius: 8,
                          marginTop: 8,
                          marginBottom: 8,
                        }}
                      />
                    )}

                    <div style={{ opacity: 0.8 }}>{v.venue_type}</div>

                    <div style={{ marginTop: 6 }}>
                      {v.address || [v.suburb, v.state, v.postcode].filter(Boolean).join(", ")}
                    </div>

                    {v.playground_nearby && (
                      <div style={{ marginTop: 6 }}>
                        🛝 Playground nearby{v.playground_distance_m ? ` (~${v.playground_distance_m}m)` : ""}
                        {v.playground_type ? ` • ${v.playground_type}` : ""}
                      </div>
                    )}

                    {v.playground_notes && <div style={{ marginTop: 6, opacity: 0.85 }}>{v.playground_notes}</div>}

                    {v.is_featured && v.cta_url && (
                      <a
                        href={v.cta_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-block",
                          marginTop: 8,
                          padding: "10px 14px",
                          background: "#000",
                          color: "#fff",
                          borderRadius: 8,
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        Visit venue
                      </a>
                    )}

                    <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>
                      Own this venue?{" "}
                      <a href={`/claim?venue_id=${v.id}&name=${encodeURIComponent(v.name)}`} style={{ fontWeight: 700 }}>
                        Claim
                      </a>{" "}
                      or{" "}
                      <a href={`/upgrade?venue_id=${v.id}&name=${encodeURIComponent(v.name)}`} style={{ fontWeight: 700 }}>
                        Feature
                      </a>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", minWidth: 110 }}>
                    <div style={{ fontWeight: 600 }}>{Math.round(v.distance_m)} m</div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lng}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in Maps
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {showing.length >= 200 && <p>Showing first 200 results for performance.</p>}
        </div>
      )}
      {navTarget && (
    <NavigateModal
      open={navOpen}
      onClose={() => setNavOpen(false)}
      lat={navTarget.lat}
      lng={navTarget.lng}
      name={navTarget.name}
    />
  )}
</main>

  );
}
