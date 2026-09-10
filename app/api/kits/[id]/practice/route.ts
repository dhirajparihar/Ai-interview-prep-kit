import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { PracticeService } from "@/lib/services/practiceService";

const practiceService = new PracticeService();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deck = await practiceService.getPracticeDeck(user.userId, params.id);
    return NextResponse.json({ deck });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch practice deck" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { cardId, confidence } = await req.json();

    if (!cardId || !confidence || ![1, 2, 3].includes(Number(confidence))) {
      return NextResponse.json(
        { error: "cardId and valid confidence rating (1-3) are required." },
        { status: 400 }
      );
    }

    await practiceService.recordConfidence(
      user.userId,
      params.id,
      cardId,
      Number(confidence)
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record confidence" },
      { status: 500 }
    );
  }
}
