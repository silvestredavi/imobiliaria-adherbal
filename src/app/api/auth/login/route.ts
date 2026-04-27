import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "imob-secret-dev-only-v1";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
    }

    // Único usuário aceito no momento
    if (email !== "admin@admin" || password !== "admin@28081970") {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    // Login mockado com sucesso
    const token = jwt.sign({ userId: "admin-123", email }, JWT_SECRET, { expiresIn: "1d" });

    // Set HTTPOnly cookie
    const response = NextResponse.json({ message: "Login realizado com sucesso", user: { id: "admin-123", email }});
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
