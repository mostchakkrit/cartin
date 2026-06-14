"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ThaiAddressSelect } from "@/components/ThaiAddressSelect";
import { BANKS, BankIcon, VisaIcon, MastercardIcon, CodIcon } from "@/components/PaymentIcons";

interface SavedMethod {
  id: string; type: string; label?: string;
  bankName?: string; accountNumber?: string; accountName?: string;
  cardLast4?: string; cardExpiry?: string; cardBrand?: string; isDefault: boolean;
}

interface SavedAddress {
  id: string; label?: string; name: string; phone: string;
  address: string; subDistrict: string; district: string; province: string; postalCode: string; isDefault: boolean;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, total, fetchCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [savedMethods, setSavedMethods] = useState<SavedMethod[]>([]);
  const [useSaved, setUseSaved] = useState<string>("");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [useSavedAddress, setUseSavedAddress] = useState<string>("");

  const [form, setForm] = useState({
    name: "", phone: "", address: "",
    province: "", district: "", subDistrict: "", postalCode: "",
    paymentMethod: "cod", notes: "",
    bankName: "", accountNumber: "", accountName: "",
    cardNumber: "", cardExpiry: "", cardCvv: "", cardBrand: "visa",
    savePayment: false, paymentLabel: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      fetchCart();
      if (session?.user.name) setForm((f) => ({ ...f, name: session.user.name }));
      fetch("/api/payment-methods").then((r) => r.json()).then((data) => {
        setSavedMethods(data);
        const def = data.find((m: SavedMethod) => m.isDefault);
        if (def) setUseSaved(def.id);
      });
      fetch("/api/addresses").then((r) => r.json()).then((data) => {
        setSavedAddresses(data);
        const def = data.find((a: SavedAddress) => a.isDefault);
        if (def) {
          setUseSavedAddress(def.id);
          setForm((f) => ({ ...f, name: def.name, phone: def.phone, address: def.address, subDistrict: def.subDistrict, district: def.district, province: def.province, postalCode: def.postalCode }));
        }
      });
    }
  }, [status]);

  const shippingCost = total >= 1000 ? 0 : 50;

  const handleUseSavedAddress = (a: SavedAddress) => {
    setUseSavedAddress(a.id);
    setForm((f) => ({ ...f, name: a.name, phone: a.phone, address: a.address, subDistrict: a.subDistrict, district: a.district, province: a.province, postalCode: a.postalCode }));
  };

  const handleUseSaved = (m: SavedMethod) => {
    setUseSaved(m.id);
    setForm((f) => ({
      ...f,
      paymentMethod: m.type,
      bankName: m.bankName ?? "", accountNumber: m.accountNumber ?? "", accountName: m.accountName ?? "",
      cardLast4: m.cardLast4 ?? "", cardExpiry: m.cardExpiry ?? "", cardBrand: m.cardBrand ?? "visa",
      cardNumber: "", cardCvv: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) { toast.error("ตะกร้าว่างเปล่า"); return; }
    if (!form.province || !form.district || !form.subDistrict) { toast.error("กรุณาเลือกจังหวัด อำเภอ และตำบล"); return; }

    // Save payment if requested
    if (form.savePayment && !useSaved) {
      const payload: Record<string, unknown> = { type: form.paymentMethod, label: form.paymentLabel || undefined };
      if (form.paymentMethod === "bank_transfer") {
        Object.assign(payload, { bankName: form.bankName, accountNumber: form.accountNumber, accountName: form.accountName });
      } else if (form.paymentMethod === "credit_card" && form.cardNumber.length >= 4) {
        Object.assign(payload, { cardLast4: form.cardNumber.replace(/\s/g, "").slice(-4), cardExpiry: form.cardExpiry, cardBrand: form.cardBrand });
      }
      await fetch("/api/payment-methods", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      toast.success("บันทึกวิธีชำระเงินแล้ว");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: { name: form.name, phone: form.phone, address: form.address, subDistrict: form.subDistrict, district: form.district, province: form.province, postalCode: form.postalCode },
          paymentMethod: form.paymentMethod,
          notes: form.notes,
        }),
      });
      if (res.ok) {
        const order = await res.json();
        await clearCart();
        toast.success("สั่งซื้อสำเร็จ!");
        router.push(`/orders/${order.id}`);
      } else {
        const data = await res.json();
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

  if (status === "loading") return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">ชำระเงิน</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Shipping */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="font-bold text-slate-800 mb-4">ที่อยู่จัดส่ง</h2>

              {/* Saved addresses */}
              {savedAddresses.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 rounded-xl">
                  <p className="text-xs font-semibold text-blue-700 mb-2">ที่อยู่ที่บันทึกไว้</p>
                  <div className="space-y-2">
                    {savedAddresses.map((a) => (
                      <label key={a.id} className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${useSavedAddress === a.id ? "border-blue-600 bg-white" : "border-blue-200 bg-white/60 hover:border-blue-400"}`}>
                        <input type="radio" checked={useSavedAddress === a.id} onChange={() => handleUseSavedAddress(a)} className="text-blue-600 mt-0.5" />
                        <div className="text-sm min-w-0">
                          <p className="font-medium text-slate-700">{a.label || a.name}</p>
                          <p className="text-gray-400 text-xs">{a.name} · {a.phone}</p>
                          <p className="text-gray-400 text-xs truncate">{a.address} ต.{a.subDistrict} อ.{a.district} จ.{a.province} {a.postalCode}</p>
                        </div>
                        {a.isDefault && <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full whitespace-nowrap">ค่าเริ่มต้น</span>}
                      </label>
                    ))}
                    <button type="button" onClick={() => { setUseSavedAddress(""); setForm(f => ({ ...f, name: session?.user.name ?? "", phone: "", address: "", subDistrict: "", district: "", province: "", postalCode: "" })); }} className="text-xs text-blue-600 hover:underline pl-1">+ กรอกที่อยู่ใหม่</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้รับ <span className="text-red-400">*</span></label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์ <span className="text-red-400">*</span></label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} required maxLength={10} inputMode="numeric" className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">บ้านเลขที่ / ถนน / ซอย <span className="text-red-400">*</span></label>
                  <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required maxLength={100} className={inputClass} />
                </div>
              </div>
              <ThaiAddressSelect
                value={{ province: form.province, district: form.district, subDistrict: form.subDistrict, zipCode: form.postalCode }}
                onChange={(addr) => setForm((f) => ({ ...f, province: addr.province, district: addr.district, subDistrict: addr.subDistrict, postalCode: addr.zipCode }))}
              />
            </div>

            {/* Payment */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="font-bold text-slate-800 mb-4">วิธีชำระเงิน</h2>

              {/* Saved methods */}
              {savedMethods.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 rounded-xl">
                  <p className="text-xs font-semibold text-blue-700 mb-2">วิธีชำระที่บันทึกไว้</p>
                  <div className="space-y-2">
                    {savedMethods.map((m) => (
                      <label key={m.id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${useSaved === m.id ? "border-blue-600 bg-white" : "border-blue-200 bg-white/60 hover:border-blue-400"}`}>
                        <input type="radio" checked={useSaved === m.id} onChange={() => handleUseSaved(m)} className="text-blue-600" />
                        {m.type === "bank_transfer" && m.bankName && <BankIcon bankId={m.bankName} size={28} />}
                        {m.type === "credit_card" && (m.cardBrand === "visa" ? <VisaIcon size={24} /> : <MastercardIcon size={24} />)}
                        <div className="text-sm">
                          <p className="font-medium text-slate-700">{m.label || (m.type === "bank_transfer" ? "โอนธนาคาร" : "บัตรเครดิต")}</p>
                          <p className="text-gray-400 text-xs">{m.type === "bank_transfer" ? `${BANKS.find(b=>b.id===m.bankName)?.name} ···${m.accountNumber?.slice(-4)}` : `···· ${m.cardLast4}  ${m.cardExpiry}`}</p>
                        </div>
                        {m.isDefault && <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">ค่าเริ่มต้น</span>}
                      </label>
                    ))}
                    <button type="button" onClick={() => { setUseSaved(""); setForm(f => ({ ...f, paymentMethod: "cod", bankName: "", accountNumber: "", accountName: "", cardNumber: "", cardExpiry: "", cardCvv: "" })); }} className="text-xs text-blue-600 hover:underline pl-1">+ ใช้วิธีชำระใหม่</button>
                  </div>
                </div>
              )}

              {/* Payment method selector */}
              {!useSaved && (
                <div className="space-y-3">
                  {/* COD */}
                  <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${form.paymentMethod === "cod" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}>
                    <input type="radio" value="cod" checked={form.paymentMethod === "cod"} onChange={() => setForm({ ...form, paymentMethod: "cod" })} />
                    <CodIcon size={28} />
                    <span className="text-sm font-medium">เก็บเงินปลายทาง (COD)</span>
                  </label>

                  {/* Bank Transfer */}
                  <div className={`border rounded-xl transition-colors ${form.paymentMethod === "bank_transfer" ? "border-blue-600" : "border-gray-200"}`}>
                    <label className={`flex items-center gap-3 p-4 cursor-pointer ${form.paymentMethod === "bank_transfer" ? "bg-blue-50 rounded-t-xl" : "hover:bg-gray-50 rounded-xl"}`}>
                      <input type="radio" value="bank_transfer" checked={form.paymentMethod === "bank_transfer"} onChange={() => setForm({ ...form, paymentMethod: "bank_transfer" })} />
                      <div className="flex gap-1.5">
                        {["kbank", "scb", "bbl", "ktb"].map((b) => <BankIcon key={b} bankId={b} size={24} />)}
                      </div>
                      <span className="text-sm font-medium">โอนเงินผ่านธนาคาร</span>
                    </label>
                    {form.paymentMethod === "bank_transfer" && (
                      <div className="px-4 pb-4 space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">ธนาคาร</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {BANKS.map((b) => (
                              <button key={b.id} type="button" onClick={() => setForm({ ...form, bankName: b.id })}
                                className={`flex items-center gap-2 px-2 py-1.5 border rounded-lg text-xs transition-colors ${form.bankName === b.id ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}>
                                <BankIcon bankId={b.id} size={20} />
                                <span className="truncate">{b.text}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">เลขบัญชี</label>
                            <input type="text" value={form.accountNumber} maxLength={14}
                            onChange={(e) => {
                              const d = e.target.value.replace(/\D/g, "").slice(0, 10);
                              let v = d;
                              if (d.length > 3) v = d.slice(0,3) + "-" + d.slice(3);
                              if (d.length > 4) v = d.slice(0,3) + "-" + d.slice(3,4) + "-" + d.slice(4);
                              if (d.length > 9) v = d.slice(0,3) + "-" + d.slice(3,4) + "-" + d.slice(4,9) + "-" + d.slice(9);
                              setForm({ ...form, accountNumber: v });
                            }}
                            placeholder="XXX-X-XXXXX-X" className={inputClass} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">ชื่อบัญชี</label>
                            <input type="text" value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} placeholder="ชื่อ-นามสกุล" className={inputClass} />
                          </div>
                        </div>
                        <SaveToggle form={form} setForm={setForm} />
                      </div>
                    )}
                  </div>

                  {/* Credit Card */}
                  <div className={`border rounded-xl transition-colors ${form.paymentMethod === "credit_card" ? "border-blue-600" : "border-gray-200"}`}>
                    <label className={`flex items-center gap-3 p-4 cursor-pointer ${form.paymentMethod === "credit_card" ? "bg-blue-50 rounded-t-xl" : "hover:bg-gray-50 rounded-xl"}`}>
                      <input type="radio" value="credit_card" checked={form.paymentMethod === "credit_card"} onChange={() => setForm({ ...form, paymentMethod: "credit_card" })} />
                      <div className="flex gap-2 items-center">
                        <VisaIcon size={24} />
                        <MastercardIcon size={24} />
                      </div>
                      <span className="text-sm font-medium">บัตรเครดิต / เดบิต</span>
                    </label>
                    {form.paymentMethod === "credit_card" && (
                      <div className="px-4 pb-4 space-y-3">
                        {/* Card brand */}
                        <div className="flex gap-3">
                          {["visa", "mastercard"].map((brand) => (
                            <button key={brand} type="button" onClick={() => setForm({ ...form, cardBrand: brand })}
                              className={`flex items-center gap-2 px-3 py-2 border rounded-xl transition-colors ${form.cardBrand === brand ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}>
                              {brand === "visa" ? <VisaIcon size={20} /> : <MastercardIcon size={20} />}
                              <span className="text-xs font-medium capitalize">{brand}</span>
                            </button>
                          ))}
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
                                setForm({ ...form, cardExpiry: v.length > 2 ? v.slice(0,2) + "/" + v.slice(2) : v });
                              }}
                              placeholder="MM/YY" className={inputClass} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">CVV</label>
                            <input type="password" value={form.cardCvv} maxLength={4}
                              onChange={(e) => setForm({ ...form, cardCvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                              placeholder="•••" className={inputClass} />
                          </div>
                        </div>
                        <SaveToggle form={form} setForm={setForm} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="font-bold text-slate-800 mb-4">หมายเหตุ (ถ้ามี)</h2>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className={`${inputClass} resize-none`} rows={3} placeholder="ต้องการแจ้งอะไรเพิ่มเติมไหม?" />
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-blue-50 rounded-2xl p-6 sticky top-24">
              <h2 className="font-bold text-slate-800 mb-4">สรุปคำสั่งซื้อ</h2>
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate flex-1 mr-2">{item.product.name} x{item.quantity}</span>
                    <span className="font-medium">฿{(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <hr className="my-3" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">ค่าสินค้า</span><span>฿{total.toLocaleString()}</span></div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ค่าจัดส่ง</span>
                  <span className={shippingCost === 0 ? "text-green-600" : ""}>{shippingCost === 0 ? "ฟรี!" : `฿${shippingCost}`}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>รวม</span>
                  <span className="text-blue-700">฿{(total + shippingCost).toLocaleString()}</span>
                </div>
              </div>
              <button type="submit" disabled={loading || items.length === 0}
                className="w-full py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-colors mt-4">
                {loading ? "กำลังสั่งซื้อ..." : "ยืนยันคำสั่งซื้อ"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function SaveToggle({ form, setForm }: { form: any; setForm: any }) {
  return (
    <div className="border-t border-gray-100 pt-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.savePayment} onChange={(e) => setForm((f: any) => ({ ...f, savePayment: e.target.checked }))}
          className="rounded text-blue-600" />
        <span className="text-xs text-slate-600">บันทึกวิธีชำระนี้ไว้ใช้ครั้งหน้า</span>
      </label>
      {form.savePayment && (
        <input type="text" value={form.paymentLabel} onChange={(e) => setForm((f: any) => ({ ...f, paymentLabel: e.target.value }))}
          placeholder="ชื่อที่จำได้ง่าย เช่น บัญชีหลัก" className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
      )}
    </div>
  );
}
