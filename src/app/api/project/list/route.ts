import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "No userId" }, { status: 400 });
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc", 
      },
    });

    return NextResponse.json(projects);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}