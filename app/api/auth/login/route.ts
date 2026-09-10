import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/User";
import { comparePassword, setSessionCookie } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const sessionPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    await setSessionCookie(sessionPayload);

    return NextResponse.json({ user: sessionPayload }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Login failed." },
      { status: 500 }
    );
  }
}
