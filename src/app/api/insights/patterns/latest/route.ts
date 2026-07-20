import { NextResponse } from "next/server";
import { getLatestBehavioralObservation } from "@/features/insight/services/proactive-pattern-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getLatestBehavioralObservation();
  const status =
    result.status === "unauthenticated"
      ? 401
      : result.status === "error"
        ? 500
        : 200;

  return NextResponse.json(result, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
