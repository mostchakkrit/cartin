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
  PENDING: "bg-yellow-100 text-yellow-700", CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700", SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700", CANCELLED: "bg-red-100 text-red-700",
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

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">จัดการคำสั่งซื้อ</h1>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-slate-600 font-medium">
            <tr>
              <th className="text-left px-4 py-3">คำสั่งซื้อ</th>
              <th className="text-left px-4 py-3">ลูกค้า</th>
              <th className="text-left px-4 py-3">วันที่</th>
              <th className="text-left px-4 py-3">ยอดรวม</th>
              <th className="text-left px-4 py-3">สถานะ</th>
              <th className="text-left px-4 py-3">อัปเดต</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/orders/${order.id}`} className="font-medium text-blue-600 hover:text-blue-800">
                    #{order.id.slice(-8).toUpperCase()}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{order.user?.name}</p>
                  <p className="text-gray-400 text-xs">{order.user?.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString("th-TH")}</td>
                <td className="px-4 py-3 font-bold text-blue-700">฿{order.total.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || "bg-gray-100"}`}>
                    {STATUS_OPTIONS.find((s) => s.value === order.status)?.label || order.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="text-center py-12 text-gray-400">ยังไม่มีคำสั่งซื้อ</div>}
      </div>
    </div>
  );
}
