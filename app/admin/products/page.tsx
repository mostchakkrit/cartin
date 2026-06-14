"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form, setForm] = useState({
    name: "", description: "", price: "", comparePrice: "", stock: "",
    categoryId: "", images: "", sizes: "", colors: "", isFeatured: false, isActive: true,
  });

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      if (session?.user.role !== "ADMIN") { router.push("/"); return; }
      loadData();
    }
  }, [status, session]);

  const loadData = async () => {
    setLoading(true);
    const [p, c] = await Promise.all([
      fetch("/api/products?limit=100").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]);
    setProducts(p.products || []);
    setCategories(c);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", comparePrice: "", stock: "", categoryId: "", images: "", sizes: "", colors: "", isFeatured: false, isActive: true });
    setEditProduct(null);
    setShowForm(false);
  };

  const openEdit = (product: any) => {
    setForm({
      name: product.name, description: product.description || "", price: String(product.price),
      comparePrice: product.comparePrice ? String(product.comparePrice) : "", stock: String(product.stock),
      categoryId: product.categoryId, images: product.images.join(", "), sizes: product.sizes.join(", "),
      colors: product.colors.join(", "), isFeatured: product.isFeatured, isActive: product.isActive,
    });
    setEditProduct(product);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      name: form.name, description: form.description, price: parseFloat(form.price),
      comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
      stock: parseInt(form.stock), categoryId: form.categoryId,
      images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
      isFeatured: form.isFeatured, isActive: form.isActive,
    };

    const res = await fetch(editProduct ? `/api/products/${editProduct.id}` : "/api/products", {
      method: editProduct ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(editProduct ? "แก้ไขสินค้าแล้ว" : "เพิ่มสินค้าแล้ว");
      resetForm();
      loadData();
    } else {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ลบสินค้า "${name}" ใช่ไหม?`)) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("ลบสินค้าแล้ว"); loadData(); }
    else toast.error("เกิดข้อผิดพลาด");
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">จัดการสินค้า</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white font-medium rounded-xl hover:bg-blue-800 transition-colors">
          <PlusIcon className="w-4 h-4" /> เพิ่มสินค้า
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-5">{editProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">ชื่อสินค้า *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">คำอธิบาย</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ราคา (฿) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ราคาก่อนลด (฿)</label>
                  <input type="number" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} min="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">จำนวนสต็อก *</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required min="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">หมวดหมู่ *</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">เลือกหมวดหมู่</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">รูปภาพ (URL คั่นด้วย comma)</label>
                  <input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://image1.jpg, https://image2.jpg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ไซส์ (คั่นด้วย comma)</label>
                  <input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="S, M, L, XL" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">สี (คั่นด้วย comma)</label>
                  <input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ดำ, ขาว, น้ำเงิน" />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="rounded" />
                    สินค้าแนะนำ
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
                    เปิดใช้งาน
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-blue-700 text-white font-medium rounded-xl hover:bg-blue-800 transition-colors">บันทึก</button>
                <button type="button" onClick={resetForm} className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm">ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-slate-600 font-medium">
            <tr>
              <th className="text-left px-4 py-3">สินค้า</th>
              <th className="text-left px-4 py-3">หมวดหมู่</th>
              <th className="text-left px-4 py-3">ราคา</th>
              <th className="text-left px-4 py-3">สต็อก</th>
              <th className="text-left px-4 py-3">สถานะ</th>
              <th className="text-right px-4 py-3">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {product.images?.[0] ? (
                        <Image src={product.images[0]} alt="" fill className="object-cover" />
                      ) : <div className="w-full h-full flex items-center justify-center text-lg">👗</div>}
                    </div>
                    <span className="font-medium text-slate-700 line-clamp-1">{product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{product.category?.name}</td>
                <td className="px-4 py-3 font-medium text-blue-700">฿{product.price.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`font-medium ${product.stock === 0 ? "text-red-500" : product.stock < 10 ? "text-orange-500" : "text-green-600"}`}>{product.stock}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {product.isActive ? "เปิด" : "ปิด"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(product)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(product.id, product.name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-12 text-gray-400">ยังไม่มีสินค้า</div>
        )}
      </div>
    </div>
  );
}
