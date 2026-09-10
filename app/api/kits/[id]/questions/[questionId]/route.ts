import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { KitService } from "@/lib/services/kitService";

const kitService = new KitService();

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; questionId: string } }
) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const updatedKit = await kitService.updateQuestion(
      user.userId,
      params.id,
      params.questionId,
      data
    );

    if (!updatedKit) {
      return NextResponse.json(
        { error: "Kit or question not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ kit: updatedKit });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed." },
      { status: 500 }
    );
  }
}
