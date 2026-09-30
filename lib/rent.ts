export function calculateRentStatus(
  student: { monthlyRent: number; joinDate: Date },
  payments: { amount: number }[],
): {
  monthsElapsed: { month: string; status: "paid" | "partial" | "unpaid" }[];
  totalPaid: number;
  totalDue: number;
  remaining: number;
  status: "paid" | "partial" | "pending" | "overpaid";
} {
  const { monthlyRent, joinDate } = student;

  const totalPaid = payments.reduce((acc, pay) => acc + pay.amount, 0);

  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const joinMonth = new Date(joinDate.getFullYear(), joinDate.getMonth(), 1);

  const monthsElapsedCount = Math.max(
    (currentMonth.getFullYear() - joinMonth.getFullYear()) * 12 +
      (currentMonth.getMonth() - joinMonth.getMonth()) +
      1,
    0,
  );

  let remainingPayments = totalPaid;
  const monthsElapsed: { month: string; status: "paid" | "partial" | "unpaid" }[] = [];

  for (let index = 0; index < monthsElapsedCount; index += 1) {
    const monthDate = new Date(
      joinMonth.getFullYear(),
      joinMonth.getMonth() + index,
      1,
    );

    const paidThisMonth = Math.min(monthlyRent, remainingPayments);
    remainingPayments = Math.max(remainingPayments - monthlyRent, 0);

    monthsElapsed.push({
      month: monthDate.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      }),
      status:
        paidThisMonth === monthlyRent
          ? "paid"
          : paidThisMonth > 0
            ? "partial"
            : "unpaid",
    });
  }

  const totalDue = monthsElapsedCount * monthlyRent;
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
