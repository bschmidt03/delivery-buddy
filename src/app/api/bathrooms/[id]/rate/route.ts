import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const stars = Number(body?.stars);

  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return NextResponse.json({ error: "Rating must be 1-5 stars." }, { status: 400 });
  }

  const bathroom = await prisma.bathroom.findUnique({ where: { id } });
  if (!bathroom) {
    return NextResponse.json({ error: "Bathroom not found." }, { status: 404 });
  }

  const rating = await prisma.rating.create({
    data: { stars, bathroomId: id },
  });

  return NextResponse.json({ rating }, { status: 201 });
}
