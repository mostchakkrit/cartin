import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await prisma.savedAddress.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(addresses);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { label, name, phone, address, subDistrict, district, province, postalCode, isDefault } = body;

  if (!name || !phone || !address || !subDistrict || !district || !province || !postalCode) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }

  if (isDefault) {
    await prisma.savedAddress.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  const saved = await prisma.savedAddress.create({
    data: {
      userId: session.user.id,
      label, name, phone, address, subDistrict, district, province, postalCode,
      isDefault: isDefault ?? false,
    },
  });

  return NextResponse.json(saved, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, label, name, phone, address, subDistrict, district, province, postalCode, isDefault } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  if (isDefault) {
    await prisma.savedAddress.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.savedAddress.updateMany({
    where: { id, userId: session.user.id },
    data: {
      label, name, phone, address, subDistrict, district, province, postalCode,
      ...(isDefault !== undefined ? { isDefault } : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.savedAddress.deleteMany({
    where: { id, userId: session.user.id },
  });
  return NextResponse.json({ success: true });
}
