import "dotenv/config";

const urls: [string, string][] = [
  ["hero-fashion", "photo-1483985988355-763728e1935b"],
  ["hero-store", "photo-1441986300917-64674bd600d8"],
  ["cat-women", "photo-1469334031218-e382a71b716b"],
  ["cat-men", "photo-1617196034183-421b4040ed20"],
  ["cat-shoes", "photo-1560769629-975ec94e6a86"],
  ["cat-bags", "photo-1566150905458-1bf1fc113f0d"],
  ["cat-casual", "photo-1523398002811-999ca8dec234"],
  ["cat-formal", "photo-1507679799987-c73779587ccf"],
  ["cat-sport", "photo-1549576490-b0b4831ef60a"],
  ["banner1", "photo-1558618666-fcd25c85cd64"],
  ["banner2", "photo-1534528741775-53994a69daeb"],
  ["cat-men2", "photo-1516257984-b1b4d707412e"],
  ["cat-shoes2", "photo-1542291026-7eec264c27ff"], // known good
  ["cat-sport2", "photo-1518611012118-696072aa579a"], // known good
  ["hero3", "photo-1558618047-3c8c76ca7d13"],
  ["hero4", "photo-1445205170230-053b83016050"],
];

async function check(label: string, id: string) {
  const url = `https://images.unsplash.com/${id}?w=600`;
  try {
    const r = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(8000) });
    console.log(`${r.ok ? "✅" : "❌ " + r.status} ${label.padEnd(14)} ${id}`);
  } catch {
    console.log(`❌ timeout     ${label}`);
  }
}

(async () => {
  for (const [l, id] of urls) await check(l, id);
})();
