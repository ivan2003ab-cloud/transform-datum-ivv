import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  const hashed = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: "Email sudah dipakai" }, { status: 400 });
  }
}