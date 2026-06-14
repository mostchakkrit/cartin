import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const cats = await prisma.category.findMany();
  const cat = (slug: string) => cats.find((c) => c.slug === slug)!.id;

  const products = [
    {
      name: "กระโปรงพลีท",
      description: "กระโปรงพลีทสไตล์เกาหลี ผ้าชีฟองเนื้อนุ่ม ทรงเอ ยาวระดับเข่า ดูหวานน่ารัก เหมาะใส่เที่ยว หรือออกงานสบายๆ มีซิปข้างซ่อน",
      price: 450, comparePrice: 690, stock: 60,
      categoryId: cat("womens-clothing"),
      sizes: ["S", "M", "L", "XL"], colors: ["ดำ", "ขาว", "ชมพู", "น้ำเงิน"],
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1583496661160-fb5218ee1fa7?w=600",
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600",
        "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=600",
      ],
    },
    {
      name: "เสื้อฮู้ดดี้",
      description: "เสื้อฮู้ดดี้ทรง Oversize ผ้าฝ้ายผสมโพลีเอสเตอร์ เนื้อนุ่มหนา อุ่นสบาย มีกระเป๋าหน้าจิงโจ้ ฮู้ดปรับสายได้ เหมาะสำหรับใส่ในอากาศเย็น",
      price: 590, comparePrice: 890, stock: 80,
      categoryId: cat("casual"),
      sizes: ["S", "M", "L", "XL", "XXL"], colors: ["เทา", "ดำ", "น้ำเงิน", "ครีม"],
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600",
        "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600",
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600",
      ],
    },
    {
      name: "กางเกงขายาวสแล็ค",
      description: "กางเกงขายาวสแล็คทรงตรง ผ้า Polyester Blend เนื้อดีไม่ยับ เหมาะใส่ทำงานหรือออกงาน ดูสุภาพเรียบร้อย มีซิปหน้าและกระเป๋าข้าง 2 ใบ",
      price: 690, comparePrice: 990, stock: 45,
      categoryId: cat("formal"),
      sizes: ["28", "30", "32", "34", "36"], colors: ["ดำ", "กรมท่า", "เทา"],
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1594938298603-c8148c4b4463?w=600",
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600",
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600",
      ],
    },
    {
      name: "รองเท้าส้นสูง",
      description: "รองเท้าส้นสูง 3 นิ้ว หนังสังเคราะห์คุณภาพดี ส้นเข็มเสริมความสูง สายรัดข้อเท้า ใส่สบาย เหมาะกับชุดทำงานหรือชุดออกงาน",
      price: 990, comparePrice: 1490, stock: 35,
      categoryId: cat("shoes"),
      sizes: ["36", "37", "38", "39", "40"], colors: ["ดำ", "เบจ", "แดง"],
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600",
        "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600",
        "https://images.unsplash.com/photo-1596703263926-eb0762ee17e4?w=600",
      ],
    },
    {
      name: "กระเป๋าเป้สะพายหลัง",
      description: "กระเป๋าเป้อเนกประสงค์ ความจุขนาดใหญ่ 25 ลิตร มีช่องแล็ปท็อปกันกระแทก ผ้า Oxford กันน้ำ สายสะพายปรับได้ เหมาะสำหรับทำงาน เรียน หรือท่องเที่ยว",
      price: 1190, comparePrice: 1690, stock: 40,
      categoryId: cat("bags"),
      sizes: [], colors: ["ดำ", "เทา", "น้ำเงิน"],
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
        "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600",
        "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600",
      ],
    },
    {
      name: "เสื้อโปโล",
      description: "เสื้อโปโลคลาสสิก ผ้าคอตตอนพิเก้ 100% เนื้อแน่น ระบายอากาศดี มีกระดุม 3 เม็ดที่คอ เหมาะใส่ทำงาน กอล์ฟ หรือกิจกรรม smart casual",
      price: 490, comparePrice: 690, stock: 70,
      categoryId: cat("mens-clothing"),
      sizes: ["S", "M", "L", "XL", "XXL"], colors: ["ขาว", "ดำ", "น้ำเงิน", "แดง"],
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600",
        "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?w=600",
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600",
      ],
    },
    {
      name: "รองเท้าวิ่ง",
      description: "รองเท้าวิ่งเพื่อสุขภาพ พื้นยาง EVA รองรับแรงกระแทกสูง วัสดุด้านบนถักตาข่ายระบายอากาศได้ดี น้ำหนักเบา เหมาะสำหรับวิ่ง ออกกำลังกาย หรือใส่ทั่วไป",
      price: 1290, comparePrice: 1890, stock: 50,
      categoryId: cat("shoes"),
      sizes: ["39", "40", "41", "42", "43", "44"], colors: ["ดำ/ขาว", "น้ำเงิน/ส้ม", "เทา/เขียว"],
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600",
        "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600",
      ],
    },
    {
      name: "ชุดเซตเสื้อกางเกง",
      description: "ชุดเซต 2 ชิ้น เสื้อแขนสั้น + กางเกงขาสั้น ผ้า Spandex นุ่มยืดหยุ่น เหมาะใส่ออกกำลังกาย โยคะ หรือใส่อยู่บ้านสบายๆ ดีไซน์ทันสมัย ลดราคาพิเศษซื้อเป็นเซต",
      price: 790, comparePrice: 1190, stock: 55,
      categoryId: cat("sportswear"),
      sizes: ["S", "M", "L", "XL"], colors: ["ดำ", "ชมพู", "เขียวมิ้นต์", "ม่วง"],
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600",
        "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600",
      ],
    },
  ];

  console.log("🛍️  Adding products...");
  for (const p of products) {
    const slug = `${p.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9ก-๛-]/g, "")}-${Date.now()}`;
    await prisma.product.create({ data: { ...p, slug } });
    console.log(`✅ ${p.name}`);
  }
  console.log("\n🎉 Done! Added 8 products.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
