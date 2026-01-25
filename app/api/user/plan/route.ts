import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type UserPlanResponse = {
  plan: {
    id: string;
    name: string;
    displayName: string;
    price: number;
    currency: string;
    creditsPerMonth: number;
    features: string[];
  } | null;
  subscription: {
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  } | null;
  isFreePlan: boolean;
};

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      include: { plan: true },
    });

    if (!subscription) {
      return NextResponse.json<UserPlanResponse>({
        plan: null,
        subscription: null,
        isFreePlan: true,
      });
    }

    return NextResponse.json<UserPlanResponse>({
      plan: {
        id: subscription.plan.id,
        name: subscription.plan.name,
        displayName: subscription.plan.displayName,
        price: subscription.plan.price,
        currency: subscription.plan.currency,
        creditsPerMonth: subscription.plan.creditsPerMonth,
        features: subscription.plan.features as string[],
      },
      subscription: {
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      },
      isFreePlan: false,
    });
  } catch (error) {
    console.error("Error fetching user plan:", error);
    return NextResponse.json({ error: "Error al obtener el plan" }, { status: 500 });
  }
}
