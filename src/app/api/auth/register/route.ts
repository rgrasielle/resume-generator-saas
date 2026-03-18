import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    const email = validation.data.email.toLowerCase();
    const password = validation.data.password;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (!existingUser.password) {
        return NextResponse.json(
          {
            success: false,
            message: "Use o login com Google para acessar sua conta",
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Não foi possível criar a conta",
        },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Usuário criado com sucesso",
        data: {
          id: user.id,
          email: user.email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro no registro:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erro interno no servidor",
      },
      { status: 500 },
    );
  }
}
