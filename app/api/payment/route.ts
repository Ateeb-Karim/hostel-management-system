import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "WARDEN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { studentId, amount, month, year } = body;

  if (!studentId || !amount || !month || !year) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  if (amount <= 0) {
    return NextResponse.json(
      { message: "Amount must be positive" },
      { status: 400 },
    );
  }

  if (month < 1 || month > 12) {
    return NextResponse.json({ message: "Invalid month" }, { status: 400 });
  }

  const student = await prisma.student.findUnique({ where: { id: studentId } });

  if (!student) {
    return NextResponse.json({ message: "Student not found" }, { status: 404 });
  }

  const payment = await prisma.payment.create({
    data: {
      studentId,
      amount,
      month,
      year,
    },
  });

  return NextResponse.json(payment, { status: 201 });
}
