import Link from "next/link";

export default function SuccessPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Payment received</h1>
      <p>Thanks! Your upgrade is processing. If you don’t see changes shortly, contact us with your venue name.</p>
      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <Link href="/">Back to search</Link>
        <Link href="/owners">Venue owners</Link>
      </div>
    </main>
  );
}
