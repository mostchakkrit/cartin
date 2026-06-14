import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, images: true, price: true, stock: true, slug: true },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, price: true, stock: true, slug: true },
            },
          },
        },
      },
    });
  }

  return cart;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const cart = await getOrCreateCart(session.user.id);
    return NextResponse.json(cart);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId, quantity = 1, size, color } = await req.json();

    const cart = await getOrCreateCart(session.user.id);

    const existing = cart.items.find(
      (i: any) => i.productId === productId && i.size === size && i.color === color
    );

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: { product: true },
      });
      return NextResponse.json(updated);
    }

    const item = await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity, size, color },
      include: { product: true },
    });

    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (itemId) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      const cart = await prisma.cart.findUnique({ where: { userId: session.user.id } });
      if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return NextResponse.json({ message: "Removed" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
