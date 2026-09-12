import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { KitService } from "@/lib/services/kitService";

const kitService = new KitService();

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { questionIds } = await req.json();
    if (!Array.isArray(questionIds)) {
      return NextResponse.json(
        { error: "questionIds must be an array of string question IDs" },
        { status: 400 }
      );
    }

    const updatedKit = await kitService.reorderQuestions(
      user.userId,
      params.id,
      questionIds
    );

    if (!updatedKit) {
      return NextResponse.json({ error: "Kit not found" }, { status: 404 });
    }

    return NextResponse.json({ kit: updatedKit });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Reorder failed." },
      { status: 500 }
    );
  }
}
