"use client";

import { useEffect, useMemo } from "react";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapClient() {
  // Default to Brisbane-ish so it always renders
  const center = useMemo<LatLngExpression>(() => [-27.4698, 153.0251], []);

  useEffect(() => {
    // Fix default marker icons in Next/Vercel builds
    // (do this ONLY on the client)
    // @ts-ignore
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <div style={{ marginTop: 14, height: 620, borderRadius: 12, overflow: "hidden" }}>
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={center}>
          <Popup>Brisbane</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
