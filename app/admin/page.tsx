"use client";

import { useEffect, useState } from "react";

type Claim = {
  id: string;
  created_at: string;
  status: string;
  claimant_email: string;
  claimant_message: string | null;
  venue_id: string;
  venue_name: string;
};

type Submission = {
  id: string;
  created_at: string;
  status: string;
  submitted_name: string;
  submitted_venue_type: string | null;
  submitted_address: string | null;
  submitted_lat: number | null;
  submitted_lng: number | null;
  submitted_website: string | null;
  submitted_phone: string | null;
  submitted_notes: string | null;
};

export default function AdminPage() {
  const [tab, setTab] = useState<"claims" | "submissions" | "featured">("claims");
  const [claims, setClaims] = useState<Claim[]>([]);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadClaims() {
    setLoading(true);
    const res = await fetch("/api/admin/claims");
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return alert(data.error || "Failed to load claims");
    setClaims(data.items || []);
  }

  async function loadSubmissions() {
    setLoading(true);
    const res = await fetch("/api/admin/submissions");
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return alert(data.error || "Failed to load submissions");
    setSubs(data.items || []);
  }

  async function approveClaim(id: string) {
    setLoading(true);
    const res = await fetch("/api/admin/claims", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "approve" }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return alert(data.error || "Failed");
    await loadClaims();
  }

  async function rejectClaim(id: string) {
    const reason = prompt("Reject reason (optional):") || "";
    setLoading(true);
    const res = await fetch("/api/admin/claims", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "reject", reason }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return alert(data.error || "Failed");
    await loadClaims();
  }

  async function approveSubmission(id: string) {
    setLoading(true);
    const res = await fetch("/api/admin/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "approve" }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return alert(data.error || "Failed");
    await loadSubmissions();
  }

  async function rejectSubmission(id: string) {
    const reason = prompt("Reject reason (optional):") || "";
    setLoading(true);
    const res = await fetch("/api/admin/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "reject", reason }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return alert(data.error || "Failed");
    await loadSubmissions();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  useEffect(() => {
    if (tab === "claims") loadClaims();
    if (tab === "submissions") loadSubmissions();
  }, [tab]); // eslint-disable-line

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Admin</h1>
        <button onClick={logout}>Log out</button>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
        <button onClick={()=>setTab("claims")} style={{ fontWeight: tab==="claims" ? 800 : 600 }}>Claims</button>
        <button onClick={()=>setTab("submissions")} style={{ fontWeight: tab==="submissions" ? 800 : 600 }}>Submissions</button>
        <button onClick={()=>setTab("featured")} style={{ fontWeight: tab==="featured" ? 800 : 600 }}>Featured</button>
      </div>

      {loading && <p style={{ opacity: 0.7 }}>Working…</p>}

      {tab === "claims" && (
        <section style={{ marginTop: 14 }}>
          <h2>Claim requests</h2>
          <p style={{ opacity: 0.85 }}>Approve sets the venue to <b>claimed=true</b> and marks request approved.</p>

          {claims.length === 0 ? <p>No claim requests.</p> : (
            <div style={{ display: "grid", gap: 10 }}>
              {claims.map((c)=>(
                <div key={c.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{c.venue_name}</div>
                      <div style={{ fontSize: 13, opacity: 0.8 }}>Status: {c.status} • {new Date(c.created_at).toLocaleString()}</div>
                      <div style={{ marginTop: 6 }}><b>Email:</b> {c.claimant_email}</div>
                      {c.claimant_message && <div style={{ marginTop: 6 }}><b>Message:</b> {c.claimant_message}</div>}
                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>Venue ID: {c.venue_id}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <button onClick={()=>approveClaim(c.id)} disabled={loading}>Approve</button>
                      <button onClick={()=>rejectClaim(c.id)} disabled={loading}>Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "submissions" && (
        <section style={{ marginTop: 14 }}>
          <h2>Venue submissions</h2>
          <p style={{ opacity: 0.85 }}>Approve adds to venues as <b>manual/&lt;id&gt;</b> and approves submission.</p>

          {subs.length === 0 ? <p>No submissions.</p> : (
            <div style={{ display: "grid", gap: 10 }}>
              {subs.map((s)=>(
                <div key={s.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{s.submitted_name}</div>
                      <div style={{ fontSize: 13, opacity: 0.8 }}>Status: {s.status} • {new Date(s.created_at).toLocaleString()}</div>
                      <div style={{ marginTop: 6 }}><b>Type:</b> {s.submitted_venue_type || "-"}</div>
                      <div style={{ marginTop: 6 }}><b>Address:</b> {s.submitted_address || "-"}</div>
                      <div style={{ marginTop: 6 }}><b>Lat/Lng:</b> {s.submitted_lat ?? "-"}, {s.submitted_lng ?? "-"}</div>
                      {s.submitted_notes && <div style={{ marginTop: 6 }}><b>Notes:</b> {s.submitted_notes}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <button onClick={()=>approveSubmission(s.id)} disabled={loading}>Approve</button>
                      <button onClick={()=>rejectSubmission(s.id)} disabled={loading}>Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "featured" && (
        <section style={{ marginTop: 14 }}>
          <h2>Featured listings</h2>
          <p style={{ opacity: 0.85 }}>
            For now: featured is managed by Stripe (automatic) or by editing the venue in Supabase.
            If you want, I can add an in-admin featured editor (rank, hero image, CTA URL).
          </p>
        </section>
      )}
    </main>
  );
}
