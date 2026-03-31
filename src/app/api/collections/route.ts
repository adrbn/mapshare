import { NextRequest, NextResponse } from "next/server";
import { getCollections, saveCollection } from "@/lib/storage";

export async function GET(): Promise<NextResponse> {
  const collections = await getCollections();
  return NextResponse.json({ success: true, data: collections });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const password = request.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const collection = await saveCollection(body);
  return NextResponse.json({ success: true, data: collection }, { status: 201 });
}
