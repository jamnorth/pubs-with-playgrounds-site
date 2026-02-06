"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

type LatLng = { lat: number; lng: number };

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

export default function MapClient() {
  const [ready, setReady] = useState(false);
  const [center, setCenter] = useState<LatLng>({ lat: -27.4698, lng: 153.0251 });

  useEffect(() => {
    let mounted = true;

    (async () => {
      const L = await import("leaflet"); // ✅ only on client

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (navigator?.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (!mounted) return;
            setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          () => {},
          { enableHighAccuracy: true, timeout: 7000 }
        );
      }

      if (mounted) setReady(true);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const mapCenter = useMemo(() => [center.lat, center.lng] as [number, number], [center]);

  if (!ready) return <div style={{ padding: 16 }}>Loading map…</div>;

  return (
    <div style={{ marginTop: 14, height: 620, borderRadius: 12, overflow: "hidden" }}>
      <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={mapCenter}>
          <Popup>You are here (or Brisbane fallback)</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
