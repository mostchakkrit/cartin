import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function isOk(photoId: string): Promise<boolean> {
  const url = `https://images.unsplash.com/${photoId}?w=600`;
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(8000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function pick(candidates: string[]): Promise<string | null> {
  for (const id of candidates) {
    if (await isOk(id)) return `https://images.unsplash.com/${id}?w=600`;
  }
  return null;
}

async function main() {
  // --- กำหนด candidates สำหรับแต่ละรูปที่ต้องแก้ ---

  const fixes: {
    productId: string;
    name: string;
    imgIndex: number;
    reason: string;
    candidates: string[];
  }[] = [
    // ============ BROKEN 404 ============
    {
      productId: "cmqcs2izd0000dsu2g6zhm18j", // กระโปรงพลีท
      name: "กระโปรงพลีท",
      imgIndex: 0,
      reason: "404",
      candidates: [
        "photo-1522337360788-8b13dee7a37e",
        "photo-1581044777550-4cfa60707c03",
        "photo-1559181567-c3190b009e09",
        "photo-1624682850019-48a24a977c2a",
        "photo-1434389677669-e08b4cac3105",
      ],
    },
    {
      productId: "cmqcs2j1n0001dsu22k83n90v", // เสื้อฮู้ดดี้
      name: "เสื้อฮู้ดดี้",
      imgIndex: 0,
      reason: "404",
      candidates: [
        "photo-1578681994506-b8f463449011",
        "photo-1541781774459-bb2af2f05b55",
        "photo-1614495894696-8893e97fc5b1",
        "photo-1565693413579-8a73ffa4bdd7",
        "photo-1527719327859-a8da07cd3010",
      ],
    },
    {
      productId: "cmqcs2j2q0002dsu2ok5jfbq9", // กางเกงขายาวสแล็ค
      name: "กางเกงขายาวสแล็ค",
      imgIndex: 0,
      reason: "404",
      candidates: [
        "photo-1560243563-062bfc001d68",
        "photo-1532453288672-3a56f0832a51",
        "photo-1617137968427-85924c800a22",
        "photo-1624378439575-d8705ad7ae80", // already img2 but test
        "photo-1558618666-fcd25c85cd64",
      ],
    },

    // ============ DUPLICATES ============
    // กระเป๋าเป้สะพายหลัง img0 ซ้ำกับ กระเป๋าถือหนัง img2 (photo-1553062407-98eeb64c6a62)
    {
      productId: "cmqcs2j4r0004dsu2faa7y34e",
      name: "กระเป๋าเป้สะพายหลัง",
      imgIndex: 0,
      reason: "duplicate",
      candidates: [
        "photo-1491637639811-60e2756cc1c7",
        "photo-1473188588951-666fce8e7c68",
        "photo-1548036328-c9fa89d128fa", // กระเป๋าถือหนัง img0 — avoid
        "photo-1553062407-98eeb64c6a62", // same as dup — avoid
        "photo-1612831197420-4a8e5fc72aa5",
        "photo-1622560480605-d83c853bc5c3", // already img1 of this product
        "photo-1567401893414-76b7b1e5a7a5",
      ],
    },
    // รองเท้าวิ่ง img0 ซ้ำกับ รองเท้าผ้าใบ img1 (photo-1542291026-7eec264c27ff)
    {
      productId: "cmqcs2j740006dsu2k2okrn53",
      name: "รองเท้าวิ่ง",
      imgIndex: 0,
      reason: "duplicate",
      candidates: [
        "photo-1606107557195-0e29a4b5b4aa",
        "photo-1595950653106-6c9ebd614d3a",
        "photo-1491553895911-0055eca6402d", // รองเท้าผ้าใบ img0 — avoid
        "photo-1542291026-7eec264c27ff", // same as dup — avoid
        "photo-1560769629-975ec94e6a86",
        "photo-1556906781-9a412961a28c",
        "photo-1525966222134-fcfa99b8ae77",
      ],
    },
    // ชุดเซตเสื้อกางเกง img0 ซ้ำกับ ชุดออกกำลังกายโยคะ img1 (photo-1518611012118-696072aa579a)
    {
      productId: "cmqcs2j8g0007dsu231mt96ef",
      name: "ชุดเซตเสื้อกางเกง",
      imgIndex: 0,
      reason: "duplicate",
      candidates: [
        "photo-1534438327276-14e5300c3a48",
        "photo-1571019614242-c5c5dee9f50b",
        "photo-1518611012118-696072aa579a", // same as dup — avoid
        "photo-1549576490-b0b4831ef60a",
        "photo-1593095948071-474c5cc2989d",
        "photo-1517963879433-6ad2a51beca3",
      ],
    },
    // ชุดเซตเสื้อกางเกง img2 ซ้ำกับ ชุดออกกำลังกายโยคะ img2 (photo-1571019613454-1cb2f99b2d8b)
    {
      productId: "cmqcs2j8g0007dsu231mt96ef",
      name: "ชุดเซตเสื้อกางเกง",
      imgIndex: 2,
      reason: "duplicate",
      candidates: [
        "photo-1575052814086-f385e2e2ad1b",
        "photo-1594381898411-846e7d193883",
        "photo-1571019613454-1cb2f99b2d8b", // same as dup — avoid
        "photo-1518310383802-640c2de311b6",
        "photo-1464817739973-0128fe77aaa1",
        "photo-1554284126-aa88f22d8b74",
      ],
    },
  ];

  // --- ทดสอบและเลือก URL ที่ใช้งานได้ ---
  console.log("🔍 Testing candidate URLs...\n");

  const updates: {
    productId: string;
    name: string;
    imgIndex: number;
    oldUrl: string;
    newUrl: string;
  }[] = [];

  for (const fix of fixes) {
    const product = await prisma.product.findUnique({
      where: { id: fix.productId },
      select: { images: true },
    });
    if (!product) { console.log(`  ⚠️  Product not found: ${fix.productId}`); continue; }

    const oldUrl = product.images[fix.imgIndex];
    // Filter out URLs already used in this product or the old dup URL
    const usedInProduct = new Set(product.images);
    const validCandidates = fix.candidates.filter(id => {
      const url = `https://images.unsplash.com/${id}?w=600`;
      return url !== oldUrl && !usedInProduct.has(url);
    });

    const newUrl = await pick(validCandidates);
    if (!newUrl) {
      console.log(`  ❌ ${fix.name} img${fix.imgIndex}: No valid candidate found`);
      continue;
    }
    console.log(`  ✅ ${fix.name} img${fix.imgIndex} [${fix.reason}]: ${newUrl}`);
    updates.push({ productId: fix.productId, name: fix.name, imgIndex: fix.imgIndex, oldUrl, newUrl });
  }

  if (updates.length === 0) {
    console.log("\nNo updates needed.");
    return;
  }

  // --- Apply updates ---
  console.log(`\n📝 Applying ${updates.length} updates...`);
  for (const u of updates) {
    const product = await prisma.product.findUnique({
      where: { id: u.productId },
      select: { images: true },
    });
    if (!product) continue;

    const newImages = [...product.images];
    newImages[u.imgIndex] = u.newUrl;
    await prisma.product.update({ where: { id: u.productId }, data: { images: newImages } });
    console.log(`  ✅ Updated ${u.name} img${u.imgIndex}`);
  }

  console.log("\n🎉 All done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
