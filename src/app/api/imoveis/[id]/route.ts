import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      ...property,
      images: JSON.parse(property.images),
      characteristics: JSON.parse(property.characteristics || "[]"),
    });
  } catch (error) {
    console.error("Erro ao buscar imóvel:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
