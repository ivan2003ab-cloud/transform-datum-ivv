import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID wajib" },
        { status: 400 }
      );
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal hapus project" },
      { status: 500 }
    );
  }
}