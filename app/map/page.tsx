import dynamic from "next/dynamic";

const LeafletMapClient = dynamic(() => import("@/components/LeafletMapClient"), {
  ssr: false,
  loading: () => <div style={{ padding: 16 }}>Loading map…</div>,
});

export default function MapPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>Map</h1>
      <LeafletMapClient />
    </main>
  );
}
