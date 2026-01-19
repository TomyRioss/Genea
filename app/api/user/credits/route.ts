import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    return NextResponse.json({ credits: session.user.credits || 0 });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener créditos" }, { status: 500 });
  }
}
