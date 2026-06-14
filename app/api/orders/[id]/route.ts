import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (session.user.role !== "ADMIN" && order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, paymentStatus } = await req.json();

    // COD: เมื่อส่งถึงแล้ว (DELIVERED) ให้ set paymentStatus = PAID อัตโนมัติ
    const current = await prisma.order.findUnique({ where: { id }, select: { paymentMethod: true } });
    const resolvedPaymentStatus =
      status === "DELIVERED" && current?.paymentMethod === "cod" ? "PAID" : paymentStatus;

    const order = await prisma.order.update({
      where: { id },
      data: { status, paymentStatus: resolvedPaymentStatus },
    });

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
