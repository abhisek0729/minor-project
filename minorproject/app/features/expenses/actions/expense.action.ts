"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import { expensesTable } from "@/app/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export interface ExpenseInput {
  name: string;
  amount: number;
  location: string;
  type: string;
}

export async function addExpenseAction(data: ExpenseInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be signed in to add and track expenses.",
      };
    }

    if (!data.name?.trim() || !data.location?.trim() || !data.amount || data.amount <= 0) {
      return {
        success: false,
        message: "Please provide a valid expense name, location, and amount.",
      };
    }

    const [newExpense] = await db
      .insert(expensesTable)
      .values({
        userId: Number(session.user.id),
        name: data.name.trim(),
        amount: Math.round(data.amount),
        location: data.location.trim(),
        type: data.type || "other",
      })
      .returning();

    return {
      success: true,
      message: `${newExpense.name} (NPR ${newExpense.amount}) saved successfully!`,
      data: newExpense,
    };
  } catch (error: any) {
    console.error("Error saving expense:", error);
    return {
      success: false,
      message: error?.message || "Failed to save expense.",
    };
  }
}

export async function getUserExpensesAction() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, data: [] };
    }

    const expenses = await db
      .select()
      .from(expensesTable)
      .where(eq(expensesTable.userId, Number(session.user.id)))
      .orderBy(desc(expensesTable.createdAt))
      .limit(10);

    return { success: true, data: expenses };
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return { success: false, data: [] };
  }
}
