"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import NavigateModal from "@/components/NavigateModal";

import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, Circle, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type LatLng = { lat: number; lng: number };

export default function MapPage() {
  const [center, setCenter] = useState<LatLng | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [type, setType] = useState<string>("all");
  const [onlyPlayground, setOnlyPlayground] = useState<boolean>(true);
  const [navOpen, setNavOpen] = useState(false);

  // Fix default marker icons in Next bundling (client-only)
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
    });
  }, []);

  // Default to Brisbane until we have geolocation/search hooked up
  useEffect(() => {
    if (!center) setCenter({ lat: -27.4698, lng: 153.0251 });
  }, [center]);

  const mapCenter: LatLngExpression = useMemo(
    () => [center?.lat ?? -27.4698, center?.lng ?? 153.0251],
    [center]
  );

  const radiusMeters = radiusKm * 1000;

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Map</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/" style={{ textDecoration: "underline" }}>
            Back to list
          </Link>
          <button
            onClick={() => setNavOpen(true)}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              cursor: "pointer"
            }}
          >
            Directions
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          Radius (km)
          <input
            type="number"
            min={1}
            max={50}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value || 5))}
            style={{ width: 90 }}
          />
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All</option>
            <option value="pub">Pub</option>
            <option value="club">Club</option>
            <option value="cafe">Cafe</option>
            <option value="restaurant">Restaurant</option>
          </select>
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={onlyPlayground}
            onChange={(e) => setOnlyPlayground(e.target.checked)}
          />
          Only venues with playgrounds
        </label>
      </div>

      <div style={{ marginTop: 14, height: 620, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
        <MapContainer center={mapCenter} zoom={13} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Circle center={mapCenter} radius={radiusMeters} pathOptions={{ fillOpacity: 0.08 }} />

          <Marker position={mapCenter}>
            <Popup>
              Your search area (demo)<br />
              Radius: {radiusKm}km<br />
              Type: {type}<br />
              Playground: {onlyPlayground ? "Yes" : "No"}
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <NavigateModal
        open={navOpen}
        onClose={() => setNavOpen(false)}
        destination={
          center
            ? { name: "Search center", lat: center.lat, lng: center.lng }
            : { name: "Brisbane", lat: -27.4698, lng: 153.0251 }
        }
      />
    </main>
  );
}
