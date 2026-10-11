import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "WARDEN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, roomNo, phone, monthlyRent, joinDate, loginId, password } =
    body;

  if (!name || !roomNo || !monthlyRent || !joinDate || !loginId || !password) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { loginId } });
  if (existing) {
    return NextResponse.json(
      { error: "Login ID already exists" },
      { status: 409 },
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      loginId,
      name,
      password: hashed,
      role: "STUDENT",
      student: {
        create: {
          name,
          roomNo,
          phone: phone || null,
          monthlyRent: Number(monthlyRent),
          joinDate: new Date(joinDate),
        },
      },
    },
    include: { student: true },
  });

  return NextResponse.json(user.student, { status: 201 });
}
