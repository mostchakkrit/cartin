import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const methods = await prisma.savedPaymentMethod.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(methods);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type, label, bankName, accountNumber, accountName, cardLast4, cardExpiry, cardBrand, setDefault } = body;

  if (setDefault) {
    await prisma.savedPaymentMethod.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  const method = await prisma.savedPaymentMethod.create({
    data: {
      userId: session.user.id,
      type, label, bankName, accountNumber, accountName,
      cardLast4, cardExpiry, cardBrand,
      isDefault: setDefault ?? false,
    },
  });

  return NextResponse.json(method, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, label, bankName, accountNumber, accountName, cardLast4, cardExpiry, cardBrand, isDefault } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  if (isDefault) {
    await prisma.savedPaymentMethod.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  const method = await prisma.savedPaymentMethod.updateMany({
    where: { id, userId: session.user.id },
    data: { label, bankName, accountNumber, accountName, cardLast4, cardExpiry, cardBrand, ...(isDefault !== undefined ? { isDefault } : {}) },
  });

  return NextResponse.json(method);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.savedPaymentMethod.deleteMany({
    where: { id, userId: session.user.id },
  });
  return NextResponse.json({ success: true });
}
