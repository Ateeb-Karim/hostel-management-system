import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "WARDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!OBJECT_ID.test(id)) {
      return NextResponse.json(
        { error: "Invalid student id" },
        { status: 400 },
      );
    }

    const { password } = await req.json();

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }
    // bcrypt ignores everything after 72 bytes
    if (Buffer.byteLength(password, "utf8") > 72) {
      return NextResponse.json(
        { error: "Password is too long (max 72 characters)" },
        { status: 400 },
      );
    }

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: student.userId },
      data: { password: hashed },
    });

    return NextResponse.json({ message: "Password updated" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 },
    );
  }
}
