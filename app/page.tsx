import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ margin: 0 }}>Pubs with Playgrounds</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        Find family-friendly venues with playgrounds. Start with the list:
      </p>

      <div style={{ marginTop: 16 }}>
        <Link href="/venues">View venues →</Link>
      </div>
    </main>
  );
}
