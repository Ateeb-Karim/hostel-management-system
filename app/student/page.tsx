import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { calculateRentStatus } from "@/lib/rent";

export default async function StudentPage() {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== "student") {
    redirect("/login");
  }

  const student = await prisma.student.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      payments: true,
    },
  });

  if (!student) {
    redirect("/login");
  }

  const rentStatus = calculateRentStatus(student, student.payments);

  return (
    <div>
      <h1>StudentDashboard {student.name}</h1>
      <p>Monthly Rent: {student.monthlyRent}</p>
      <p>Join Date: {student.joinDate.toDateString()}</p>
      <p>Rent Status: {rentStatus.status}</p>
    </div>
  );
}
