"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { EnvelopeIcon, PhoneIcon, ClockIcon, CheckCircleIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

const INFO = [
  { Icon: EnvelopeIcon, label: "อีเมล", value: "support@cartin.com" },
  { Icon: PhoneIcon,   label: "โทรศัพท์", value: "02-XXX-XXXX" },
  { Icon: ClockIcon,   label: "เวลาทำการ", value: "จ.–ศ. 9:00–18:00 น." },
];

export default function ContactPage() {
  const { data: session } = useSession();
  const [form, setForm] = useState({ name: session?.user?.name ?? "", email: session?.user?.email ?? "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
        toast.success("ส่งข้อความเรียบร้อยแล้ว!");
        setForm({ name: session?.user?.name ?? "", email: session?.user?.email ?? "", message: "" });
      } else {
        const data = await res.json();
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      toast.error("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-xs text-[#003399] font-semibold tracking-[0.2em] uppercase mb-1">Contact</p>
        <h1 className="text-3xl font-bold text-[#111111] mb-2">ติดต่อเรา</h1>
        <p className="text-[#767676] text-sm">มีคำถามหรือต้องการความช่วยเหลือ? ทีมงานเราพร้อมให้บริการ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Info column */}
        <div className="lg:col-span-2 space-y-4">
          {INFO.map(({ Icon, label, value }) => (
            <div key={label} className="bg-white border border-[#DFDFDF] rounded p-5 flex items-start gap-4 shadow-[0_1px_3px_rgba(17,17,17,0.06)]">
              <div className="w-10 h-10 bg-[#F5F5F5] rounded flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-[#003399]" />
              </div>
              <div>
                <p className="text-xs text-[#767676] font-semibold mb-0.5">{label}</p>
                <p className="font-semibold text-[#111111] text-sm">{value}</p>
              </div>
            </div>
          ))}

          <div className="bg-[#003399] rounded p-5 text-white">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-[#FFDA1A] mb-3" />
            <p className="font-semibold mb-1 text-sm">ตอบภายใน 1-2 วันทำการ</p>
            <p className="text-white/70 text-xs leading-relaxed">
              ทีมงานของเราจะติดต่อกลับทางอีเมลที่คุณกรอกมาโดยเร็วที่สุด
            </p>
          </div>
        </div>

        {/* Form column */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-[#DFDFDF] rounded p-7 shadow-[0_1px_3px_rgba(17,17,17,0.06)]">
            <p className="text-xs font-semibold text-[#767676] uppercase tracking-wider mb-6">ส่งข้อความหาเรา</p>

            {sent && (
              <div className="mb-6 bg-[#F5F5F5] border border-[#0A8A00]/30 text-[#0A8A00] rounded px-4 py-3 text-sm flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                ส่งข้อความเรียบร้อยแล้ว ทีมงานจะติดต่อกลับภายใน 1-2 วันทำการ
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#484848] mb-1.5">ชื่อ <span className="text-[#CC0008]">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[#DFDFDF] rounded focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm bg-[#F5F5F5] focus:bg-white transition-colors"
                    placeholder="ชื่อของคุณ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#484848] mb-1.5">อีเมล <span className="text-[#CC0008]">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[#DFDFDF] rounded focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm bg-[#F5F5F5] focus:bg-white transition-colors"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#484848] mb-1.5">ข้อความ <span className="text-[#CC0008]">*</span></label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 border border-[#DFDFDF] rounded focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm resize-none bg-[#F5F5F5] focus:bg-white transition-colors"
                  placeholder="พิมพ์ข้อความที่ต้องการส่ง..."
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3.5 bg-[#003399] text-white font-bold rounded hover:bg-[#002B80] disabled:opacity-60 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {sending ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> กำลังส่ง...</>
                ) : "ส่งข้อความ"}
              </button>
              {session && (
                <p className="text-xs text-[#767676] text-center">
                  ส่งในนาม {session.user.name} ({session.user.email})
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
