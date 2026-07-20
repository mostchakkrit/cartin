"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

const emptyForm = { name: "", description: "", image: "", coverImage: "" };

export default function AdminCategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      if (session?.user.role !== "ADMIN") { router.push("/"); return; }
      loadData();
    }
  }, [status, session]);

  useEffect(() => {
    if (!showEmojiPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEmojiPicker]);

  const loadData = async () => {
    setLoading(true);
    const data = await fetch("/api/categories").then((r) => r.json());
    setCategories(data);
    setLoading(false);
  };

  const resetForm = () => { setForm({ ...emptyForm }); setEditCat(null); setShowForm(false); setShowEmojiPicker(false); };

  const openEdit = (cat: any) => {
    setForm({ name: cat.name, description: cat.description || "", image: cat.image || "", coverImage: cat.coverImage || "" });
    setEditCat(cat);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(editCat ? `/api/categories/${editCat.id}` : "/api/categories", {
      method: editCat ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { toast.success(editCat ? "แก้ไขแล้ว" : "เพิ่มแล้ว"); resetForm(); loadData(); }
    else toast.error("เกิดข้อผิดพลาด");
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ลบหมวดหมู่ "${name}" ใช่ไหม?`)) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("ลบแล้ว"); loadData(); }
    else toast.error("เกิดข้อผิดพลาด");
  };

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">จัดการหมวดหมู่</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white font-medium rounded-xl hover:bg-blue-800 transition-colors">
          <PlusIcon className="w-4 h-4" /> เพิ่มหมวดหมู่
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={resetForm}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">{editCat ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่"}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อหมวดหมู่ <span className="text-red-400">*</span></label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputClass} placeholder="เช่น เสื้อผ้าผู้หญิง" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">คำอธิบาย</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} placeholder="คำอธิบายสั้นๆ" />
              </div>

              {/* Cover image URL */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL รูปภาพหน้าปก</label>
                <input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} className={inputClass} placeholder="https://images.unsplash.com/..." />
                {form.coverImage && form.coverImage.startsWith("http") && (
                  <div className="mt-2 relative rounded-xl overflow-hidden bg-gray-100" style={{ height: 80 }}>
                    <Image src={form.coverImage} alt="preview" fill className="object-cover" onError={() => {}} />
                  </div>
                )}
              </div>

              {/* Emoji */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ไอคอน Emoji (แสดงเมื่อไม่มีรูป)</label>
                <div className="relative flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="flex items-center gap-3 px-4 py-2.5 border border-gray-200 rounded-xl hover:border-blue-400 transition-colors flex-1 text-left"
                  >
                    <span className="text-2xl">{form.image || "🗂️"}</span>
                    <span className="text-sm text-gray-500">{form.image ? "คลิกเพื่อเปลี่ยน" : "คลิกเพื่อเลือก Emoji"}</span>
                  </button>
                  {form.image && (
                    <button type="button" onClick={() => setForm({ ...form, image: "" })} className="p-2 text-gray-300 hover:text-red-400 flex-shrink-0">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                  {showEmojiPicker && (
                    <div ref={pickerRef} className="absolute z-50 mt-1 left-0" style={{ top: "100%" }}>
                      <EmojiPicker
                        onEmojiClick={(emojiData) => {
                          setForm((f) => ({ ...f, image: emojiData.emoji }));
                          setShowEmojiPicker(false);
                        }}
                        height={380}
                        width={320}
                        searchPlaceholder="ค้นหา emoji..."
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-blue-700 text-white font-medium rounded-xl hover:bg-blue-800 transition-colors">บันทึก</button>
                <button type="button" onClick={resetForm} className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm">ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const hasCover = cat.coverImage?.startsWith("http");
          return (
            <div key={cat.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              {/* Cover image area */}
              <div className="relative bg-gradient-to-br from-blue-100 to-blue-50" style={{ height: 100 }}>
                {hasCover ? (
                  <Image src={cat.coverImage} alt={cat.name} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-600 flex items-center justify-center text-4xl">
                    {cat.image || "🗂️"}
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => openEdit(cat)} className="p-1.5 bg-white/90 text-blue-600 hover:bg-white rounded-lg shadow-sm"><PencilIcon className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 bg-white/90 text-red-500 hover:bg-white rounded-lg shadow-sm"><TrashIcon className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-0.5">
                  {cat.image && <span className="text-lg">{cat.image}</span>}
                  <p className="font-bold text-slate-800">{cat.name}</p>
                </div>
                {cat.description && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{cat.description}</p>}
                <p className="text-xs text-gray-400 mt-2">{cat._count?.products || 0} สินค้า</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
