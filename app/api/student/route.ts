import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "WARDEN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, loginId, password, roomNo, phone, monthlyRent, joinDate } =
    body;

  if (!name || !loginId || !password || !roomNo || !monthlyRent || !joinDate) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { loginId } });

  if (existing) {
    return NextResponse.json(
      { message: "This login ID is already taken, please adjust it" },
      { status: 409 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      loginId,
      password: hashedPassword,
      role: "STUDENT",
      student: {
        create: {
          name,
          roomNo,
          phone: phone || undefined,
          monthlyRent,
          joinDate: new Date(joinDate),
        },
      },
    },
    include: { student: true },
  });

  return NextResponse.json(user, { status: 201 });
}
