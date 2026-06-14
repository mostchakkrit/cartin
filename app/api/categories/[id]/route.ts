import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const category = await prisma.category.update({ where: { id }, data });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({ where: { categoryId: id }, select: { id: true } });
    const productIds = products.map((p) => p.id);

    if (productIds.length > 0) {
      await prisma.review.deleteMany({ where: { productId: { in: productIds } } });
      await prisma.cartItem.deleteMany({ where: { productId: { in: productIds } } });
      await prisma.orderItem.deleteMany({ where: { productId: { in: productIds } } });
      await prisma.product.deleteMany({ where: { categoryId: id } });
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: "Category deleted" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
