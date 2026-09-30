import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, role } = body;

  if (!name || !email || !password || !role) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role: role as "student" | "warden",
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }
}
