"use client";

import { useEffect } from "react";

export default function NavigateModal({
  open,
  onClose,
  lat,
  lng,
  name,
}: {
  open: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  name: string;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const gmaps = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${lat},${lng}`;
  const apple = `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
  const waze = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;

  const cardStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    textDecoration: "none",
    border: "1px solid #e6e6e6",
    fontWeight: 800,
    color: "#111",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 9999,
        padding: 16,
        fontFamily: "system-ui",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #eee",
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            padding: 14,
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Navigate</div>
            <div style={{ fontSize: 13, opacity: 0.75, marginTop: 2 }}>{name}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "1px solid #ddd",
              background: "#fff",
              borderRadius: 10,
              padding: "6px 10px",
              fontWeight: 800,
            }}
          >
            Close
          </button>
        </div>

        <div style={{ padding: 14, display: "grid", gap: 10 }}>
          <a href={gmaps} target="_blank" rel="noreferrer" style={cardStyle}>
            <span>🗺️ Google Maps</span>
            <span style={{ opacity: 0.6 }}>›</span>
          </a>

          <a href={apple} target="_blank" rel="noreferrer" style={cardStyle}>
            <span>🍎 Apple Maps</span>
            <span style={{ opacity: 0.6 }}>›</span>
          </a>

          <a href={waze} target="_blank" rel="noreferrer" style={cardStyle}>
            <span>🚗 Waze</span>
            <span style={{ opacity: 0.6 }}>›</span>
          </a>

          <div style={{ fontSize: 12, opacity: 0.7 }}>
            Tip: If you’re on iPhone, Apple Maps opens fastest. If you prefer Google, choose Google Maps.
          </div>
        </div>
      </div>
    </div>
  );
}
