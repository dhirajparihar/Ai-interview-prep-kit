import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { KitService } from "@/lib/services/kitService";

const kitService = new KitService();

export async function POST(
  req: Request,
  { params }: { params: { id: string; category: string } }
) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const validCategories = ["technical", "behavioural", "system-design", "company-fit"];
  if (!validCategories.includes(params.category)) {
    return NextResponse.json(
      { error: `Invalid category: ${params.category}` },
      { status: 400 }
    );
  }

  try {
    const updated = await kitService.regenerateCategory(
      user.userId,
      params.id,
      params.category as "technical" | "behavioural" | "system-design" | "company-fit"
    );

    if (!updated) {
      return NextResponse.json({ error: "Kit not found" }, { status: 404 });
    }

    return NextResponse.json({ kit: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Regeneration failed." },
      { status: 500 }
    );
  }
}
