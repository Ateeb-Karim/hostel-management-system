export function calculateRentStatus(
  student: { monthlyRent: number; joinDate: Date },
  payments: { amount: number }[],
): {
  monthsElapsed: number;
  totalPaid: number;
  totalDue: number;
  remaining: number;
  status: "paid" | "partial" | "pending" | "overpaid";
} {
  const { monthlyRent, joinDate } = student;

  const totalPaid = payments.reduce((acc, pay) => acc + pay.amount, 0);

  const date = new Date();
  const totalMonths = date.getFullYear() * 12 + date.getMonth();
  const joinTotalMonths = joinDate.getFullYear() * 12 + joinDate.getMonth();

  const monthsElapsed = Math.max(totalMonths - joinTotalMonths + 1, 0);

  const totalDue = monthsElapsed * monthlyRent;
  const remaining = totalDue - totalPaid;

  const status: "paid" | "partial" | "pending" | "overpaid" =
    remaining === 0
      ? "paid"
      : remaining < 0
        ? "overpaid"
        : totalPaid > 0
          ? "partial"
          : "pending";

  return {
    monthsElapsed,
    totalPaid,
    totalDue,
    remaining,
    status,
  };
}
