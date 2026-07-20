"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ThaiAddressSelect } from "@/components/ThaiAddressSelect";
import { TrashIcon, PencilIcon, PlusIcon, XMarkIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

interface SavedAddress {
  id: string;
  label?: string;
  name: string;
  phone: string;
  address: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

const emptyForm = {
  label: "", name: "", phone: "",
  address: "", subDistrict: "", district: "", province: "", postalCode: "",
  isDefault: false,
};

export default function AddressesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") loadAddresses();
  }, [status]);

  const loadAddresses = () => {
    fetch("/api/addresses").then((r) => r.json()).then((d) => { setAddresses(d); setLoading(false); });
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (a: SavedAddress) => {
    setEditId(a.id);
    setForm({
      label: a.label ?? "",
      name: a.name,
      phone: a.phone,
      address: a.address,
      subDistrict: a.subDistrict,
      district: a.district,
      province: a.province,
      postalCode: a.postalCode,
      isDefault: a.isDefault,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.address || !form.subDistrict || !form.district || !form.province || !form.postalCode) {
      toast.error("กรุณากรอกข้อมูลให้ครบทุกช่อง"); return;
    }
    setSaving(true);
    const payload = {
      label: form.label || undefined,
      name: form.name, phone: form.phone, address: form.address,
      subDistrict: form.subDistrict, district: form.district,
      province: form.province, postalCode: form.postalCode,
      isDefault: form.isDefault,
    };

    if (editId) {
      await fetch("/api/addresses", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editId, ...payload }) });
      toast.success("อัปเดตที่อยู่แล้ว");
    } else {
      await fetch("/api/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      toast.success("เพิ่มที่อยู่แล้ว");
    }
    setSaving(false);
    setShowModal(false);
    loadAddresses();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("ลบที่อยู่แล้ว");
  };

  const handleSetDefault = async (a: SavedAddress) => {
    await fetch("/api/addresses", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: a.id, isDefault: true }) });
    loadAddresses();
    toast.success("ตั้งเป็นที่อยู่หลักแล้ว");
  };

  const inputClass = "w-full px-4 py-2.5 border border-[#DFDFDF] rounded focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm bg-[#F5F5F5] focus:bg-white transition-colors";

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-[#003399] border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">ที่อยู่จัดส่ง</h1>
          <p className="text-[#767676] text-sm mt-1">จัดการที่อยู่สำหรับการจัดส่งสินค้า</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#003399] text-white rounded hover:bg-[#002B80] transition-colors text-sm font-semibold">
          <PlusIcon className="w-4 h-4" /> เพิ่มใหม่
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-16 bg-[#F5F5F5] rounded border border-[#DFDFDF] text-[#767676]">
          <div className="text-5xl mb-3">📦</div>
          <p className="font-medium">ยังไม่มีที่อยู่จัดส่งที่บันทึกไว้</p>
          <p className="text-sm mt-1">กดปุ่ม "เพิ่มใหม่" เพื่อเพิ่มที่อยู่</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <div key={a.id} className={`bg-white border rounded p-5 flex items-start gap-4 shadow-[0_1px_3px_rgba(17,17,17,0.06)] ${a.isDefault ? "border-[#003399]" : "border-[#DFDFDF]"}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-[#111111] text-sm">{a.label || a.name}</p>
                  {a.isDefault && <span className="text-xs bg-[#003399]/10 text-[#003399] px-2 py-0.5 rounded">ค่าเริ่มต้น</span>}
                </div>
                <p className="text-xs text-[#767676]">{a.name} · {a.phone}</p>
                <p className="text-xs text-[#767676] mt-0.5">{a.address} ต.{a.subDistrict} อ.{a.district} จ.{a.province} {a.postalCode}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!a.isDefault && (
                  <button onClick={() => handleSetDefault(a)} title="ตั้งเป็นค่าเริ่มต้น" className="p-2 text-[#DFDFDF] hover:text-[#FFDA1A] hover:bg-[#FFDA1A]/10 rounded transition-colors">
                    <StarIcon className="w-5 h-5" />
                  </button>
                )}
                {a.isDefault && <StarSolid className="w-5 h-5 text-[#FFDA1A] mx-2" />}
                <button onClick={() => openEdit(a)} className="p-2 text-[#767676] hover:text-[#003399] hover:bg-[#003399]/10 rounded transition-colors">
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(a.id)} className="p-2 text-[#767676] hover:text-[#CC0008] hover:bg-[#CC0008]/10 rounded transition-colors">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded w-full max-w-md p-6 shadow-[0_8px_24px_rgba(17,17,17,0.12)] my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#111111]">{editId ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}</h2>
              <button onClick={() => setShowModal(false)} className="text-[#767676] hover:text-[#111111]"><XMarkIcon className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#484848] mb-1">ชื่อที่จำได้ง่าย (ไม่บังคับ)</label>
                <input type="text" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="เช่น บ้าน, ที่ทำงาน" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#484848] mb-1">ชื่อผู้รับ <span className="text-[#CC0008]">*</span></label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ชื่อ-นามสกุล" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#484848] mb-1">เบอร์โทรศัพท์ <span className="text-[#CC0008]">*</span></label>
                  <input type="tel" inputMode="numeric" value={form.phone} maxLength={10}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    placeholder="0812345678" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#484848] mb-1">บ้านเลขที่ / ถนน / ซอย <span className="text-[#CC0008]">*</span></label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} maxLength={100} placeholder="เช่น 123 ซ.สุขุมวิท 11" className={inputClass} />
              </div>
              <ThaiAddressSelect
                value={{ province: form.province, district: form.district, subDistrict: form.subDistrict, zipCode: form.postalCode }}
                onChange={(addr) => setForm((f) => ({ ...f, province: addr.province, district: addr.district, subDistrict: addr.subDistrict, postalCode: addr.zipCode }))}
              />
              <label className="flex items-center gap-2 pt-1">
                <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="rounded accent-[#003399]" />
                <span className="text-sm text-[#484848]">ตั้งเป็นที่อยู่หลัก</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-[#DFDFDF] rounded text-sm font-medium text-[#484848] hover:bg-[#F5F5F5] transition-colors">
                ยกเลิก
              </button>
              <button type="button" onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-[#003399] text-white rounded text-sm font-bold hover:bg-[#002B80] disabled:opacity-60 transition-colors">
                {saving ? "กำลังบันทึก..." : editId ? "บันทึกการแก้ไข" : "เพิ่มที่อยู่"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
