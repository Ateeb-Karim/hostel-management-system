import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "WARDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (typeof currentPassword !== "string" || !currentPassword) {
      return NextResponse.json(
        { error: "Current password is required" },
        { status: 400 },
      );
    }
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 },
      );
    }
    if (Buffer.byteLength(newPassword, "utf8") > 72) {
      return NextResponse.json(
        { error: "New password is too long (max 72 characters)" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user || user.role !== "WARDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different from the current one" },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    return NextResponse.json({ message: "Password changed" });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 },
    );
  }
}
