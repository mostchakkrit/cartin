import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("admin1234", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@cartin.com" },
    update: {},
    create: { email: "admin@cartin.com", password: adminPassword, name: "Admin", role: "ADMIN" },
  });
  console.log("✅ Admin user:", admin.email);

  // Test user
  const userPassword = await bcrypt.hash("user1234", 10);
  await prisma.user.upsert({
    where: { email: "user@cartin.com" },
    update: {},
    create: { email: "user@cartin.com", password: userPassword, name: "ลูกค้าทดสอบ", role: "USER" },
  });
  console.log("✅ Test user: user@cartin.com");

  // Categories
  const categories = [
    { name: "เสื้อผ้าผู้หญิง", slug: "womens-clothing", description: "เสื้อผ้าสำหรับผู้หญิง", image: "👗" },
    { name: "เสื้อผ้าผู้ชาย", slug: "mens-clothing", description: "เสื้อผ้าสำหรับผู้ชาย", image: "👕" },
    { name: "รองเท้า", slug: "shoes", description: "รองเท้าทุกประเภท", image: "👟" },
    { name: "กระเป๋า", slug: "bags", description: "กระเป๋าทุกประเภท", image: "👜" },
    { name: "ชุดลำลอง", slug: "casual", description: "เสื้อผ้าใส่เล่น", image: "🧢" },
    { name: "ชุดทำงาน", slug: "formal", description: "เสื้อผ้าสำหรับออฟฟิศ", image: "👔" },
    { name: "ชุดออกกำลังกาย", slug: "sportswear", description: "เสื้อผ้าสำหรับออกกำลัง", image: "🏋️" },
  ];

  const createdCats: Record<string, string> = {};
  for (const cat of categories) {
    const c = await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat });
    createdCats[cat.slug] = c.id;
    console.log("✅ Category:", cat.name);
  }

  // Clear existing products before re-seeding
  await prisma.orderItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  console.log("🗑️  Cleared existing products");

  // 30 products — category-matched images, no duplicates
  const products = [
    // ── Women's Clothing (7) ──────────────────────────────────────────────
    { name: "เดรสฟลอรัล",          price: 590,  comparePrice: 890,  stock: 50,  categorySlug: "womens-clothing", sizes: ["S","M","L","XL"],       colors: ["น้ำเงิน","ชมพู"],          isFeatured: true,
      images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600","https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600","https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600"] },
    { name: "เดรสสายเดี่ยวซาติน",   price: 790,  comparePrice: 1190, stock: 35,  categorySlug: "womens-clothing", sizes: ["S","M","L"],             colors: ["ดำ","แดง","แชมเปญ"],       isFeatured: true,
      images: ["https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=600","https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600","https://images.unsplash.com/photo-1520367445093-50dc08a59d9d?w=600"] },
    { name: "เสื้อคาร์ดิแกนถัก",    price: 490,  comparePrice: 690,  stock: 60,  categorySlug: "womens-clothing", sizes: ["S","M","L","XL"],       colors: ["ครีม","เทา","ชมพูอ่อน"],   isFeatured: false,
      images: ["https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600","https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600","https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600"] },
    { name: "บลาวส์ลูกไม้",         price: 390,  comparePrice: 590,  stock: 70,  categorySlug: "womens-clothing", sizes: ["S","M","L"],             colors: ["ขาว","ครีม"],              isFeatured: false,
      images: ["https://images.unsplash.com/photo-1654758782849-0a2be98c058f?w=600","https://images.unsplash.com/photo-1707368173483-769cc4180628?w=600","https://images.unsplash.com/photo-1745381251702-67b07225e516?w=600"] },
    { name: "กระโปรงพลีทมิดี",      price: 650,  comparePrice: 950,  stock: 40,  categorySlug: "womens-clothing", sizes: ["S","M","L","XL"],       colors: ["ดำ","เขียวขวด","น้ำตาล"], isFeatured: false,
      images: ["https://images.unsplash.com/photo-1606241853208-e8be190ac116?w=600","https://images.unsplash.com/photo-1700748910236-3b744b8dacad?w=600","https://images.unsplash.com/photo-1553096763-6fb9cdc4df14?w=600"] },
    { name: "กางเกงขาบานผู้หญิง",   price: 750,  stock: 55,          categorySlug: "womens-clothing", sizes: ["S","M","L","XL"],       colors: ["ดำ","ขาว","เบจ"],          isFeatured: false,
      images: ["https://images.unsplash.com/photo-1592423777039-7be9f340582b?w=600","https://images.unsplash.com/photo-1711188054272-732954c4c54b?w=600","https://images.unsplash.com/photo-1600710411903-2a03770f2d7f?w=600"] },
    { name: "เสื้อสูทผู้หญิง",       price: 1590, comparePrice: 2200, stock: 25,  categorySlug: "formal",          sizes: ["S","M","L"],             colors: ["ดำ","เทา","น้ำเงินกรม"],   isFeatured: true,
      images: ["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600","https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=600","https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600"] },

    // ── Men's Clothing (6) ────────────────────────────────────────────────
    { name: "เสื้อเชิ้ตผู้ชาย",      price: 390,  comparePrice: 590,  stock: 100, categorySlug: "mens-clothing",   sizes: ["S","M","L","XL","XXL"], colors: ["ขาว","ฟ้า","เทา"],         isFeatured: true,
      images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600","https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600","https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600"] },
    { name: "เสื้อโปโลผู้ชาย",       price: 450,  comparePrice: 650,  stock: 80,  categorySlug: "mens-clothing",   sizes: ["S","M","L","XL","XXL"], colors: ["ขาว","ดำ","น้ำเงิน","แดง"],isFeatured: false,
      images: ["https://images.unsplash.com/photo-1617114919297-3c8ddb01f599?w=600","https://images.unsplash.com/photo-1617662408044-cda3ab7134c9?w=600","https://images.unsplash.com/photo-1626557981101-aae6f84aa6ff?w=600"] },
    { name: "กางเกงชิโนผู้ชาย",      price: 690,  comparePrice: 990,  stock: 70,  categorySlug: "mens-clothing",   sizes: ["28","30","32","34","36"],colors: ["ดำ","กากี","เทา"],         isFeatured: false,
      images: ["https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600","https://images.unsplash.com/photo-1552252059-9d77e4059ad1?w=600","https://images.unsplash.com/photo-1620228922597-cca58f177310?w=600"] },
    { name: "แจ็คเก็ตยีนส์",         price: 990,  comparePrice: 1490, stock: 40,  categorySlug: "mens-clothing",   sizes: ["S","M","L","XL"],       colors: ["ฟ้า","ดำ"],                isFeatured: true,
      images: ["https://images.unsplash.com/photo-1624835567150-0c530a20d8cc?w=600","https://images.unsplash.com/photo-1630173250799-2813d34ed14b?w=600","https://images.unsplash.com/photo-1642886512785-b5fee9faad7f?w=600"] },
    { name: "เสื้อเชิ้ตลินิน",       price: 520,  stock: 65,          categorySlug: "mens-clothing",   sizes: ["S","M","L","XL"],       colors: ["ขาว","ฟ้าอ่อน","เบจ"],    isFeatured: false,
      images: ["https://images.unsplash.com/photo-1636590416708-68a4867918f1?w=600","https://images.unsplash.com/photo-1630667208073-82d53b1db540?w=600","https://images.unsplash.com/photo-1632226390535-2f02c1a93541?w=600"] },
    { name: "สูทผู้ชายครบชุด",        price: 3990, comparePrice: 5500, stock: 15,  categorySlug: "formal",          sizes: ["S","M","L","XL"],       colors: ["ดำ","เทาเข้ม","น้ำเงิน"],  isFeatured: true,
      images: ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600","https://images.unsplash.com/photo-1622973536968-3ead9e780960?w=600","https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600"] },

    // ── Shoes (5) ─────────────────────────────────────────────────────────
    { name: "รองเท้าผ้าใบ",          price: 890,  comparePrice: 1290, stock: 60,  categorySlug: "shoes",           sizes: ["36","37","38","39","40","41","42"], colors: ["ขาว","ดำ"],        isFeatured: true,
      images: ["https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600","https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600","https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600"] },
    { name: "รองเท้าส้นสูง",          price: 1190, comparePrice: 1690, stock: 30,  categorySlug: "shoes",           sizes: ["36","37","38","39","40"],          colors: ["ดำ","แดง","นู้ด"],  isFeatured: true,
      images: ["https://images.unsplash.com/photo-1573100925118-870b8efc799d?w=600","https://images.unsplash.com/photo-1611233299310-f6276ff55307?w=600","https://images.unsplash.com/photo-1632793039179-8d97795d20c6?w=600"] },
    { name: "รองเท้าบูทหนัง",         price: 2290, comparePrice: 3200, stock: 20,  categorySlug: "shoes",           sizes: ["37","38","39","40","41"],          colors: ["ดำ","น้ำตาล"],      isFeatured: false,
      images: ["https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=600","https://images.unsplash.com/photo-1554062614-6da4fa67725a?w=600","https://images.unsplash.com/photo-1553545985-1e0d8781d5db?w=600"] },
    { name: "รองเท้าแตะหนัง",         price: 590,  comparePrice: 890,  stock: 90,  categorySlug: "shoes",           sizes: ["36","37","38","39","40","41","42"], colors: ["ดำ","น้ำตาล","ขาว"],isFeatured: false,
      images: ["https://images.unsplash.com/photo-1539185441755-769473a23570?w=600","https://images.unsplash.com/photo-1596702874230-b5706dfb5bc7?w=600","https://images.unsplash.com/photo-1670607231621-c00fd76d2387?w=600"] },
    { name: "รองเท้าสนีกเกอร์ลำลอง",  price: 1390, comparePrice: 1890, stock: 50,  categorySlug: "shoes",           sizes: ["38","39","40","41","42","43"],      colors: ["ขาว","เทา","ดำ"],   isFeatured: false,
      images: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600","https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=600","https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=600"] },

    // ── Bags (5) ──────────────────────────────────────────────────────────
    { name: "กระเป๋าถือหนัง",         price: 1290, comparePrice: 1890, stock: 30,  categorySlug: "bags",            sizes: [],                        colors: ["น้ำตาล","ดำ"],             isFeatured: true,
      images: ["https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600","https://images.unsplash.com/photo-1589363358751-ab05797e5629?w=600","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600"] },
    { name: "กระเป๋าเป้หนัง",          price: 1590, comparePrice: 2490, stock: 25,  categorySlug: "bags",            sizes: [],                        colors: ["ดำ","น้ำตาล","แดง"],       isFeatured: true,
      images: ["https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=600","https://images.unsplash.com/photo-1597633244018-0201d0158aab?w=600","https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600"] },
    { name: "กระเป๋าคลัทช์",          price: 890,  comparePrice: 1290, stock: 35,  categorySlug: "bags",            sizes: [],                        colors: ["ดำ","ทอง","เงิน"],          isFeatured: false,
      images: ["https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600","https://images.unsplash.com/photo-1559127452-56b800eb2f23?w=600","https://images.unsplash.com/photo-1597633125184-9fd7e54f0ff7?w=600"] },
    { name: "กระเป๋าโท้ตผ้าแคนวาส",   price: 490,  stock: 80,          categorySlug: "bags",            sizes: [],                        colors: ["ขาว","ดำ","น้ำตาล"],       isFeatured: false,
      images: ["https://images.unsplash.com/photo-1543286386-713bdd548da4?w=600","https://images.unsplash.com/photo-1575202332411-b01fe9ace7a8?w=600","https://images.unsplash.com/photo-1560891958-68bb1fe7fb78?w=600"] },
    { name: "กระเป๋าสะพายข้าง",        price: 990,  comparePrice: 1490, stock: 40,  categorySlug: "bags",            sizes: [],                        colors: ["ดำ","น้ำตาล","ครีม"],      isFeatured: false,
      images: ["https://images.unsplash.com/photo-1628149455678-16f37bc392f4?w=600","https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"] },

    // ── Casual (4) ────────────────────────────────────────────────────────
    { name: "กางเกงยีนส์ทรงตรง",      price: 790,  stock: 80,          categorySlug: "casual",          sizes: ["28","30","32","34","36"], colors: ["น้ำเงิน","ดำ"],            isFeatured: false,
      images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=600","https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600","https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600"] },
    { name: "เสื้อยืด Oversized",      price: 290,  comparePrice: 450,  stock: 200, categorySlug: "casual",          sizes: ["S","M","L","XL","XXL"],  colors: ["ขาว","ดำ","เทา","น้ำเงิน"],isFeatured: true,
      images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600","https://images.unsplash.com/photo-1503341733017-1901578f9f1e?w=600","https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600"] },
    { name: "เสื้อฮู้ดดี้",            price: 690,  comparePrice: 990,  stock: 90,  categorySlug: "casual",          sizes: ["S","M","L","XL","XXL"],  colors: ["เทา","ดำ","ครีม","น้ำเงิน"],isFeatured: false,
      images: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600","https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600","https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600"] },
    { name: "กางเกงวอร์มเอวยืด",       price: 490,  comparePrice: 690,  stock: 110, categorySlug: "casual",          sizes: ["S","M","L","XL"],        colors: ["เทา","ดำ","น้ำเงิน"],      isFeatured: false,
      images: ["https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600","https://images.unsplash.com/photo-1632682582909-2b3a2581eef7?w=600","https://images.unsplash.com/photo-1637206614670-e3f13e2c5984?w=600"] },

    // ── Sportswear (3) ────────────────────────────────────────────────────
    { name: "ชุดออกกำลังกายโยคะ",     price: 690,  stock: 45,          categorySlug: "sportswear",      sizes: ["S","M","L","XL"],        colors: ["ดำ","ชมพู","เขียว"],       isFeatured: false,
      images: ["https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600","https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600","https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600"] },
    { name: "ชุดวิ่งผู้หญิง",          price: 890,  comparePrice: 1290, stock: 55,  categorySlug: "sportswear",      sizes: ["S","M","L","XL"],        colors: ["ดำ","ฟ้า","ม่วง"],         isFeatured: true,
      images: ["https://images.unsplash.com/photo-1771513699065-0f0f696341b8?w=600","https://images.unsplash.com/photo-1767794640954-de3a95512394?w=600","https://images.unsplash.com/photo-1714725177129-79b58c9c2ae4?w=600"] },
    { name: "เสื้อกล้ามฟิตเนส",        price: 390,  comparePrice: 590,  stock: 120, categorySlug: "sportswear",      sizes: ["S","M","L","XL"],        colors: ["ดำ","เทา","ขาว","น้ำเงิน"],isFeatured: false,
      images: ["https://images.unsplash.com/photo-1770177264833-3207a54a487f?w=600","https://images.unsplash.com/photo-1544216717-3bbf52512659?w=600","https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600"] },
  ];

  for (const p of products) {
    const slug = `${p.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9฀-๿-]/g, "")}-${Date.now()}`;
    await prisma.product.create({
      data: {
        name: p.name, slug, price: p.price, comparePrice: p.comparePrice || null,
        stock: p.stock, categoryId: createdCats[p.categorySlug],
        sizes: p.sizes, colors: p.colors, isFeatured: p.isFeatured, images: p.images,
      },
    });
    console.log("✅ Product:", p.name);
  }

  console.log("\n🎉 Seeding complete!");
  console.log("👤 Admin: admin@cartin.com / admin1234");
  console.log("👤 User:  user@cartin.com / user1234");
}

main().catch(console.error).finally(() => prisma.$disconnect());
