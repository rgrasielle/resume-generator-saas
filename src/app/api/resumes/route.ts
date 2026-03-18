import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

// GET: Rota para buscar os resumes do usuário logado
export async function GET() {
  try {
    const session = await getAuthSession();

    // 1. Verifica autenticação
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" },
        { status: 401 },
      );
    }

    // 2. Busca dados do usuário logado
    const resumes = await prisma.resume.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 3. Retorna resposta
    return NextResponse.json({
      success: true,
      data: resumes,
    });
  } catch (error) {
    console.error("Erro ao buscar currículos", error);

    return NextResponse.json(
      { success: false, message: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}

// POST: Rota para criar um novo resume
