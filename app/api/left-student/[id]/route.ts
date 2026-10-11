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
        { error: "Invalid student id" },
        { status: 400 },
      );
    }

    const body = await req.json();

    const student = await prisma.student.findUnique({ where: { id } });
    console.log(student);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (!body.leaveDate) {
      const reinstated = await prisma.student.update({
        where: { id },
        data: { leaveDate: null },
      });
      return NextResponse.json(reinstated);
    }

    const leaveDate = new Date(body.leaveDate);

    if (Number.isNaN(leaveDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid leave date" },
        { status: 400 },
      );
    }
    if (leaveDate.getTime() > Date.now() + ONE_DAY) {
      return NextResponse.json(
        { error: "Leave date can't be in the future" },
        { status: 400 },
      );
    }
    if (
      leaveDate.toISOString().slice(0, 10) <
      student.joinDate.toISOString().slice(0, 10)
    ) {
      return NextResponse.json(
        { error: "Leave date can't be before the join date" },
        { status: 400 },
      );
    }

    const updated = await prisma.student.update({
      where: { id },
      data: { leaveDate },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Leave student error:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 },
    );
  }
}
