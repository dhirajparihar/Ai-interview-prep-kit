import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { KitService } from "@/lib/services/kitService";

const kitService = new KitService();

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const kits = await kitService.getKitsForUser(user.userId);
    return NextResponse.json({ kits });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch kits" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { jd, companyUrl, days } = await req.json();

    if (!jd || !companyUrl || !days) {
      return NextResponse.json(
        { error: "Job description (jd), companyUrl, and days are required." },
        { status: 400 }
      );
    }

    const kitDoc = await kitService.createOrGetExistingKit({
      userId: user.userId,
      jd,
      companyUrl,
      days: Number(days),
    });

    return NextResponse.json({ kit: kitDoc }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create kit" },
      { status: 500 }
    );
  }
}
