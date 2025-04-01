import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import { z } from "zod";

const onboardingSchema = z.object({
  monthlyIncome: z.string(),
  occupation: z.string(),
  financialGoals: z.array(z.string()),
  riskTolerance: z.string(),
  existingInvestments: z.string(),
  monthlyExpenses: z.string(),
  savingsTarget: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = onboardingSchema.parse(body);

    const client = await clientPromise;
    const db = client.db("credence");

    await db.collection("users").updateOne(
      { email: session.user.email },
      {
        $set: {
          onboarding: {
            ...data,
            completedAt: new Date(),
          },
        },
      }
    );

    return NextResponse.json(
      { message: "Onboarding data saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Onboarding error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
