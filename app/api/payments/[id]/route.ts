import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;
const ONE_DAY = 24 * 60 * 60 * 1000;

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
        { error: "Invalid payment id" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const amount = Number(body.amount);
    const month = Number(body.month);
    const year = Number(body.year);
    const datePaid = new Date(body.datePaid);

    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a whole number above 0" },
        { status: 400 },
      );
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: "Invalid month" }, { status: 400 });
    }
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }
    if (Number.isNaN(datePaid.getTime())) {
      return NextResponse.json(
        { error: "Invalid payment date" },
        { status: 400 },
      );
    }
    if (datePaid.getTime() > Date.now() + ONE_DAY) {
      return NextResponse.json(
        { error: "Payment date can't be in the future" },
        { status: 400 },
      );
    }

    const existing = await prisma.payment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: { amount, month, year, datePaid },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update payment error:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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
        { error: "Invalid payment id" },
        { status: 400 },
      );
    }

    const existing = await prisma.payment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    await prisma.payment.delete({ where: { id } });

    return NextResponse.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Delete payment error:", error);
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 },
    );
  }
}
