"use client";

import { useState, useEffect } from "react";

interface Item { id: string; name: string }

interface AddressValue {
  province: string;
  district: string;
  subDistrict: string;
  zipCode: string;
}

interface Props {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
}

export function ThaiAddressSelect({ value, onChange }: Props) {
  const [provinces, setProvinces] = useState<Item[]>([]);
  const [districts, setDistricts] = useState<Item[]>([]);
  const [subDistricts, setSubDistricts] = useState<Item[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedSubDistrictId, setSelectedSubDistrictId] = useState("");

  // โหลดจังหวัดครั้งแรก
  useEffect(() => {
    fetch("/api/thai-address?type=provinces")
      .then((r) => r.json())
      .then(setProvinces);
  }, []);

  // โหลดอำเภอเมื่อเลือกจังหวัด
  useEffect(() => {
    if (!selectedProvinceId) { setDistricts([]); setSubDistricts([]); return; }
    fetch(`/api/thai-address?type=districts&provinceId=${selectedProvinceId}`)
      .then((r) => r.json())
      .then(setDistricts);
    setSubDistricts([]);
  }, [selectedProvinceId]);

  // โหลดตำบลเมื่อเลือกอำเภอ
  useEffect(() => {
    if (!selectedDistrictId) { setSubDistricts([]); return; }
    fetch(`/api/thai-address?type=subdistricts&districtId=${selectedDistrictId}`)
      .then((r) => r.json())
      .then(setSubDistricts);
  }, [selectedDistrictId]);

  const selectClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-50 disabled:text-gray-400";

  const handleProvince = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const name = provinces.find((p) => p.id === id)?.name ?? "";
    setSelectedProvinceId(id);
    setSelectedDistrictId("");
    setSelectedSubDistrictId("");
    onChange({ province: name, district: "", subDistrict: "", zipCode: "" });
  };

  const handleDistrict = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const name = districts.find((d) => d.id === id)?.name ?? "";
    setSelectedDistrictId(id);
    setSelectedSubDistrictId("");
    onChange({ ...value, district: name, subDistrict: "", zipCode: "" });
  };

  const handleSubDistrict = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const name = subDistricts.find((s) => s.id === id)?.name ?? "";
    setSelectedSubDistrictId(id);
    const res = await fetch(`/api/thai-address?type=zip&subDistrictId=${id}`);
    const { zipCode } = await res.json();
    onChange({ ...value, subDistrict: name, zipCode: zipCode ?? "" });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* จังหวัด */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          จังหวัด <span className="text-red-400">*</span>
        </label>
        <select value={selectedProvinceId} onChange={handleProvince} className={selectClass}>
          <option value="">-- เลือกจังหวัด --</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* อำเภอ */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          อำเภอ / เขต <span className="text-red-400">*</span>
        </label>
        <select value={selectedDistrictId} onChange={handleDistrict} disabled={!selectedProvinceId} className={selectClass}>
          <option value="">-- เลือกอำเภอ --</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* ตำบล */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          ตำบล / แขวง <span className="text-red-400">*</span>
        </label>
        <select value={selectedSubDistrictId} onChange={handleSubDistrict} disabled={!selectedDistrictId} className={selectClass}>
          <option value="">-- เลือกตำบล --</option>
          {subDistricts.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* รหัสไปรษณีย์ — autofill */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">รหัสไปรษณีย์</label>
        <input
          type="text"
          value={value.zipCode}
          readOnly
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500"
          placeholder="กรอกอัตโนมัติ"
        />
      </div>
    </div>
  );
}
