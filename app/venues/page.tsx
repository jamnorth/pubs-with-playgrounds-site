import venues from "@/data/venues.json";

type Venue = {
  id: string;
  name: string;
  suburb?: string;
  city?: string;
  state?: string;
  featured?: boolean;
  playground?: boolean;
  rating?: number;
  tags?: string[];
  website?: string;
};

export const dynamic = "force-static";

function asVenue(v: any): Venue {
  return v as Venue;
}

export default function VenuesPage() {
  const list = (venues as any[]).map(asVenue);

  // Featured first, then rating desc, then name
  const sorted = [...list].sort((a, b) => {
    const fa = a.featured ? 1 : 0;
    const fb = b.featured ? 1 : 0;
    if (fb !== fa) return fb - fa;
    const ra = a.rating ?? 0;
    const rb = b.rating ?? 0;
    if (rb !== ra) return rb - ra;
    return a.name.localeCompare(b.name);
  });

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ margin: 0 }}>Venues</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        Featured venues appear at the top. More filters coming soon.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {sorted.map((v) => (
          <div
            key={v.id}
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <h3 style={{ margin: 0 }}>{v.name}</h3>
                  {v.featured && (
                    <span
                      style={{
                        fontSize: 12,
                        padding: "2px 8px",
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.25)",
                      }}
                    >
                      Featured
                    </span>
                  )}
                </div>

                <div style={{ marginTop: 6, opacity: 0.8 }}>
                  {[v.suburb, v.city, v.state].filter(Boolean).join(", ")}
                </div>

                {v.tags?.length ? (
                  <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {v.tags.slice(0, 6).map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: 12,
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.08)",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div style={{ textAlign: "right", minWidth: 120 }}>
                <div style={{ fontSize: 14, opacity: 0.8 }}>
                  Rating: <b>{v.rating ?? "—"}</b>
                </div>
                <div style={{ fontSize: 14, opacity: 0.8, marginTop: 6 }}>
                  Playground: <b>{v.playground ? "Yes" : "No"}</b>
                </div>
                {v.website ? (
                  <div style={{ marginTop: 10 }}>
                    <a href={v.website} target="_blank" rel="noreferrer">
                      Website →
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
