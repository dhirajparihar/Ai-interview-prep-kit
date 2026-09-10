import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { KitService } from "@/lib/services/kitService";

const kitService = new KitService();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const kit = await kitService.getKitById(user.userId, params.id);
    if (!kit) {
      return NextResponse.json(
        { error: "Kit not found or access denied." },
        { status: 404 }
      );
    }
    return NextResponse.json({ kit });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch kit" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = await kitService.updateKit(user.userId, params.id, body.kit);
    if (!updated) {
      return NextResponse.json(
        { error: "Kit not found or access denied." },
        { status: 404 }
      );
    }
    return NextResponse.json({ kit: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update kit" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const success = await kitService.deleteKit(user.userId, params.id);
    if (!success) {
      return NextResponse.json(
        { error: "Kit not found or access denied." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete kit" },
      { status: 500 }
    );
  }
}
