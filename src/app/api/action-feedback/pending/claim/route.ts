import { NextResponse } from "next/server";
import { claimDueAction } from "@/features/action-feedback/services/due-action-feedback-service";

export async function POST() {
  const result = await claimDueAction();

  if (result.status === "unauthenticated") {
    return NextResponse.json(
      {
        status: "error",
        code: "unauthenticated",
        message: "请先登录后再查看待反馈行动。",
      },
      { status: 401 },
    );
  }

  if (result.status === "claimed") {
    return NextResponse.json(result);
  }

  if (result.status === "none") {
    return NextResponse.json(result);
  }

  return NextResponse.json(
    {
      status: "error",
      code: "claim_failed",
      message: "暂时无法查看待反馈行动，请稍后再试。",
    },
    { status: 500 },
  );
}
