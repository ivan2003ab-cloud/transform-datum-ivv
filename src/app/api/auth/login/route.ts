import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const SECRET = process.env.JWT_SECRET!;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return NextResponse.json({ error: "Password salah" }, { status: 401 });
  }

  const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "1d" });

  return NextResponse.json({ token, user });
}