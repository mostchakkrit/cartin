import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const { itemId } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { quantity } = await req.json();

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return NextResponse.json({ message: "Item removed" });
    }

    const item = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: true },
    });

    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
