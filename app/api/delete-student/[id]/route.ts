import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const roomNo = String(body.roomNo ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const monthlyRent = Number(body.monthlyRent);

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!roomNo) {
      return NextResponse.json(
        { error: "Room number is required" },
        { status: 400 },
      );
    }
    if (!Number.isInteger(monthlyRent) || monthlyRent <= 0) {
      return NextResponse.json(
        { error: "Monthly rent must be a whole number above 0" },
        { status: 400 },
      );
    }

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const [updated] = await prisma.$transaction([
      prisma.student.update({
        where: { id },
        data: { name, roomNo, phone: phone || null, monthlyRent },
      }),
      prisma.user.update({
        where: { id: student.userId },
        data: { name },
      }),
      prisma.payment.updateMany({
        where: { studentId: id },
        data: { name },
      }),
    ]);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update student error:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
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
        { error: "Invalid student id" },
        { status: 400 },
      );
    }

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.payment.deleteMany({ where: { studentId: id } }),
      prisma.student.delete({ where: { id } }),
      prisma.user.delete({ where: { id: student.userId } }),
    ]);

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Delete student error:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 },
    );
  }
}
