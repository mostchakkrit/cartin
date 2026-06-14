import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function checkUrl(url: string): Promise<{ ok: boolean; status: number }> {
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(8000) });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, images: true },
    orderBy: { createdAt: "asc" },
  });

  console.log("🔍 Checking all image URLs...\n");

  const broken: { product: string; productId: string; index: number; url: string }[] = [];

  for (const p of products) {
    let hasIssue = false;
    for (let i = 0; i < p.images.length; i++) {
      const url = p.images[i];
      const { ok, status } = await checkUrl(url);
      if (!ok) {
        if (!hasIssue) { console.log(`❌ ${p.name}`); hasIssue = true; }
        console.log(`   img${i} [${status}]: ${url}`);
        broken.push({ product: p.name, productId: p.id, index: i, url });
      }
    }
    if (!hasIssue) console.log(`✅ ${p.name}`);
  }

  if (broken.length === 0) {
    console.log("\n🎉 All images load OK!");
  } else {
    console.log(`\n⚠️  ${broken.length} broken images found.`);
    broken.forEach(b => console.log(`   ${b.product} img${b.index}: ${b.url}`));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
