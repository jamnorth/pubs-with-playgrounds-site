"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

// Fix default marker icons for bundlers
const DefaultIcon = L.icon({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    L.Marker.prototype.options.icon = DefaultIcon;
    setMounted(true);
  }, []);

  const center = useMemo<[number, number]>(() => [-27.4698, 153.0251], []); // Brisbane default

  if (!mounted) return <div style={{ padding: 16 }}>Loading map…</div>;

  return (
    <div style={{ marginTop: 14, height: 620, borderRadius: 12, overflow: "hidden" }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={center}>
          <Popup>Brisbane</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
