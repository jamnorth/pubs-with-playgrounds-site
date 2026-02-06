export async function geocodePlace(
  q: string
): Promise<{ lat: number; lng: number; display: string } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    q
  )}&limit=1&addressdetails=0`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as any[];
  if (!data?.length) return null;

  return {
    lat: Number(data[0].lat),
    lng: Number(data[0].lon),
    display: data[0].display_name,
  };
}
