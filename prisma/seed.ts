import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const wardenPassword = await bcrypt.hash("warden123", 10);
  const studentPassword = await bcrypt.hash("student123", 10);

  await prisma.user.upsert({
    where: { loginId: "warden" },
    update: {},
    create: {
      loginId: "warden",
      password: wardenPassword,
      role: "WARDEN",
    },
  });

  await prisma.user.upsert({
    where: { loginId: "room12-ali" },
    update: {},
    create: {
      loginId: "room12-ali",
      password: studentPassword,
      role: "STUDENT",
      student: {
        create: {
          name: "Ali Raza",
          roomNo: "12",
          phone: "03001234567",
          monthlyRent: 8000,
          joinDate: new Date("2026-01-01"),
        },
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
