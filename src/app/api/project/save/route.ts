import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  const body = await req.json();

  const {
    name,
    metode,
    userId,
    rawData,
    globalTest,
    snooping,
    parameter,
  } = body;

  const project = await prisma.project.create({
    data: {
      name,
      metode,
      userId,
      rawData,
      globalTest,
      snooping,
      parameter,
    },
  });

  return NextResponse.json(project);
}