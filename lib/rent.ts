type RentStudent = {
  monthlyRent: number;
  joinDate: Date;
  leaveDate?: Date | null;
};

function getBillingEnd(student: RentStudent): Date {
  const now = new Date();
  if (student.leaveDate && student.leaveDate < now) {
    return student.leaveDate;
  }
  return now;
}

export function calculateRentStatus(
  student: RentStudent,
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

  const billingEnd = getBillingEnd(student);
  const lastBilledMonth = new Date(
    billingEnd.getFullYear(),
    billingEnd.getMonth(),
    1,
  );
  const joinMonth = new Date(joinDate.getFullYear(), joinDate.getMonth(), 1);

  const monthsElapsedCount = Math.max(
    (lastBilledMonth.getFullYear() - joinMonth.getFullYear()) * 12 +
      (lastBilledMonth.getMonth() - joinMonth.getMonth()) +
      1,
    0,
  );

  let remainingPayments = totalPaid;
  const monthsElapsed: {
    month: string;
    status: "paid" | "partial" | "unpaid";
  }[] = [];

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

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function getMonthlyBreakdown(
  student: RentStudent,
  payments: { amount: number; month: number; year: number }[],
) {
  const { monthlyRent, joinDate } = student;
  const billingEnd = getBillingEnd(student);

  const result: {
    month: string;
    monthNum: number;
    year: number;
    status: "paid" | "partial" | "unpaid";
    paidAmount: number;
    dueAmount: number;
  }[] = [];

  let year = joinDate.getFullYear();
  let month = joinDate.getMonth(); // 0-indexed

  const endYear = billingEnd.getFullYear();
  const endMonth = billingEnd.getMonth();

  while (year < endYear || (year === endYear && month <= endMonth)) {
    const paidForThisMonth = payments
      .filter((p) => p.month === month + 1 && p.year === year)
      .reduce((sum, p) => sum + p.amount, 0);

    let status: "paid" | "partial" | "unpaid";
    if (paidForThisMonth >= monthlyRent) {
      status = "paid";
    } else if (paidForThisMonth > 0) {
      status = "partial";
    } else {
      status = "unpaid";
    }

    result.push({
      month: `${MONTH_NAMES[month]} ${year}`,
      monthNum: month + 1,
      year,
      status,
      paidAmount: paidForThisMonth,
      dueAmount: monthlyRent,
    });

    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  return result;
}
