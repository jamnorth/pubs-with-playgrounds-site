"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import react-leaflet pieces (so they never load on the server)
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});
const Circle = dynamic(() => import("react-leaflet").then((m) => m.Circle), {
  ssr: false,
});

type LatLng = { lat: number; lng: number };

export default function MapClient() {
  const [center, setCenter] = useState<LatLng>({ lat: -27.4705, lng: 153.026 }); // Brisbane default
  const [radiusKm, setRadiusKm] = useState<number>(5);

  const mapCenterTuple = useMemo<[number, number]>(
    () => [center.lat, center.lng],
    [center.lat, center.lng]
  );

  // Fix Leaflet marker icons + any window usage ONLY in useEffect (client only)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");

      if (cancelled) return;

      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          Radius (km)
          <input
            type="number"
            min={1}
            max={100}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value || 0))}
            style={{ width: 90 }}
          />
        </label>

        <button
          type="button"
          onClick={() => {
            if (typeof navigator === "undefined" || !navigator.geolocation)
              return;
            navigator.geolocation.getCurrentPosition((pos) => {
              setCenter({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              });
            });
          }}
          style={{ padding: "8px 12px", cursor: "pointer" }}
        >
          Use my location
        </button>
      </div>

      <div
        style={{
          marginTop: 14,
          height: 620,
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <MapContainer
          center={mapCenterTuple}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={mapCenterTuple}>
            <Popup>
              <div>
                <strong>Search center</strong>
                <div>
                  {center.lat.toFixed(5)}, {center.lng.toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>

          <Circle
            center={mapCenterTuple}
            radius={radiusKm * 1000}
            pathOptions={{}}
          />
        </MapContainer>
      </div>
    </div>
  );
}
