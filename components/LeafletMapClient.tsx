"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

type Props = {
  center?: LatLngExpression;
  zoom?: number;
};

export default function LeafletMapClient({ center, zoom = 13 }: Props) {
  const mapCenter: LatLngExpression = center ?? [-27.4698, 153.0251]; // Brisbane

  return (
    <div style={{ height: 620, width: "100%", borderRadius: 12, overflow: "hidden" }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={mapCenter}>
          <Popup>Search area</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
