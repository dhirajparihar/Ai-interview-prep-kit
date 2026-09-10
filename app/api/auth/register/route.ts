import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/User";
import { hashPassword, setSessionCookie } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = new UserModel({
      email: email.toLowerCase(),
      name,
      passwordHash,
    });
    await user.save();

    const sessionPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    await setSessionCookie(sessionPayload);

    return NextResponse.json({ user: sessionPayload }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Registration failed." },
      { status: 500 }
    );
  }
}
