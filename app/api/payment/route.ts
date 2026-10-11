import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "WARDEN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studentId, amount, month, year, datePaid } = await req.json();

  if (!studentId || !amount || !month || !year || !datePaid) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const payment = await prisma.payment.create({
    data: {
      studentId,
      name: student.name,
      amount: Number(amount),
      month: Number(month),
      year: Number(year),
      datePaid: new Date(datePaid),
    },
  });

  return NextResponse.json(payment, { status: 201 });
}
