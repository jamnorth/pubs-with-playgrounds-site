import dynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const MapClient = dynamic(() => import("@/components/MapClient"), {
  ssr: false,
  loading: () => <div style={{ padding: 16 }}>Loading map…</div>,
});

export default function MapPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <h1 style={{ margin: 0 }}>Map</h1>
      <MapClient />
    </main>
  );
}
