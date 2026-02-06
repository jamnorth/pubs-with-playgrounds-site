"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    if (!password.trim()) return alert("Password required.");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) return alert(data.error || "Login failed");
    window.location.href = "/admin";
  }

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Admin login</h1>
      <p style={{ opacity: 0.85 }}>Enter the admin password to manage claims, submissions, and featured listings.</p>

      <label style={{ display: "block", marginTop: 12 }}>
        Password
        <input
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
        />
      </label>

      <button onClick={login} disabled={loading} style={{ marginTop: 12, padding: 12, width: "100%", fontWeight: 800 }}>
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </main>
  );
}
