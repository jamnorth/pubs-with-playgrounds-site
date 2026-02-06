import dynamic from "next/dynamic";
import Link from "next/link";

const MapClient = dynamic(() => import("@/components/MapClient"), {
  ssr: false,
  loading: () => (
    <div style={{ height: 620, display: "grid", placeItems: "center" }}>
      Loading map…
    </div>
  ),
});

export default function MapPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Map</h1>
        <Link href="/" style={{ textDecoration: "none" }}>
          ← Back
        </Link>
      </div>

      <div style={{ marginTop: 14, height: 620, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
        <MapClient />
      </div>
    </main>
  );
}
