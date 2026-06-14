import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId, rating, comment } = await req.json();

    const deliveredOrder = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: "DELIVERED",
        items: { some: { productId } },
      },
    });
    if (!deliveredOrder) {
      return NextResponse.json(
        { error: "ต้องได้รับสินค้าก่อนจึงจะรีวิวได้" },
        { status: 403 }
      );
    }

    const review = await prisma.review.upsert({
      where: { userId_productId: { userId: session.user.id, productId } },
      create: { userId: session.user.id, productId, rating, comment },
      update: { rating, comment },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
