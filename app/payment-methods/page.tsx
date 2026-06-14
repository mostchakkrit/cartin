"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { BANKS, BankIcon, VisaIcon, MastercardIcon } from "@/components/PaymentIcons";
import { TrashIcon, PencilIcon, PlusIcon, XMarkIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

interface SavedMethod {
  id: string; type: string; label?: string;
  bankName?: string; accountNumber?: string; accountName?: string;
  cardLast4?: string; cardExpiry?: string; cardBrand?: string; isDefault: boolean;
}

const emptyForm = {
  type: "bank_transfer",
  label: "", bankName: "", accountNumber: "", accountName: "",
  cardNumber: "", cardExpiry: "", cardCvv: "", cardBrand: "visa",
  isDefault: false,
};

export default function PaymentMethodsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [methods, setMethods] = useState<SavedMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") loadMethods();
  }, [status]);

  const loadMethods = () => {
    fetch("/api/payment-methods").then((r) => r.json()).then((d) => { setMethods(d); setLoading(false); });
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (m: SavedMethod) => {
    setEditId(m.id);
    setForm({
      type: m.type,
      label: m.label ?? "",
      bankName: m.bankName ?? "",
      accountNumber: m.accountNumber ?? "",
      accountName: m.accountName ?? "",
      cardNumber: m.cardLast4 ? `···· ···· ···· ${m.cardLast4}` : "",
      cardExpiry: m.cardExpiry ?? "",
      cardCvv: "",
      cardBrand: m.cardBrand ?? "visa",
      isDefault: m.isDefault,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (form.type === "bank_transfer" && (!form.bankName || !form.accountNumber || !form.accountName)) {
      toast.error("กรุณากรอกข้อมูลธนาคารให้ครบ"); return;
    }
    if (form.type === "credit_card" && (!form.cardExpiry)) {
      toast.error("กรุณากรอกวันหมดอายุบัตร"); return;
    }
    setSaving(true);
    const payload: Record<string, unknown> = {
      label: form.label || undefined,
      isDefault: form.isDefault,
    };
    if (form.type === "bank_transfer") {
      Object.assign(payload, { bankName: form.bankName, accountNumber: form.accountNumber, accountName: form.accountName });
    } else {
      const raw = form.cardNumber.replace(/\D/g, "");
      if (raw.length === 16) payload.cardLast4 = raw.slice(-4);
      Object.assign(payload, { cardExpiry: form.cardExpiry, cardBrand: form.cardBrand });
    }

    if (editId) {
      await fetch("/api/payment-methods", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editId, ...payload }) });
      toast.success("อัปเดตแล้ว");
    } else {
      await fetch("/api/payment-methods", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: form.type, ...payload }) });
      toast.success("เพิ่มวิธีชำระเงินแล้ว");
    }
    setSaving(false);
    setShowModal(false);
    loadMethods();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/payment-methods?id=${id}`, { method: "DELETE" });
    setMethods((prev) => prev.filter((m) => m.id !== id));
    toast.success("ลบแล้ว");
  };

  const handleSetDefault = async (m: SavedMethod) => {
    await fetch("/api/payment-methods", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: m.id, isDefault: true }) });
    loadMethods();
    toast.success("ตั้งเป็นค่าเริ่มต้นแล้ว");
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">วิธีชำระเงิน</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการบัญชีธนาคารและบัตรที่บันทึกไว้</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors text-sm font-medium">
          <PlusIcon className="w-4 h-4" /> เพิ่มใหม่
        </button>
      </div>

      {methods.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl text-gray-400">
          <div className="text-5xl mb-3">💳</div>
          <p className="font-medium">ยังไม่มีวิธีชำระเงินที่บันทึกไว้</p>
          <p className="text-sm mt-1">กดปุ่ม "เพิ่มใหม่" เพื่อเพิ่ม</p>
        </div>
      ) : (
        <div className="space-y-3">
          {methods.map((m) => (
            <div key={m.id} className={`bg-white border rounded-2xl p-5 flex items-center gap-4 shadow-sm ${m.isDefault ? "border-blue-300" : "border-gray-100"}`}>
              <div className="flex-shrink-0">
                {m.type === "bank_transfer" && m.bankName ? <BankIcon bankId={m.bankName} size={40} /> : m.cardBrand === "visa" ? <VisaIcon size={36} /> : <MastercardIcon size={36} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-slate-800 text-sm">{m.label || (m.type === "bank_transfer" ? "โอนธนาคาร" : "บัตรเครดิต / เดบิต")}</p>
                  {m.isDefault && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">ค่าเริ่มต้น</span>}
                </div>
                {m.type === "bank_transfer" ? (
                  <div className="text-xs text-gray-400">
                    <p>{BANKS.find((b) => b.id === m.bankName)?.name}</p>
                    <p>เลขบัญชี ···{m.accountNumber?.slice(-4)} · {m.accountName}</p>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400">
                    <p className="capitalize">{m.cardBrand}</p>
                    <p>···· ···· ···· {m.cardLast4} · หมดอายุ {m.cardExpiry}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!m.isDefault && (
                  <button onClick={() => handleSetDefault(m)} title="ตั้งเป็นค่าเริ่มต้น" className="p-2 text-gray-300 hover:text-yellow-400 hover:bg-yellow-50 rounded-xl transition-colors">
                    <StarIcon className="w-5 h-5" />
                  </button>
                )}
                {m.isDefault && <StarSolid className="w-5 h-5 text-yellow-400 mx-2" />}
                <button onClick={() => openEdit(m)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(m.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">{editId ? "แก้ไขวิธีชำระเงิน" : "เพิ่มวิธีชำระเงิน"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5" /></button>
            </div>

            {/* Type selector — ซ่อนถ้า edit */}
            {!editId && (
              <div className="flex gap-3 mb-5">
                {[
                  { value: "bank_transfer", label: "โอนธนาคาร" },
                  { value: "credit_card", label: "บัตรเครดิต/เดบิต" },
                ].map((t) => (
                  <button key={t.value} type="button" onClick={() => setForm({ ...form, type: t.value })}
                    className={`flex-1 py-2 border rounded-xl text-sm font-medium transition-colors ${form.type === t.value ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-blue-300"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">ชื่อที่จำได้ง่าย (ไม่บังคับ)</label>
                <input type="text" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="เช่น บัญชีหลัก, บัตรส่วนตัว" className={inputClass} />
              </div>

              {form.type === "bank_transfer" ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">ธนาคาร</label>
                    <div className="grid grid-cols-2 gap-2">
                      {BANKS.map((b) => (
                        <button key={b.id} type="button" onClick={() => setForm({ ...form, bankName: b.id })}
                          className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs transition-colors ${form.bankName === b.id ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}>
                          <BankIcon bankId={b.id} size={22} />
                          <span className="truncate">{b.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">เลขบัญชี</label>
                    <input type="text" value={form.accountNumber} maxLength={14}
                      onChange={(e) => {
                        const d = e.target.value.replace(/\D/g, "").slice(0, 10);
                        let f = d;
                        if (d.length > 3) f = d.slice(0,3) + "-" + d.slice(3);
                        if (d.length > 4) f = d.slice(0,3) + "-" + d.slice(3,4) + "-" + d.slice(4);
                        if (d.length > 9) f = d.slice(0,3) + "-" + d.slice(3,4) + "-" + d.slice(4,9) + "-" + d.slice(9);
                        setForm({ ...form, accountNumber: f });
                      }}
                      placeholder="XXX-X-XXXXX-X" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">ชื่อบัญชี</label>
                    <input type="text" value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} placeholder="ชื่อ-นามสกุล" className={inputClass} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">ประเภทบัตร</label>
                    <div className="flex gap-3">
                      {["visa", "mastercard"].map((brand) => (
                        <button key={brand} type="button" onClick={() => setForm({ ...form, cardBrand: brand })}
                          className={`flex items-center gap-2 px-3 py-2 border rounded-xl transition-colors ${form.cardBrand === brand ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}>
                          {brand === "visa" ? <VisaIcon size={22} /> : <MastercardIcon size={22} />}
                          <span className="text-xs font-medium capitalize">{brand}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">หมายเลขบัตร</label>
                    <input type="text" value={form.cardNumber} maxLength={19}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                        setForm({ ...form, cardNumber: v.replace(/(.{4})/g, "$1 ").trim() });
                      }}
                      placeholder="0000 0000 0000 0000" className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">วันหมดอายุ</label>
                      <input type="text" value={form.cardExpiry} maxLength={5}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                          setForm({ ...form, cardExpiry: v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v });
                        }}
                        placeholder="MM/YY" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        CVV <span className="text-gray-400 font-normal">(ไม่ถูกบันทึก)</span>
                      </label>
                      <input type="password" value={form.cardCvv} maxLength={4}
                        onChange={(e) => setForm({ ...form, cardCvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                        placeholder="•••" className={inputClass} />
                    </div>
                  </div>
                </>
              )}

              <label className="flex items-center gap-2 pt-1">
                <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="rounded text-blue-600" />
                <span className="text-sm text-slate-600">ตั้งเป็นวิธีชำระเงินค่าเริ่มต้น</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-gray-50 transition-colors">
                ยกเลิก
              </button>
              <button type="button" onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-bold hover:bg-blue-800 disabled:opacity-60 transition-colors">
                {saving ? "กำลังบันทึก..." : editId ? "บันทึกการแก้ไข" : "เพิ่มวิธีชำระเงิน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
