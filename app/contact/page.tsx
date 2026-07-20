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
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs text-blue-600 font-semibold tracking-[0.2em] uppercase mb-1">Contact</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-[#dde8ff] mb-2">ติดต่อเรา</h1>
        <p className="text-gray-400 dark:text-[#4e6888] text-sm">มีคำถามหรือต้องการความช่วยเหลือ? ทีมงานเราพร้อมให้บริการ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Info column */}
        <div className="lg:col-span-2 space-y-4">
          {INFO.map(({ Icon, label, value }) => (
            <div key={label} className="bg-white dark:bg-[#131c30] border border-gray-100 dark:border-[#253350] rounded-2xl p-5 flex items-start gap-4 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 dark:bg-[#0f1d38] rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-[#4e6888] font-medium mb-0.5">{label}</p>
                <p className="font-semibold text-slate-800 dark:text-[#dde8ff] text-sm">{value}</p>
              </div>
            </div>
          ))}

          {/* FAQ hint */}
          <div className="bg-blue-700 rounded-2xl p-5 text-white">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-300 mb-3" />
            <p className="font-semibold mb-1 text-sm">ตอบภายใน 1-2 วันทำการ</p>
            <p className="text-blue-200 text-xs leading-relaxed">
              ทีมงานของเราจะติดต่อกลับทางอีเมลที่คุณกรอกมาโดยเร็วที่สุด
            </p>
          </div>
        </div>

        {/* Form column */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-[#131c30] border border-gray-100 dark:border-[#253350] rounded-2xl p-7 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 dark:text-[#4e6888] uppercase tracking-wider mb-6">ส่งข้อความหาเรา</p>

            {sent && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                ส่งข้อความเรียบร้อยแล้ว ทีมงานจะติดต่อกลับภายใน 1-2 วันทำการ
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-[#b8cef0] mb-1.5">ชื่อ <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-[#304070] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 dark:bg-[#111827] focus:bg-white dark:bg-[#131c30] transition-colors"
                    placeholder="ชื่อของคุณ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-[#b8cef0] mb-1.5">อีเมล <span className="text-red-400">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-[#304070] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 dark:bg-[#111827] focus:bg-white dark:bg-[#131c30] transition-colors"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-[#b8cef0] mb-1.5">ข้อความ <span className="text-red-400">*</span></label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-[#304070] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none bg-gray-50 dark:bg-[#111827] focus:bg-white dark:bg-[#131c30] transition-colors"
                  placeholder="พิมพ์ข้อความที่ต้องการส่ง..."
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 disabled:opacity-60 transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-md shadow-blue-200 dark:shadow-blue-900/40"
              >
                {sending ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> กำลังส่ง...</>
                ) : "ส่งข้อความ"}
              </button>
              {session && (
                <p className="text-xs text-gray-400 dark:text-[#4e6888] text-center">
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
