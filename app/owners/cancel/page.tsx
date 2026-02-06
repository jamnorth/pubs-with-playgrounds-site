import Link from "next/link";

export default function CancelPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Checkout cancelled</h1>
      <p>No worries — nothing was charged.</p>
      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <Link href="/">Back to search</Link>
        <Link href="/owners">Venue owners</Link>
      </div>
    </main>
  );
}
