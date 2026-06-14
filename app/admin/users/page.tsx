"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      if (session?.user.role !== "ADMIN") { router.push("/"); return; }
      fetch("/api/admin/users")
        .then((r) => r.json())
        .then((d) => { setUsers(d.users || []); setLoading(false); });
    }
  }, [status, session]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">จัดการผู้ใช้</h1>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-slate-600 font-medium">
            <tr>
              <th className="text-left px-4 py-3">ผู้ใช้</th>
              <th className="text-left px-4 py-3">อีเมล</th>
              <th className="text-left px-4 py-3">บทบาท</th>
              <th className="text-left px-4 py-3">คำสั่งซื้อ</th>
              <th className="text-left px-4 py-3">วันที่สมัคร</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                      {user.name[0]}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.role === "ADMIN" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                    {user.role === "ADMIN" ? "Admin" : "User"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center font-medium">{user._count?.orders || 0}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(user.createdAt).toLocaleDateString("th-TH")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div className="text-center py-12 text-gray-400">ยังไม่มีผู้ใช้</div>}
      </div>
    </div>
  );
}
