import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 12;
    const skip = (page - 1) * limit;

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    let isAuthenticated = false;

    if (token) {
      try {
        const JWT_SECRET = process.env.JWT_SECRET || "imob-secret-dev-only-v1";
        jwt.verify(token, JWT_SECRET);
        isAuthenticated = true;
      } catch {
        // ignore
      }
    }

    const whereClause: Prisma.PropertyWhereInput = {};

    if (!isAuthenticated) {
      whereClause.exibir = true;
    }

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
      images: prop.images ? JSON.parse(prop.images) : [],
      characteristics: prop.characteristics ? JSON.parse(prop.characteristics) : [],
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
        description: data.description || null,
        price: data.price ? parseFloat(data.price) : null,
        type: data.type,
        rooms: data.rooms ? parseInt(data.rooms) : null,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
        area: data.area ? parseFloat(data.area) : null,
        images: JSON.stringify(data.images || ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80"]),
        characteristics: JSON.stringify(data.characteristics || []),
        address: data.address || null,
        exibir: data.exibir !== undefined ? data.exibir : true,
      },
    });

    revalidateTag("properties", "max");

    return NextResponse.json(
      { ...property, images: property.images ? JSON.parse(property.images) : [] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar imóvel:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json({ error: "ID do imóvel é obrigatório" }, { status: 400 });
    }

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

    const updateData: Prisma.PropertyUpdateInput = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.price !== undefined) updateData.price = data.price ? parseFloat(data.price) : null;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.rooms !== undefined) updateData.rooms = data.rooms ? parseInt(data.rooms) : null;
    if (data.bathrooms !== undefined) updateData.bathrooms = data.bathrooms ? parseInt(data.bathrooms) : null;
    if (data.area !== undefined) updateData.area = data.area ? parseFloat(data.area) : null;
    if (data.images !== undefined) updateData.images = data.images && data.images.length > 0 ? JSON.stringify(data.images) : JSON.stringify(["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80"]);
    if (data.characteristics !== undefined) updateData.characteristics = data.characteristics ? JSON.stringify(data.characteristics) : JSON.stringify([]);
    if (data.address !== undefined) updateData.address = data.address || null;
    if (data.exibir !== undefined) updateData.exibir = data.exibir;

    const property = await prisma.property.update({
      where: { id: data.id },
      data: updateData,
    });

    revalidateTag("properties", "max");

    return NextResponse.json({ message: "Imóvel atualizado com sucesso", id: property.id });
  } catch (error) {
    console.error("Erro ao atualizar imóvel:", error);
    return NextResponse.json({ error: "Erro interno do servidor ao atualizar" }, { status: 500 });
  }
}
