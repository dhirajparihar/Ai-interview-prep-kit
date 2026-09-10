import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}
