"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "รอดำเนินการ" },
  { value: "CONFIRMED", label: "ยืนยันแล้ว" },
  { value: "PROCESSING", label: "กำลังเตรียม" },
  { value: "SHIPPED", label: "จัดส่งแล้ว" },
  { value: "DELIVERED", label: "ส่งสำเร็จ" },
  { value: "CANCELLED", label: "ยกเลิก" },
];
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-[#E87400]/10 text-[#E87400]", CONFIRMED: "bg-[#003399]/10 text-[#003399]",
  PROCESSING: "bg-purple-50 text-purple-700", SHIPPED: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-[#0A8A00]/10 text-[#0A8A00]", CANCELLED: "bg-[#CC0008]/10 text-[#CC0008]",
};

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      if (session?.user.role !== "ADMIN") { router.push("/"); return; }
      fetch("/api/orders?limit=100").then((r) => r.json()).then((d) => { setOrders(d.orders || []); setLoading(false); });
    }
  }, [status, session]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast.success("อัปเดตสถานะแล้ว");
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    } else toast.error("เกิดข้อผิดพลาด");
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-[#003399] border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs text-[#003399] font-semibold tracking-[0.2em] uppercase mb-1">Admin</p>
        <h1 className="text-3xl font-bold text-[#111111]">จัดการคำสั่งซื้อ</h1>
      </div>

      <div className="bg-white border border-[#DFDFDF] rounded overflow-hidden shadow-[0_1px_3px_rgba(17,17,17,0.06)]">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F5F5] text-[#484848] font-semibold">
            <tr>
              <th className="text-left px-4 py-3">คำสั่งซื้อ</th>
              <th className="text-left px-4 py-3">ลูกค้า</th>
              <th className="text-left px-4 py-3">วันที่</th>
              <th className="text-left px-4 py-3">ยอดรวม</th>
              <th className="text-left px-4 py-3">สถานะ</th>
              <th className="text-left px-4 py-3">อัปเดต</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFDFDF]">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-[#F5F5F5]">
                <td className="px-4 py-3">
                  <Link href={`/orders/${order.id}`} className="font-semibold text-[#003399] hover:text-[#002B80]">
                    #{order.id.slice(-8).toUpperCase()}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-[#111111]">{order.user?.name}</p>
                  <p className="text-[#767676] text-xs">{order.user?.email}</p>
                </td>
                <td className="px-4 py-3 text-[#767676]">{new Date(order.createdAt).toLocaleDateString("th-TH")}</td>
                <td className="px-4 py-3 font-bold text-[#003399]">฿{order.total.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLORS[order.status] || "bg-[#F5F5F5] text-[#484848]"}`}>
                    {STATUS_OPTIONS.find((s) => s.value === order.status)?.label || order.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="px-2 py-1 border border-[#DFDFDF] rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#003399] bg-white"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="text-center py-12 text-[#767676]">ยังไม่มีคำสั่งซื้อ</div>}
      </div>
    </div>
  );
}
