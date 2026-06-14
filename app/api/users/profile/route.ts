import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, avatar: true, phone: true, address: true, role: true },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, phone, address, avatar } = await req.json();

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, phone, address, avatar },
      select: { id: true, email: true, name: true, avatar: true, phone: true, address: true },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
