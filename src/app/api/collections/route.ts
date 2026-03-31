import { NextRequest, NextResponse } from "next/server";
import { getCollections, saveCollection } from "@/lib/storage";

export async function GET(): Promise<NextResponse> {
  try {
    const collections = await getCollections();
    return NextResponse.json({ success: true, data: collections });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const password = request.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const collection = await saveCollection(body);
    return NextResponse.json({ success: true, data: collection }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
