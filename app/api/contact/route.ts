import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);

    const contact = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        userId: session?.user?.id ?? null,
      },
    });

    return NextResponse.json({ success: true, id: contact.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await prisma.contactMessage.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
