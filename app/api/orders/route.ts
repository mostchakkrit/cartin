import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where = session.user.role === "ADMIN" ? {} : { userId: session.user.id };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, images: true, slug: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { shippingAddress, paymentMethod, notes } = await req.json();

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const subtotal = cart.items.reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0);
    const shippingCost = subtotal >= 1000 ? 0 : 50;
    const total = subtotal + shippingCost;

    // โอนธนาคาร / บัตรเครดิต → ถือว่าชำระแล้วทันที
    const paymentStatus = ["bank_transfer", "credit_card"].includes(paymentMethod) ? "PAID" : "UNPAID";

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        subtotal,
        shippingCost,
        total,
        shippingAddress,
        paymentMethod,
        paymentStatus,
        notes,
        items: {
          create: cart.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            size: item.size,
            color: item.color,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
