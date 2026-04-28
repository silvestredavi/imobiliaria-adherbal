import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 6;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { address: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (type) {
      whereClause.type = { equals: type };
    }

    const [properties, totalCount] = await Promise.all([
      prisma.property.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.property.count({ where: whereClause })
    ]);

    // Parse IMAGES JSON mapping (SQLite limitation)
    const formattedProperties = properties.map((prop) => ({
      ...prop,
      images: JSON.parse(prop.images),
      characteristics: JSON.parse(prop.characteristics || "[]"),
    }));

    return NextResponse.json({
      data: formattedProperties,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao listar imóveis:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Acesso não autorizado" }, { status: 401 });
    }

    try {
      const JWT_SECRET = process.env.JWT_SECRET || "imob-secret-dev-only-v1";
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const property = await prisma.property.create({
      data: {
        title: data.title,
        description: data.description,
        price: parseFloat(data.price),
        type: data.type,
        rooms: parseInt(data.rooms),
        bathrooms: parseInt(data.bathrooms),
        area: parseFloat(data.area),
        images: JSON.stringify(data.images || []),
        characteristics: JSON.stringify(data.characteristics || []),
        address: data.address,
      },
    });

    return NextResponse.json(
      { ...property, images: JSON.parse(property.images) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar imóvel:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
