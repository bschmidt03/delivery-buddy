import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const bathrooms = await prisma.bathroom.findMany({
    include: { ratings: { select: { stars: true } } },
    orderBy: { createdAt: "desc" },
  });

  const result = bathrooms.map((b) => {
    const count = b.ratings.length;
    const avg = count > 0 ? b.ratings.reduce((sum, r) => sum + r.stars, 0) / count : null;
    return {
      id: b.id,
      name: b.name,
      notes: b.notes,
      lat: b.lat,
      lng: b.lng,
      accessible: b.accessible,
      requiresCode: b.requiresCode,
      createdAt: b.createdAt,
      averageRating: avg,
      ratingCount: count,
    };
  });

  return NextResponse.json({ bathrooms: result });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";
  const lat = Number(body?.lat);
  const lng = Number(body?.lng);

  if (!name || name.length > 100) {
    return NextResponse.json({ error: "Give it a short name." }, { status: 400 });
  }
  if (notes.length > 500) {
    return NextResponse.json({ error: "Notes are too long." }, { status: 400 });
  }
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
    return NextResponse.json({ error: "Invalid location." }, { status: 400 });
  }

  const bathroom = await prisma.bathroom.create({
    data: {
      name,
      notes: notes || null,
      lat,
      lng,
      accessible: Boolean(body?.accessible),
      requiresCode: Boolean(body?.requiresCode),
    },
  });

  return NextResponse.json({ bathroom }, { status: 201 });
}
