import { NextResponse } from "next/server";
import type { OsmRestroom } from "@/types/bathroom";

export const runtime = "nodejs";

// The public Overpass instances rate-limit and occasionally 504; try each in order.
const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
// Refuse huge bounding boxes so a zoomed-out map can't hammer Overpass.
const MAX_BBOX_DEGREES = 0.5;
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 200;
const MAX_RESULTS = 120;

type CacheEntry = { at: number; restrooms: OsmRestroom[] };
const cache = new Map<string, CacheEntry>();

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function normalize(el: OverpassElement): OsmRestroom | null {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (lat == null || lng == null) return null;

  const tags = el.tags ?? {};
  // Private facilities aren't useful to a driver passing through.
  if (tags.access === "private" || tags.access === "no") return null;

  return {
    id: `osm-${el.type}-${el.id}`,
    name: tags.name || "Public restroom",
    lat,
    lng,
    accessible: tags.wheelchair === "yes",
    fee: tags.fee === "yes",
    openingHours: tags.opening_hours || null,
  };
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const south = Number(params.get("south"));
  const west = Number(params.get("west"));
  const north = Number(params.get("north"));
  const east = Number(params.get("east"));

  if (
    ![south, west, north, east].every(Number.isFinite) ||
    south >= north ||
    west >= east ||
    south < -90 ||
    north > 90 ||
    west < -180 ||
    east > 180
  ) {
    return NextResponse.json({ error: "Invalid bounds." }, { status: 400 });
  }
  if (north - south > MAX_BBOX_DEGREES || east - west > MAX_BBOX_DEGREES) {
    return NextResponse.json({ error: "Zoom in to load community restrooms." }, { status: 400 });
  }

  // Round the bbox so tiny pans reuse the same cache entry.
  const key = [south, west, north, east].map((n) => n.toFixed(2)).join(",");
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json({ restrooms: hit.restrooms });
  }

  const query = `
    [out:json][timeout:10];
    nwr["amenity"="toilets"](${south},${west},${north},${east});
    out center ${MAX_RESULTS};
  `;

  let elements: OverpassElement[] | null = null;
  for (const url of OVERPASS_URLS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          // Overpass rejects requests without an identifying User-Agent.
          "User-Agent": "delivery-buddy/0.1 (pit-stop restroom map)",
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) throw new Error(`Overpass ${res.status}`);
      const data = await res.json();
      elements = data.elements ?? [];
      break;
    } catch (err) {
      console.error(`Overpass fetch failed (${url}):`, err);
    }
  }
  if (elements === null) {
    return NextResponse.json(
      { error: "Community restroom data is unavailable right now." },
      { status: 502 }
    );
  }

  const restrooms = elements
    .map(normalize)
    .filter((r): r is OsmRestroom => r !== null);

  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, { at: Date.now(), restrooms });

  return NextResponse.json({ restrooms });
}
