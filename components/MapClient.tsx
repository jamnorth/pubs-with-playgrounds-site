"use client";

import { useEffect, useMemo, useState } from "react";
import type { LatLngTuple } from "leaflet";

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapClient() {
  // Default to Brisbane-ish so the map always has a valid center
  const fallbackCenter: LatLngTuple = useMemo(() => [-27.4698, 153.0251], []);

  const [center, setCenter] = useState<LatLngTuple>(fallbackCenter);

  // Fix Leaflet marker icon paths in Next/Vercel builds
  useEffect(() => {
    // IMPORTANT: Leaflet must only be imported in the browser
    (async () => {
      const L = (await import("leaflet")).default;

      // @ts-ignore - Leaflet typing mismatch in some builds
      delete (L.Icon.Default.prototype as any)._getIconUrl;


      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    })();
  }, []);

  // Optional: use browser geolocation if available
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
      () => {}, // ignore errors
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={center}>
        <Popup>You are here (or default location)</Popup>
      </Marker>

      <Circle center={center} radius={2000} />
    </MapContainer>
  );
}
