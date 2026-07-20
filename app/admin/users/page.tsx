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

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-[#003399] border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs text-[#003399] font-semibold tracking-[0.2em] uppercase mb-1">Admin</p>
        <h1 className="text-3xl font-bold text-[#111111]">จัดการผู้ใช้</h1>
      </div>

      <div className="bg-white border border-[#DFDFDF] rounded overflow-hidden shadow-[0_1px_3px_rgba(17,17,17,0.06)]">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F5F5] text-[#484848] font-semibold">
            <tr>
              <th className="text-left px-4 py-3">ผู้ใช้</th>
              <th className="text-left px-4 py-3">อีเมล</th>
              <th className="text-left px-4 py-3">บทบาท</th>
              <th className="text-left px-4 py-3">คำสั่งซื้อ</th>
              <th className="text-left px-4 py-3">วันที่สมัคร</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFDFDF]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-[#F5F5F5]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#003399]/10 rounded flex items-center justify-center text-[#003399] font-bold text-sm">
                      {user.name[0]}
                    </div>
                    <span className="font-semibold text-[#111111]">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#767676]">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${user.role === "ADMIN" ? "bg-[#003399]/10 text-[#003399]" : "bg-[#F5F5F5] text-[#767676] border border-[#DFDFDF]"}`}>
                    {user.role === "ADMIN" ? "Admin" : "User"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center font-semibold text-[#111111]">{user._count?.orders || 0}</td>
                <td className="px-4 py-3 text-[#767676]">{new Date(user.createdAt).toLocaleDateString("th-TH")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div className="text-center py-12 text-[#767676]">ยังไม่มีผู้ใช้</div>}
      </div>
    </div>
  );
}
