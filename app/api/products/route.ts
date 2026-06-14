import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const group = searchParams.get("group");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const sort = searchParams.get("sort") || "createdAt";

    // slug กลุ่ม — ใช้ ?group=clothing เพื่อดึงหลาย category พร้อมกัน
    const GROUP_MAP: Record<string, string[]> = {
      clothing: ["womens-clothing", "mens-clothing", "casual", "formal", "sportswear"],
      accessories: ["shoes", "bags"],
    };

    const slug = searchParams.get("slug");

    const where: any = { isActive: true };
    if (group && GROUP_MAP[group]) {
      where.category = { slug: { in: GROUP_MAP[group] } };
    } else if (category) {
      where.category = { slug: category };
    }
    if (slug) where.slug = slug;
    if (search) where.name = { contains: search, mode: "insensitive" };
    if (featured === "true") where.isFeatured = true;

    const orderBy: any = {};
    if (sort === "price_asc") orderBy.price = "asc";
    else if (sort === "price_desc") orderBy.price = "desc";
    else if (sort === "name") orderBy.name = "asc";
    else orderBy.createdAt = "desc";

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          reviews: { select: { rating: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const productsWithRating = products.map((p: any) => ({
      ...p,
      avgRating:
        p.reviews.length > 0
          ? p.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / p.reviews.length
          : 0,
      reviewCount: p.reviews.length,
    }));

    return NextResponse.json({
      products: productsWithRating,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const slug = data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const product = await prisma.product.create({
      data: {
        ...data,
        slug: `${slug}-${Date.now()}`,
      },
      include: { category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
