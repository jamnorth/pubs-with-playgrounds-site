"use client";

import { useEffect, useState } from "react";
import NavigateModal from "@/components/NavigateModal";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { geocodePlace } from "@/lib/geocode";

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";

// Fix default marker icons in Next bundling
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Venue = {
  id: string;
  name: string;
  venue_type: string;
  address: string | null;
  lat: number;
  lng: number;
  playground_nearby: boolean;
  playground_distance_m: number | null;
  is_featured: boolean;
  featured_rank: number | null;
  cta_url: string | null;
  distance_m: number;
};

const CITY_PRESETS: { label: string; q: string; zoom: number }[] = [
  { label: "Sydney", q: "Sydney NSW", zoom: 12 },
  { label: "Melbourne", q: "Melbourne VIC", zoom: 12 },
  { label: "Brisbane", q: "Brisbane QLD", zoom: 12 },
  { label: "Perth", q: "Perth WA", zoom: 12 },
  { label: "Adelaide", q: "Adelaide SA", zoom: 12 },
  { label: "Hobart", q: "Hobart TAS", zoom: 12 },
  { label: "Canberra", q: "Canberra ACT", zoom: 12 },
  { label: "Darwin", q: "Darwin NT", zoom: 12 },
  { label: "Gold Coast", q: "Gold Coast QLD", zoom: 12 },
  { label: "Sunshine Coast", q: "Sunshine Coast QLD", zoom: 11 },
];

export default function MapPage() {
  const [loading, setLoading] = useState(false);

  const [center, setCenter] = useState<{ lat: number; lng: number } | null>({ lat: -27.4698, lng: 153.0251 });
  const [label, setLabel] = useState("Brisbane (default)");
  const [preset, setPreset] = useState("Brisbane");
  const [suburbQuery, setSuburbQuery] = useState("Brisbane QLD");

  const [zoom, setZoom] = useState(12);
  const [radiusKm, setRadiusKm] = useState(8);
  const [onlyPlayground, setOnlyPlayground] = useState(true);
  const [type, setType] = useState("pub");

  const [venues, setVenues] = useState<Venue[]>([]);
  const [error, setError] = useState("");

  const [navOpen, setNavOpen] = useState(false);
  const [navTarget, setNavTarget] = useState<{ lat: number; lng: number; name: string } | null>(null);


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
      row_limit: 600,
    });

    setLoading(false);
    if (e) {
      setError(e.message);
      setVenues([]);
      return;
    }
    setVenues((data || []) as Venue[]);
  }

  async function searchPlace(q?: string) {
    const query = (q ?? suburbQuery).trim();
    if (!query) return;

    setLoading(true);
    const r = await geocodePlace(query);
    setLoading(false);
    if (!r) return alert("Could not find that place. Try adding a state like NSW/VIC/QLD.");
    setCenter({ lat: r.lat, lng: r.lng });
    setLabel(r.display);
  }

  function nearMe() {
    if (!navigator.geolocation) return alert("Geolocation not supported.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLabel("Your location");
      },
      () => alert("Could not get your location.")
    );
  }

  useEffect(() => {
    // initial load
    loadNearby();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (center) loadNearby();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, radiusKm, type, onlyPlayground]);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Map</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/">List</Link>
          <Link href="/add">Add a venue</Link>
          <Link href="/owners">Venue owners</Link>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={nearMe}>Near me</button>

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
                setZoom(p.zoom);
                await searchPlace(p.q);
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

        <input value={suburbQuery} onChange={(e) => setSuburbQuery(e.target.value)} style={{ padding: 8, minWidth: 260 }} />
        <button onClick={() => searchPlace()} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Radius: {radiusKm} km</span>
          <input type="range" min={2} max={30} value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))} style={{ width: 240 }} />
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

      <div style={{ marginTop: 10, opacity: 0.85 }}>
        Center: <b>{label}</b> • Pins: <b>{venues.length}</b>
      </div>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ marginTop: 14, height: 620, border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
        <MapContainer center={[center?.lat || -27.4698, center?.lng || 153.0251]} zoom={zoom} style={{ height: "100%", width: "100%" }}>
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {center && <Circle center={[center.lat, center.lng]} radius={radiusKm * 1000} />}

          {venues.map((v) => (
            <Marker key={v.id} position={[v.lat, v.lng]}>
              <Popup>
                <div style={{ fontWeight: 700 }}>{v.is_featured ? "⭐ " : ""}{v.name}</div>
                <div style={{ opacity: 0.8 }}>{v.venue_type}</div>
                <div style={{ marginTop: 6 }}>{v.address || ""}</div>
                {v.playground_nearby && <div style={{ marginTop: 6 }}>🛝 Nearby{v.playground_distance_m ? ` (~${v.playground_distance_m}m)` : ""}</div>}
                <div style={{ marginTop: 6, fontWeight: 600 }}>{Math.round(v.distance_m)} m away</div>

                <div style={{ marginTop: 8 }}>
                  <button
                  onClick={() => {
                    setNavTarget({ lat: v.lat, lng: v.lng, name: v.name });
                    setNavOpen(true);
                  }}
                  style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", fontWeight: 900 }}
                >
                  Navigate
                </button>
                </div>

                <div style={{ marginTop: 8 }}>
                  <a href={`/claim?venue_id=${v.id}&name=${encodeURIComponent(v.name)}`} style={{ fontWeight: 700 }}>Claim</a>
                  {" • "}
                  <a href={`/upgrade?venue_id=${v.id}&name=${encodeURIComponent(v.name)}`} style={{ fontWeight: 700 }}>Feature</a>
                </div>

                {v.is_featured && v.cta_url && (
                  <div style={{ marginTop: 8 }}>
                    <a href={v.cta_url} target="_blank" rel="noreferrer" style={{ fontWeight: 800 }}>
                      Visit venue
                    </a>
                  </div>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {venues.length >= 600 && <p style={{ marginTop: 10 }}>Showing first 600 pins for performance.</p>}
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
