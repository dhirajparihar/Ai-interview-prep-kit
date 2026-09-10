import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { WeakSpotsService } from "@/lib/services/weakSpotsService";

const weakSpotsService = new WeakSpotsService();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const report = await weakSpotsService.generateWeakSpotsReport(user.userId, params.id);
    if (!report) {
      return NextResponse.json({ error: "Kit not found" }, { status: 404 });
    }
    return NextResponse.json({ report });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate weak spots report" },
      { status: 500 }
    );
  }
}
