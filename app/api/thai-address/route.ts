import { NextRequest, NextResponse } from "next/server";
import data from "@/lib/thai-address-data.json";

const { provinces, districts, subDistricts, zipMap } = data as {
  provinces: { id: string; name: string }[];
  districts: { id: string; name: string; provinceId: string }[];
  subDistricts: { id: string; name: string; districtId: string; provinceId: string }[];
  zipMap: Record<string, string>;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const provinceId = searchParams.get("provinceId");
  const districtId = searchParams.get("districtId");
  const subDistrictId = searchParams.get("subDistrictId");

  if (type === "provinces") {
    return NextResponse.json(provinces);
  }
  if (type === "districts" && provinceId) {
    return NextResponse.json(districts.filter((d) => d.provinceId === provinceId));
  }
  if (type === "subdistricts" && districtId) {
    return NextResponse.json(subDistricts.filter((s) => s.districtId === districtId));
  }
  if (type === "zip" && subDistrictId) {
    return NextResponse.json({ zipCode: zipMap[subDistrictId] ?? "" });
  }

  return NextResponse.json({ error: "Invalid query" }, { status: 400 });
}
