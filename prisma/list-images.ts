import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, images: true },
    orderBy: { createdAt: "asc" },
  });
  products.forEach((p) => {
    console.log(`--- ${p.name} [${p.id}]`);
    p.images.forEach((img, i) => console.log(`  img${i}: ${img}`));
  });
  // ตรวจ URL ซ้ำ
  const allUrls = products.flatMap((p) => p.images);
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const url of allUrls) {
    if (seen.has(url)) dupes.push(url);
    seen.add(url);
  }
  if (dupes.length) {
    console.log("\n⚠️  DUPLICATE URLs:");
    dupes.forEach((u) => console.log("  " + u));
  } else {
    console.log("\n✅ No duplicate URLs");
  }
  console.log(`\nTotal products: ${products.length}, Total images: ${allUrls.length}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
